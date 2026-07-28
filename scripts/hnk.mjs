#!/usr/bin/env node
/**
 * hnk.mjs — single-entry zero-dependency toolchain for hnk-operated projects.
 *
 * Implements the frozen interfaces of:
 *   skill/03-okf.md            — machine-readable frontmatter subset (§3), llm.txt (§5)
 *   skill/08-conversation-archive.md — archive commands, card fields, raw format, upload
 *   skill/09-visual-assets.md  — media index, visuals commands, upload
 *   skill/02-context-architecture.md — target layout, gitignore contract
 *   skill/06-lifecycle-and-versioning.md §6 — lifecycle verification hooks
 *
 * Zero dependencies: node: builtins only (fs, path, crypto, process, util)
 * plus the global fetch of Node 18+. ESM. Copied verbatim into target
 * projects as scripts/hnk.mjs.
 *
 * Node support floor: 18.17 (tested matrix 18/20/22 in CI).
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import process from 'node:process';

// ---------------------------------------------------------------------------
// Node version gate
// ---------------------------------------------------------------------------

const MIN_NODE = [18, 17, 0];

/** @returns {string|null} error message when the running Node is too old */
function nodeVersionError() {
  const parts = process.versions.node.split('.').map((n) => parseInt(n, 10));
  for (let i = 0; i < 3; i++) {
    const have = parts[i] || 0;
    if (have > MIN_NODE[i]) return null;
    if (have < MIN_NODE[i]) {
      return (
        `hnk.mjs needs Node >= ${MIN_NODE.join('.')} — you are running ` +
        `${process.versions.node}. Please upgrade Node (https://nodejs.org) and re-run.`
      );
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Frontmatter machine-readable subset (skill/03 §3)
// ---------------------------------------------------------------------------

/**
 * Named subset-violation error. `code` is stable and machine-matchable.
 */
class FrontmatterError extends Error {
  /**
   * @param {string} code
   * @param {string} message
   * @param {number} [line] 1-based line number inside the file, when known
   */
  constructor(code, message, line) {
    super(line ? `${code} (line ${line}): ${message}` : `${code}: ${message}`);
    this.name = 'FrontmatterError';
    this.code = code;
    this.line = line;
  }
}

/** Characters that force double-quoting when a value begins with them (§3.2). */
const YAML_LEADING = new Set(['[', '{', '>', '|', '&', '*', '!', '%', '@', '"', "'", '#']);

/**
 * @typedef {string|number|boolean|null} SubsetScalar
 * @typedef {SubsetScalar|SubsetScalar[]|Record<string, SubsetScalar>} SubsetValue
 * @typedef {{value: SubsetValue, src: string}} FmEntry  src = original serialized value text (byte-stable round trip)
 * @typedef {{order: string[], entries: Record<string, FmEntry>}} Frontmatter
 * @typedef {{fm: Frontmatter, body: string, fmText: string}} ParsedDoc
 */

/**
 * Parse one scalar token (already trimmed of structural context).
 * @param {string} src
 * @param {number} [line]
 * @returns {SubsetScalar}
 */
function parseScalar(src, line) {
  if (src === '') throw new FrontmatterError('E_EMPTY_VALUE', 'empty value is not in the subset', line);
  if (src.startsWith('"')) {
    // Double-quoted string with \" and \\ escapes only.
    let out = '';
    let i = 1;
    for (; i < src.length; i++) {
      const c = src[i];
      if (c === '\\') {
        const n = src[i + 1];
        if (n === '"' || n === '\\') { out += n; i++; continue; }
        throw new FrontmatterError('E_BAD_ESCAPE', `unsupported escape \\${n ?? ''}`, line);
      }
      if (c === '"') break;
      out += c;
    }
    if (i >= src.length) throw new FrontmatterError('E_UNTERMINATED_STRING', 'missing closing double quote', line);
    if (i !== src.length - 1) {
      throw new FrontmatterError('E_TRAILING_CONTENT', `unexpected content after closing quote: ${src.slice(i + 1)}`, line);
    }
    return out;
  }
  const first = src[0];
  if (first === '|' || first === '>') {
    throw new FrontmatterError('E_MULTILINE_SCALAR', 'multiline scalars (| and >) are forbidden by §3 rule 6', line);
  }
  if (first === '&' || first === '*' || first === '!') {
    throw new FrontmatterError('E_ANCHOR_TAG', 'anchors, aliases and tags are forbidden by §3 rule 6', line);
  }
  if (first === '#') throw new FrontmatterError('E_COMMENT', 'comments are forbidden by §3 rule 6', line);
  if (YAML_LEADING.has(first)) {
    throw new FrontmatterError('E_QUOTING', `value beginning with ${first} must be double-quoted (§3.2)`, line);
  }
  if (src !== src.trim()) {
    throw new FrontmatterError('E_QUOTING', 'value with leading/trailing spaces must be double-quoted (§3.2)', line);
  }
  if (/: /.test(src)) {
    throw new FrontmatterError('E_QUOTING', 'value containing ": " must be double-quoted (§3.2)', line);
  }
  if (src === 'null') return null; // reserved "not yet" sentinel, never quoted
  if (src === 'true') return true;
  if (src === 'false') return false;
  if (/^-?\d+$/.test(src)) return parseInt(src, 10);
  if (/^-?\d+\.\d+$/.test(src)) return parseFloat(src);
  return src;
}

/**
 * Split flow content on top-level commas, honoring double quotes.
 * Nested flow collections are a subset violation.
 * @param {string} inner
 * @param {number} [line]
 * @returns {string[]}
 */
function splitFlowItems(inner, line) {
  const items = [];
  let cur = '';
  let inStr = false;
  for (let i = 0; i < inner.length; i++) {
    const c = inner[i];
    if (inStr) {
      cur += c;
      if (c === '\\') { cur += inner[i + 1] ?? ''; i++; continue; }
      if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') { inStr = true; cur += c; continue; }
    if (c === '[' || c === '{') {
      throw new FrontmatterError('E_NESTED_FLOW', 'nested flow collections are forbidden (§3 rules 4-5)', line);
    }
    if (c === ',') { items.push(cur.trim()); cur = ''; continue; }
    cur += c;
  }
  if (inStr) throw new FrontmatterError('E_UNTERMINATED_STRING', 'missing closing double quote', line);
  items.push(cur.trim());
  return items;
}

/**
 * Parse a serialized value: scalar, inline flow list, or inline flow map.
 * @param {string} src
 * @param {number} [line]
 * @returns {SubsetValue}
 */
function parseValue(src, line) {
  if (src.startsWith('[')) {
    if (!src.endsWith(']')) throw new FrontmatterError('E_BAD_FLOW', 'inline list must close with ] on the same line', line);
    const inner = src.slice(1, -1).trim();
    if (inner === '') return [];
    return splitFlowItems(inner, line).map((item) => {
      if (item === '') throw new FrontmatterError('E_BAD_FLOW', 'empty list item', line);
      return parseScalar(item, line);
    });
  }
  if (src.startsWith('{')) {
    if (!src.endsWith('}')) throw new FrontmatterError('E_BAD_FLOW', 'inline map must close with } on the same line', line);
    const inner = src.slice(1, -1).trim();
    /** @type {Record<string, SubsetScalar>} */
    const map = {};
    if (inner === '') return map;
    for (const item of splitFlowItems(inner, line)) {
      const m = /^([a-z0-9_]+): (.+)$/.exec(item);
      if (!m) throw new FrontmatterError('E_BAD_FLOW', `inline map entry is not "key: value": ${item}`, line);
      if (Object.prototype.hasOwnProperty.call(map, m[1])) {
        throw new FrontmatterError('E_DUPLICATE_KEY', `duplicate map key ${m[1]}`, line);
      }
      map[m[1]] = parseScalar(m[2], line);
    }
    return map;
  }
  return parseScalar(src, line);
}

/**
 * Parse the frontmatter block plus body of a document.
 * @param {string} text full file content
 * @returns {ParsedDoc}
 */
function parseDocument(text) {
  const lines = text.split('\n');
  if (lines[0] !== '---') {
    throw new FrontmatterError('E_NO_FRONTMATTER', 'file must begin with a --- frontmatter fence (§3 rule 1)', 1);
  }
  let close = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '---') { close = i; break; }
  }
  if (close === -1) throw new FrontmatterError('E_UNTERMINATED', 'frontmatter block never closes with ---');
  /** @type {Frontmatter} */
  const fm = { order: [], entries: {} };
  for (let i = 1; i < close; i++) {
    const raw = lines[i];
    const lineNo = i + 1;
    if (raw.trim() === '') throw new FrontmatterError('E_BLANK_LINE', 'blank lines inside frontmatter are not in the subset', lineNo);
    if (/^\s*#/.test(raw)) throw new FrontmatterError('E_COMMENT', 'comments are forbidden by §3 rule 6', lineNo);
    if (/^\s*-\s/.test(raw) || raw.trim() === '-') {
      throw new FrontmatterError('E_BLOCK_LIST', 'block lists are forbidden by §3 rule 6', lineNo);
    }
    if (/^\s/.test(raw)) {
      throw new FrontmatterError('E_NESTED_BLOCK', 'indented (nested block) entries are forbidden by §3 rules 2 and 6', lineNo);
    }
    const m = /^([^:]+):(.*)$/.exec(raw);
    if (!m) throw new FrontmatterError('E_BAD_ENTRY', `entry is not one "key: value" line: ${raw}`, lineNo);
    const key = m[1];
    if (!/^[a-z0-9_]+$/.test(key)) {
      throw new FrontmatterError('E_BAD_KEY', `key must be lowercase ASCII letters, digits, underscores: ${key}`, lineNo);
    }
    const rest = m[2];
    if (rest === '' || rest === ' ') {
      throw new FrontmatterError('E_EMPTY_VALUE', `key ${key} has no value; a block construct here is forbidden (§3 rule 6)`, lineNo);
    }
    if (!rest.startsWith(' ')) {
      throw new FrontmatterError('E_BAD_ENTRY', `missing space after colon in "${raw}"`, lineNo);
    }
    if (Object.prototype.hasOwnProperty.call(fm.entries, key)) {
      throw new FrontmatterError('E_DUPLICATE_KEY', `duplicate key ${key} (§3 rule 2)`, lineNo);
    }
    const src = rest.slice(1);
    const value = parseValue(src, lineNo);
    if (key === 'summary') {
      if (!src.startsWith('"')) {
        throw new FrontmatterError('E_SUMMARY_UNQUOTED', 'summary must always be double-quoted (§3.2)', lineNo);
      }
    }
    fm.order.push(key);
    fm.entries[key] = { value, src };
  }
  if (!fm.order.includes('summary')) {
    throw new FrontmatterError('E_SUMMARY_MISSING', 'summary is required on every document (§3 rule 7)');
  }
  const fmText = lines.slice(0, close + 1).join('\n') + '\n';
  const body = lines.slice(close + 1).join('\n');
  return { fm, body, fmText };
}

/**
 * Does a plain string need double-quoting under §3.2 (plus reinterpretation
 * protection: values that would parse as null/boolean/number are quoted so a
 * string stays a string)?
 * @param {string} s
 */
function needsQuoting(s) {
  if (s === '') return true;
  if (YAML_LEADING.has(s[0]) || s[0] === '-' || /^\s|\s$/.test(s)) return true;
  if (/: /.test(s) || s.includes(',') || s.includes(']') || s.includes('}')) return true;
  if (s === 'null' || s === 'true' || s === 'false') return true;
  if (/^-?\d+(\.\d+)?$/.test(s)) return true;
  return false;
}

/** @param {string} s */
function quoteString(s) {
  return '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
}

/**
 * Canonical serialization of one subset value.
 * @param {SubsetValue} v
 * @param {{forceQuote?: boolean}} [opts] forceQuote: always double-quote strings (summary rule)
 * @returns {string}
 */
function serializeValue(v, opts = {}) {
  if (v === null) return 'null';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'string') {
    return opts.forceQuote || needsQuoting(v) ? quoteString(v) : v;
  }
  if (Array.isArray(v)) {
    return '[' + v.map((item) => serializeValue(item)).join(', ') + ']';
  }
  if (typeof v === 'object') {
    return '{' + Object.entries(v).map(([k, val]) => `${k}: ${serializeValue(val)}`).join(', ') + '}';
  }
  throw new FrontmatterError('E_BAD_VALUE', `unserializable value: ${String(v)}`);
}

/**
 * Serialize a frontmatter object back to its block. When an entry retains its
 * parsed `src`, that text is reused — round trip is byte-stable for compliant
 * input.
 * @param {Frontmatter} fm
 * @returns {string} including both --- fences, trailing newline
 */
function serializeFrontmatter(fm) {
  const lines = ['---'];
  for (const key of fm.order) {
    const e = fm.entries[key];
    const src = e.src !== undefined
      ? e.src
      : serializeValue(e.value, { forceQuote: key === 'summary' });
    lines.push(`${key}: ${src}`);
  }
  lines.push('---');
  return lines.join('\n') + '\n';
}

/**
 * Build a frontmatter object from plain values (canonical serialization).
 * @param {Record<string, SubsetValue>} obj
 * @returns {Frontmatter}
 */
function fmFromObject(obj) {
  /** @type {Frontmatter} */
  const fm = { order: [], entries: {} };
  for (const [k, v] of Object.entries(obj)) {
    fm.order.push(k);
    fm.entries[k] = { value: v, src: serializeValue(v, { forceQuote: k === 'summary' }) };
  }
  return fm;
}

/**
 * Key-line substitution (skill/03 §3.4): replace only the named key lines
 * inside the frontmatter block — never a full re-serialization.
 * @param {string} fileText
 * @param {Record<string, SubsetValue>} updates key → new value
 * @returns {string} updated file text
 */
function substituteKeyLines(fileText, updates) {
  const lines = fileText.split('\n');
  if (lines[0] !== '---') throw new FrontmatterError('E_NO_FRONTMATTER', 'cannot substitute: no frontmatter fence', 1);
  let close = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '---') { close = i; break; }
  }
  if (close === -1) throw new FrontmatterError('E_UNTERMINATED', 'cannot substitute: frontmatter never closes');
  const pending = new Set(Object.keys(updates));
  for (let i = 1; i < close; i++) {
    const m = /^([a-z0-9_]+): /.exec(lines[i]);
    if (m && pending.has(m[1])) {
      const key = m[1];
      lines[i] = `${key}: ${serializeValue(updates[key], { forceQuote: key === 'summary' })}`;
      pending.delete(key);
    }
  }
  if (pending.size > 0) {
    throw new FrontmatterError('E_KEY_NOT_FOUND', `key line(s) not found for substitution: ${[...pending].join(', ')}`);
  }
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Identifiers (skill/08 §3, skill/09 §3)
// ---------------------------------------------------------------------------

/**
 * Kebab-case slug from free text; at most `maxWords` words (guideline: 5).
 * @param {string} text
 * @param {number} [maxWords]
 */
function slugify(text, maxWords = 5) {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, maxWords);
  return words.join('-');
}

/**
 * UTC timestamp segment YYYYMMDD-HHMMSS.
 * @param {Date} [date]
 */
function timestampSegment(date = new Date()) {
  const p = (n, w = 2) => String(n).padStart(w, '0');
  return (
    `${date.getUTCFullYear()}${p(date.getUTCMonth() + 1)}${p(date.getUTCDate())}` +
    `-${p(date.getUTCHours())}${p(date.getUTCMinutes())}${p(date.getUTCSeconds())}`
  );
}

/**
 * Generate a session/media identifier: `<prefix>-YYYYMMDD-HHMMSS-slug`.
 * @param {'session'|'media'} prefix
 * @param {string} title slug source
 * @param {Date} [date]
 */
function makeId(prefix, title, date = new Date()) {
  const slug = slugify(title);
  if (!slug) throw new Error(`cannot derive a slug from ${JSON.stringify(title)}`);
  return `${prefix}-${timestampSegment(date)}-${slug}`;
}

const SESSION_ID_RE = /^session-\d{8}-\d{6}-[a-z0-9]+(-[a-z0-9]+)*$/;
const MEDIA_ID_RE = /^media-\d{8}-\d{6}-[a-z0-9]+(-[a-z0-9]+)*$/;

/** ISO-8601 UTC instant to the second. @param {Date} [date] */
function isoInstant(date = new Date()) {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

// ---------------------------------------------------------------------------
// Redaction and secret scan (skill/08 §7)
// ---------------------------------------------------------------------------

/**
 * Credential patterns. Each has a `kind` used in the `[REDACTED:<kind>]`
 * mask and in scan reports (the matched value itself is never printed).
 * @type {{kind: string, re: RegExp}[]}
 */
const SECRET_PATTERNS = [
  { kind: 'aws-access-key-id', re: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g },
  { kind: 'private-key-block', re: /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?(?:-----END [A-Z ]*PRIVATE KEY-----|$)/g },
  { kind: 'bearer-token', re: /\bBearer\s+[A-Za-z0-9._~+/=-]{16,}/g },
  {
    kind: 'credential-assignment',
    // KEY=value / key: value / "key": "value" for api key / token / secret / password …
    re: /\b([A-Za-z0-9_.-]*(?:api[_-]?key|apikey|access[_-]?key|secret[_-]?access[_-]?key|auth[_-]?token|token|secret|passwd|password|pwd)[A-Za-z0-9_.-]*)("?\s*[:=]\s*"?)(?!null\b|true\b|false\b|\[REDACTED)[^\s"',;]{6,}/gi,
  },
];

/**
 * Mask secret values at write time. Assignment-style matches keep the key
 * name and mask only the value.
 * @param {string} text
 * @returns {{text: string, kinds: string[]}} masked text + kinds found
 */
function redactSecrets(text) {
  const kinds = new Set();
  let out = text;
  for (const { kind, re } of SECRET_PATTERNS) {
    out = out.replace(re, (...args) => {
      kinds.add(kind);
      if (kind === 'credential-assignment') {
        const [, key, sep] = args;
        return `${key}${sep}[REDACTED:${kind}]`;
      }
      return `[REDACTED:${kind}]`;
    });
  }
  return { text: out, kinds: [...kinds] };
}

/**
 * Scan without modifying (upload gate). `[REDACTED:...]` masks do not count.
 * @param {string} text
 * @returns {string[]} pattern kinds found
 */
function scanSecrets(text) {
  const kinds = [];
  for (const { kind, re } of SECRET_PATTERNS) {
    re.lastIndex = 0;
    if (re.test(text)) kinds.push(kind);
  }
  return kinds;
}

// ---------------------------------------------------------------------------
// SigV4 request signing (skill/08 §9) — node:crypto only
// ---------------------------------------------------------------------------

/** @param {crypto.BinaryLike} data */
function sha256Hex(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * @param {crypto.BinaryLike | crypto.KeyObject} key
 * @param {string} data
 */
function hmac(key, data) {
  return crypto.createHmac('sha256', key).update(data).digest();
}

/**
 * Build the AWS SigV4 canonical request, string-to-sign, and Authorization
 * header for a single request. Region `auto`, service `s3` for Cloudflare R2.
 *
 * @param {{
 *   method: string, host: string, pathName: string, payload: Buffer|string,
 *   accessKeyId: string, secretAccessKey: string,
 *   region?: string, service?: string, date?: Date,
 * }} req
 * @returns {{
 *   headers: Record<string, string>, canonicalRequest: string,
 *   stringToSign: string, signature: string, amzDate: string,
 * }}
 */
function sigv4Sign(req) {
  const region = req.region || 'auto';
  const service = req.service || 's3';
  const date = req.date || new Date();
  const amzDate = date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = sha256Hex(req.payload);
  const canonicalHeaders =
    `host:${req.host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n`;
  const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
  const canonicalRequest = [
    req.method,
    req.pathName,
    '', // canonical query string (none used)
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join('\n');
  const kDate = hmac(`AWS4${req.secretAccessKey}`, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  const kSigning = hmac(kService, 'aws4_request');
  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');
  const headers = {
    'x-amz-date': amzDate,
    'x-amz-content-sha256': payloadHash,
    Authorization:
      `AWS4-HMAC-SHA256 Credential=${req.accessKeyId}/${credentialScope}, ` +
      `SignedHeaders=${signedHeaders}, Signature=${signature}`,
  };
  return { headers, canonicalRequest, stringToSign, signature, amzDate };
}

// ---------------------------------------------------------------------------
// Filesystem helpers, root resolution, run report
// ---------------------------------------------------------------------------

/** @param {string} p */
function exists(p) {
  try { fs.statSync(p); return true; } catch { return false; }
}

/** @param {string} p */
function readText(p) {
  return fs.readFileSync(p, 'utf8');
}

/** @param {string} p @param {string} text */
function writeText(p, text) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, text);
}

/**
 * Recursively list files under dir (relative paths, POSIX separators).
 * @param {string} dir
 * @param {(rel: string) => boolean} [skip] called with the relative path of a directory; return true to skip it
 * @returns {string[]}
 */
function walkFiles(dir, skip) {
  /** @type {string[]} */
  const out = [];
  if (!exists(dir)) return out;
  /** @param {string} rel */
  const recurse = (rel) => {
    const abs = rel ? path.join(dir, rel) : dir;
    for (const entry of fs.readdirSync(abs, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const childRel = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        if (skip && skip(childRel)) continue;
        recurse(childRel);
      } else if (entry.isFile()) {
        out.push(childRel);
      }
    }
  };
  recurse('');
  return out;
}

/**
 * Resolve the target project root: --root if given, else the nearest ancestor
 * of cwd containing `.context/`, else cwd.
 * @param {string|undefined} cliRoot
 * @returns {string} absolute path
 */
function resolveRoot(cliRoot) {
  if (cliRoot) return path.resolve(cliRoot);
  let dir = process.cwd();
  for (;;) {
    if (exists(path.join(dir, '.context'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return process.cwd();
    dir = parent;
  }
}

/**
 * Collector for human-readable output plus the machine-greppable summary
 * line every command ends with.
 */
class RunReport {
  /** @param {string} command */
  constructor(command) {
    this.command = command;
    /** @type {string[]} */ this.failures = [];
    /** @type {string[]} */ this.warnings = [];
    /** @type {string[]} */ this.infos = [];
  }
  /** @param {string} msg */ fail(msg) { this.failures.push(msg); }
  /** @param {string} msg */ warn(msg) { this.warnings.push(msg); }
  /** @param {string} msg */ info(msg) { this.infos.push(msg); }
  /** @param {RunReport} other */
  absorb(other) {
    this.failures.push(...other.failures);
    this.warnings.push(...other.warnings);
    this.infos.push(...other.infos);
  }
  /**
   * Print everything and return the exit code (0 ok, 1 failures).
   * @param {(line: string) => void} [log]
   */
  flush(log = console.log) {
    for (const m of this.infos) log(m);
    for (const m of this.warnings) log(`warning: ${m}`);
    for (const m of this.failures) log(`FAIL: ${m}`);
    const ok = this.failures.length === 0;
    log(
      `hnk-summary: ${this.command} ${ok ? 'ok' : 'fail'} ` +
      `failures=${this.failures.length} warnings=${this.warnings.length}`
    );
    return ok ? 0 : 1;
  }
}

// ---------------------------------------------------------------------------
// Project paths and shared readers
// ---------------------------------------------------------------------------

const GITIGNORE_BEGIN = '# hnk:begin';
const GITIGNORE_END = '# hnk:end';
const IGNORED_DIRS = ['.context/_archive/sessions', '.context/_media/files'];
const UPLOAD_SIZE_CAP = 100 * 1024 * 1024; // 100 MiB (skill/08 §9)

/** @param {string} root */
function projectPaths(root) {
  const context = path.join(root, '.context');
  return {
    root,
    context,
    global: path.join(context, '_global'),
    profile: path.join(context, '_global', 'project-profile.md'),
    archive: path.join(context, '_archive'),
    archiveIndex: path.join(context, '_archive', 'index.md'),
    sessions: path.join(context, '_archive', 'sessions'),
    media: path.join(context, '_media'),
    mediaIndex: path.join(context, '_media', 'index.md'),
    mediaFiles: path.join(context, '_media', 'files'),
    llmTxt: path.join(root, 'llm.txt'),
    gitignore: path.join(root, '.gitignore'),
  };
}

/**
 * List committed markdown documents under `.context/` (raw transcripts and
 * media payloads excluded), as project-root-relative POSIX paths.
 * @param {string} root
 * @returns {string[]}
 */
function committedContextDocs(root) {
  const contextDir = path.join(root, '.context');
  return walkFiles(contextDir, (rel) => rel === '_archive/sessions' || rel === '_media/files')
    .filter((rel) => rel.endsWith('.md'))
    .map((rel) => `.context/${rel}`);
}

/**
 * Read the project profile frontmatter, or null when absent/unparseable.
 * @param {string} root
 * @returns {Frontmatter|null}
 */
function readProfile(root) {
  const p = projectPaths(root).profile;
  if (!exists(p)) return null;
  try { return parseDocument(readText(p)).fm; } catch { return null; }
}

/**
 * Living layer directory from the profile's `living_layer` field.
 * @param {string} root
 * @returns {string|null} absolute path, or null when unrecorded
 */
function livingLayerDir(root) {
  const fm = readProfile(root);
  const rel = fm && fm.entries.living_layer ? fm.entries.living_layer.value : null;
  if (typeof rel !== 'string' || !rel) return null;
  return path.join(root, rel);
}

// ---------------------------------------------------------------------------
// Archive: cards (skill/08)
// ---------------------------------------------------------------------------

const CARD_SECTIONS = ['## Goal', '## Key decisions', '## Deltas', '## Affected files', '## Follow-ups'];

/**
 * @typedef {{
 *   id: string, file: string, fm: Frontmatter, body: string, text: string,
 * }} Card
 */

/**
 * Load every session card in `_archive/` (files other than index.md).
 * Unparseable files are reported, not thrown.
 * @param {string} root
 * @returns {{cards: Card[], errors: string[]}}
 */
function loadCards(root) {
  const P = projectPaths(root);
  /** @type {Card[]} */
  const cards = [];
  /** @type {string[]} */
  const errors = [];
  if (!exists(P.archive)) return { cards, errors };
  for (const name of fs.readdirSync(P.archive).sort()) {
    if (!name.endsWith('.md') || name === 'index.md') continue;
    const file = path.join(P.archive, name);
    if (!fs.statSync(file).isFile()) continue;
    const text = readText(file);
    try {
      const { fm, body } = parseDocument(text);
      const id = String(fm.entries.id ? fm.entries.id.value : '');
      cards.push({ id, file, fm, body, text });
    } catch (e) {
      errors.push(`.context/_archive/${name}: ${/** @type {Error} */ (e).message}`);
    }
  }
  return { cards, errors };
}

/** @param {Card} card @param {string} key */
function cardValue(card, key) {
  const e = card.fm.entries[key];
  return e === undefined ? undefined : e.value;
}

/** Newest-first ordering by `started` (falls back to id). @param {Card[]} cards */
function sortCardsNewestFirst(cards) {
  return [...cards].sort((a, b) => {
    const sa = String(cardValue(a, 'started') ?? '');
    const sb = String(cardValue(b, 'started') ?? '');
    if (sa !== sb) return sb.localeCompare(sa);
    return b.id.localeCompare(a.id);
  });
}

/**
 * `archive new` — create the draft card (stage 1 of two-stage writing,
 * skill/08 §5) plus the raw placeholder.
 * @param {string} root
 * @param {{title: string, domain?: string, topic?: string, mode?: string, now?: Date}} opts
 * @returns {{id: string, cardPath: string, rawPath: string}}
 */
function archiveNew(root, opts) {
  if (!opts.title) throw new UsageError('archive new requires --title <title>');
  const now = opts.now || new Date();
  const id = makeId('session', opts.title, now);
  const P = projectPaths(root);
  const cardPath = path.join(P.archive, `${id}.md`);
  const rawRel = `.context/_archive/sessions/${id}.full.md`;
  const rawPath = path.join(root, rawRel);
  if (exists(cardPath)) throw new Error(`card already exists: ${cardPath}`);
  const mode = opts.mode || 'confirm-spec-changes-only';
  const author = process.env.HNK_AUTHOR || process.env.USER || 'unknown';
  const agent = process.env.HNK_AGENT || 'unknown@unknown';
  /** @type {Record<string, SubsetValue>} */
  const fields = {
    id,
    type: 'session',
    started: isoInstant(now),
    ended: null,
    meta: { author, agent },
  };
  if (opts.domain) fields.domain = opts.domain;
  if (opts.topic) fields.topic = opts.topic;
  fields.mode = mode;
  fields.visibility = 'private';
  fields.status = 'local-only';
  fields.raw_fidelity = 'reconstructed';
  fields.raw_local = rawRel;
  fields.raw_remote = null;
  fields.raw_sha256 = null;
  fields.summary = `Draft session card: ${opts.title}`;
  const body =
    '\n' +
    `# ${id}\n\n` +
    '## Goal\n\n' +
    `${opts.title} (mode: ${mode})\n\n` +
    '## Key decisions\n\n' +
    '- (draft — completed at session end)\n\n' +
    '## Deltas\n\n' +
    '- (draft — completed at session end)\n\n' +
    '## Affected files\n\n' +
    '- (draft — completed at session end)\n\n' +
    '## Follow-ups\n\n' +
    '- (draft — completed at session end)\n';
  writeText(cardPath, serializeFrontmatter(fmFromObject(fields)) + body);
  if (!exists(rawPath)) {
    writeText(
      rawPath,
      `# ${id} — normalized raw\n\n` +
      `- agent: ${agent}\n` +
      '- fidelity: reconstructed\n' +
      '- format: hnk-raw v1\n\n' +
      '## note\n\n' +
      'Placeholder created by `archive new`; snapshots land here at every milestone.\n'
    );
  }
  return { id, cardPath, rawPath };
}

/**
 * Render the archive index content (skill/08 §11) from cards.
 * @param {Card[]} cards
 * @returns {string}
 */
function renderArchiveIndex(cards) {
  const sorted = sortCardsNewestFirst(cards);
  const fm = fmFromObject({
    id: 'archive-index',
    type: 'archive-index',
    status: 'active',
    summary: `Archive index: ${sorted.length} session card(s), regenerated by \`node scripts/hnk.mjs archive index\`.`,
  });
  const header = '| id | date | summary | domain/topic | mode | status | raw_fidelity | visibility |';
  const sep = '| --- | --- | --- | --- | --- | --- | --- | --- |';
  const rows = sorted.map((c) => {
    const started = String(cardValue(c, 'started') ?? '');
    const date = started.slice(0, 10) || '—';
    const domain = cardValue(c, 'domain');
    const topic = cardValue(c, 'topic');
    const dt = domain || topic ? `${domain ?? ''}${domain && topic ? '/' : ''}${topic ?? ''}` : '—';
    const cell = (v) => String(v ?? '—').replace(/\|/g, '\\|');
    const idCell = `<a id="${c.id}"></a>[${c.id}](${c.id}.md)`;
    return `| ${idCell} | ${date} | ${cell(cardValue(c, 'summary'))} | ${cell(dt)} | ${cell(cardValue(c, 'mode'))} | ${cell(cardValue(c, 'status'))} | ${cell(cardValue(c, 'raw_fidelity'))} | ${cell(cardValue(c, 'visibility'))} |`;
  });
  return (
    serializeFrontmatter(fm) +
    '\n# Archive Index\n\n' +
    (rows.length ? [header, sep, ...rows].join('\n') + '\n' : 'No session cards yet.\n')
  );
}

/**
 * `archive index` — fully regenerate `_archive/index.md`.
 * @param {string} root
 * @returns {{count: number, indexPath: string}}
 */
function archiveIndex(root) {
  const P = projectPaths(root);
  const { cards, errors } = loadCards(root);
  if (errors.length) throw new Error(`cannot index; unparseable card(s):\n  ${errors.join('\n  ')}`);
  writeText(P.archiveIndex, renderArchiveIndex(cards));
  return { count: cards.length, indexPath: P.archiveIndex };
}

/**
 * `archive verify` — the checks of skill/08 §12.
 * @param {string} root
 * @param {RunReport} rep
 */
function archiveVerify(root, rep) {
  const P = projectPaths(root);
  const { cards, errors } = loadCards(root);
  for (const e of errors) rep.fail(`card frontmatter: ${e}`);

  // duplicate ids + id scheme
  /** @type {Map<string, number>} */
  const seen = new Map();
  for (const c of cards) {
    seen.set(c.id, (seen.get(c.id) || 0) + 1);
    if (!SESSION_ID_RE.test(c.id)) rep.fail(`card id violates the session id scheme (08 §3): ${c.id}`);
    const base = path.basename(c.file, '.md');
    if (base !== c.id) rep.fail(`card file name does not match its id: ${base}.md vs id ${c.id}`);
  }
  for (const [id, n] of seen) if (n > 1) rep.fail(`duplicate session id: ${id} (${n} cards)`);

  const drafts = [];
  const localOnly = [];
  for (const c of cards) {
    const rawLocal = cardValue(c, 'raw_local');
    const rawPath = typeof rawLocal === 'string' ? path.join(root, rawLocal) : null;
    const sha = cardValue(c, 'raw_sha256');
    const remote = cardValue(c, 'raw_remote');
    const status = cardValue(c, 'status');

    // raw_sha256 mismatch (H1)
    if (rawPath && exists(rawPath) && typeof sha === 'string') {
      const actual = sha256Hex(fs.readFileSync(rawPath));
      if (actual !== sha) rep.fail(`raw_sha256 mismatch for ${c.id}: card records ${sha.slice(0, 12)}…, file is ${actual.slice(0, 12)}…`);
    }
    // raw missing + raw_remote null + status not raw-lost → propose transition
    if (rawPath && !exists(rawPath) && remote === null && status !== 'raw-lost') {
      rep.fail(`raw missing for ${c.id} with raw_remote null — propose status: raw-lost (08 §4.4); current status: ${String(status)}`);
    }
    // draft cards
    if (cardValue(c, 'ended') === null) drafts.push(c.id);
    // body sections (H3)
    for (const section of CARD_SECTIONS) {
      if (!new RegExp(`^${section}\\s*$`, 'm').test(c.body)) {
        rep.fail(`card ${c.id} body is missing section "${section}" (08 §4.5)`);
      }
    }
    if (status === 'local-only' && rawPath && exists(rawPath)) localOnly.push(c);
  }
  if (drafts.length) {
    rep.warn(`recovery sweep: ${drafts.length} draft card(s) (ended: null): ${drafts.join(', ')} — complete or recover them (08 §5)`);
  }

  // orphan raws
  const cardIds = new Set(cards.map((c) => c.id));
  if (exists(P.sessions)) {
    for (const name of fs.readdirSync(P.sessions).sort()) {
      const m = /^(.+)\.full\.md$/.exec(name);
      if (!m) continue;
      if (!cardIds.has(m[1])) rep.warn(`recovery sweep: orphan raw with no card: .context/_archive/sessions/${name} (08 §5)`);
    }
  }

  // local-only accumulation (advisory)
  if (localOnly.length > 20) {
    rep.warn(`local-only accumulation: ${localOnly.length} local-only raws (>20) — a machine loss would orphan them; consider upload or backup (08 §12)`);
  }
  const now = Date.now();
  for (const c of localOnly) {
    const started = Date.parse(String(cardValue(c, 'started') ?? ''));
    if (Number.isFinite(started) && now - started > 30 * 24 * 3600 * 1000) {
      rep.warn(`local-only accumulation: oldest local-only raw (${c.id}) is older than 30 days — consider upload or backup (08 §12)`);
      break;
    }
  }

  // index staleness
  if (!exists(P.archiveIndex)) {
    if (cards.length) rep.warn('archive index missing — run `node scripts/hnk.mjs archive index`');
  } else if (errors.length === 0) {
    const current = readText(P.archiveIndex);
    if (current !== renderArchiveIndex(cards)) {
      rep.warn('archive index out of date relative to card frontmatter — run `node scripts/hnk.mjs archive index` (08 §12)');
    }
  }
}

// ---------------------------------------------------------------------------
// Archive: capture (skill/08 §6, §8)
// ---------------------------------------------------------------------------

/** CLI misuse — exits with code 2. */
class UsageError extends Error {}

/**
 * One-line summary of a tool call's arguments — never the full payload.
 * @param {string} name tool name
 * @param {unknown} input tool input object
 * @returns {string}
 */
function toolCallSummary(name, input) {
  let hint = '';
  if (input && typeof input === 'object') {
    const obj = /** @type {Record<string, unknown>} */ (input);
    for (const key of ['file_path', 'path', 'command', 'pattern', 'url', 'query', 'description', 'title']) {
      const v = obj[key];
      if (typeof v === 'string' && v.trim()) {
        hint = `${key}: ${v.replace(/\s+/g, ' ').trim()}`;
        break;
      }
    }
    if (!hint) {
      const keys = Object.keys(obj);
      if (keys.length) hint = `args: ${keys.join(', ')}`;
    }
  }
  if (hint.length > 100) hint = hint.slice(0, 97) + '…';
  return hint ? `${name} — ${hint} (summary only)` : `${name} (summary only)`;
}

/**
 * Extract plain text from a Claude Code message content field.
 * Tool payloads (tool_use inputs, tool_result contents) are summarized only.
 * @param {unknown} content
 * @returns {{texts: string[], toolCalls: string[]}}
 */
function extractContent(content) {
  /** @type {string[]} */ const texts = [];
  /** @type {string[]} */ const toolCalls = [];
  if (typeof content === 'string') {
    if (content.trim()) texts.push(content.trim());
    return { texts, toolCalls };
  }
  if (Array.isArray(content)) {
    for (const item of content) {
      if (!item || typeof item !== 'object') continue;
      const o = /** @type {Record<string, unknown>} */ (item);
      if (o.type === 'text' && typeof o.text === 'string' && o.text.trim()) {
        texts.push(o.text.trim());
      } else if (o.type === 'tool_use') {
        toolCalls.push(toolCallSummary(String(o.name ?? 'unknown-tool'), o.input));
      } else if (o.type === 'tool_result') {
        // Result payloads are never transcribed (08 §6).
      }
    }
  }
  return { texts, toolCalls };
}

/**
 * Normalize a Claude Code session JSONL transcript into hnk-raw v1 turns.
 * @param {string} jsonl
 * @returns {{speaker: 'human'|'agent'|'note', timestamp: string|null, text: string, toolCalls: string[]}[]}
 */
function parseClaudeCodeJsonl(jsonl) {
  /** @type {{speaker: 'human'|'agent'|'note', timestamp: string|null, text: string, toolCalls: string[]}[]} */
  const turns = [];
  for (const line of jsonl.split('\n')) {
    if (!line.trim()) continue;
    /** @type {Record<string, unknown>} */
    let obj;
    try { obj = JSON.parse(line); } catch { continue; } // tolerate non-JSON lines
    const type = obj.type;
    if (type !== 'user' && type !== 'assistant') continue;
    const message = /** @type {Record<string, unknown>|undefined} */ (obj.message);
    const role = message && typeof message.role === 'string' ? message.role : type;
    const speaker = role === 'assistant' ? 'agent' : 'human';
    const timestamp = typeof obj.timestamp === 'string' ? obj.timestamp : null;
    const { texts, toolCalls } = extractContent(message ? message.content : undefined);
    if (!texts.length && !toolCalls.length) continue;
    turns.push({ speaker, timestamp, text: texts.join('\n\n'), toolCalls });
  }
  return turns;
}

/**
 * Render an hnk-raw v1 document (skill/08 §6).
 * @param {{id: string, agent: string, fidelity: 'captured'|'reconstructed',
 *   turns: {speaker: string, timestamp: string|null, text: string, toolCalls: string[]}[]}} raw
 */
function renderRaw(raw) {
  const parts = [
    `# ${raw.id} — normalized raw`,
    '',
    `- agent: ${raw.agent}`,
    `- fidelity: ${raw.fidelity}`,
    '- format: hnk-raw v1',
    '',
  ];
  for (const turn of raw.turns) {
    parts.push(turn.timestamp ? `## ${turn.speaker} — ${turn.timestamp}` : `## ${turn.speaker}`);
    parts.push('');
    if (turn.text) { parts.push(turn.text); parts.push(''); }
    for (const call of turn.toolCalls) { parts.push(`- tool-call: ${call}`); }
    if (turn.toolCalls.length) parts.push('');
  }
  return parts.join('\n').replace(/\n+$/, '\n');
}

/**
 * `archive capture` — normalize a transcript into a `captured` raw, apply
 * redaction, replace the session's raw, update the card by key-line
 * substitution (raw_sha256 + raw_fidelity: captured).
 * @param {string} root
 * @param {{transcript: string, format?: string, id?: string}} opts
 * @returns {{id: string, rawPath: string, sha256: string, format: string, redacted: string[]}}
 */
function archiveCapture(root, opts) {
  if (!opts.transcript) throw new UsageError('archive capture requires --transcript <path>');
  const transcriptPath = path.resolve(opts.transcript);
  if (!exists(transcriptPath)) throw new Error(`transcript not found: ${transcriptPath}`);
  const ext = path.extname(transcriptPath).toLowerCase();
  const format = opts.format || (ext === '.jsonl' ? 'claude-code-jsonl' : ext === '.md' ? 'markdown' : 'plaintext');
  if (!['claude-code-jsonl', 'markdown', 'plaintext'].includes(format)) {
    throw new UsageError(`unknown --format ${format}; v1 formats: claude-code-jsonl, markdown, plaintext (08 §8)`);
  }

  // Target card: --id, else the newest draft card (ended: null).
  const { cards } = loadCards(root);
  /** @type {Card|undefined} */
  let card;
  if (opts.id) {
    card = cards.find((c) => c.id === opts.id);
    if (!card) throw new Error(`no card found for id ${opts.id}`);
  } else {
    card = sortCardsNewestFirst(cards.filter((c) => cardValue(c, 'ended') === null))[0];
    if (!card) throw new Error('no draft card (ended: null) to capture into — pass --id <session-id> or run `archive new` first');
  }
  const id = card.id;
  const agent = (() => {
    const meta = cardValue(card, 'meta');
    if (meta && typeof meta === 'object' && !Array.isArray(meta) && typeof meta.agent === 'string') return meta.agent;
    return process.env.HNK_AGENT || 'unknown@unknown';
  })();

  const source = readText(transcriptPath);
  let rawText;
  if (format === 'claude-code-jsonl') {
    const turns = parseClaudeCodeJsonl(source);
    rawText = renderRaw({ id, agent, fidelity: 'captured', turns });
  } else if (format === 'markdown') {
    // Already-normalized markdown transcript — passthrough (08 §8).
    rawText = source;
  } else {
    // plaintext — passthrough wrapped in the §6 header, as one note turn
    // (speakers are unknown in a plain-text transcript).
    rawText = renderRaw({
      id, agent, fidelity: 'captured',
      turns: [{ speaker: 'note', timestamp: null, text: source.trim(), toolCalls: [] }],
    });
  }
  const { text: redactedText, kinds } = redactSecrets(rawText);

  const rawRel = typeof cardValue(card, 'raw_local') === 'string'
    ? String(cardValue(card, 'raw_local'))
    : `.context/_archive/sessions/${id}.full.md`;
  const rawPath = path.join(root, rawRel);
  writeText(rawPath, redactedText); // repeat runs replace the snapshot (08 §8)
  const sha256 = sha256Hex(fs.readFileSync(rawPath));
  writeText(card.file, substituteKeyLines(card.text, { raw_sha256: sha256, raw_fidelity: 'captured' }));
  return { id, rawPath, sha256, format, redacted: kinds };
}

// ---------------------------------------------------------------------------
// Upload provider: Cloudflare R2 via SigV4 (skill/08 §9, skill/09 §8)
// ---------------------------------------------------------------------------

/**
 * @typedef {{accountId: string, accessKeyId: string, secretAccessKey: string,
 *   bucket: string, publicBaseUrl: string|null}} R2Config
 */

/** @returns {R2Config} @param {NodeJS.ProcessEnv} [env] */
function r2ConfigFromEnv(env = process.env) {
  const missing = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET']
    .filter((k) => !env[k]);
  if (missing.length) {
    throw new Error(`missing environment variable(s) for the r2 provider: ${missing.join(', ')} (08 §9)`);
  }
  return {
    accountId: /** @type {string} */ (env.R2_ACCOUNT_ID),
    accessKeyId: /** @type {string} */ (env.R2_ACCESS_KEY_ID),
    secretAccessKey: /** @type {string} */ (env.R2_SECRET_ACCESS_KEY),
    bucket: /** @type {string} */ (env.R2_BUCKET),
    publicBaseUrl: env.R2_PUBLIC_BASE_URL ? env.R2_PUBLIC_BASE_URL.replace(/\/$/, '') : null,
  };
}

/**
 * Buffered single PUT with SigV4 signing; two retries with exponential
 * backoff; dry-run performs signing without sending.
 * @param {R2Config} cfg
 * @param {string} objectKey e.g. `sessions/<id>.full.md`
 * @param {Buffer} payload
 * @param {{dryRun?: boolean, fetchImpl?: typeof fetch, backoffMs?: number}} [opts]
 * @returns {Promise<{sent: boolean, remote: string, attempts: number}>}
 */
async function r2Put(cfg, objectKey, payload, opts = {}) {
  const host = `${cfg.accountId}.r2.cloudflarestorage.com`;
  const pathName = `/${cfg.bucket}/${objectKey.split('/').map(encodeURIComponent).join('/')}`;
  const remote = cfg.publicBaseUrl
    ? `${cfg.publicBaseUrl}/${objectKey}`
    : `r2://${cfg.bucket}/${objectKey}`;
  const signed = sigv4Sign({
    method: 'PUT', host, pathName, payload,
    accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey,
  });
  if (opts.dryRun) return { sent: false, remote, attempts: 0 };
  const doFetch = opts.fetchImpl || fetch;
  const backoff = opts.backoffMs ?? 1000;
  let lastError = null;
  for (let attempt = 0; attempt <= 2; attempt++) { // initial try + at most two retries
    if (attempt > 0) await new Promise((r) => setTimeout(r, backoff * 2 ** (attempt - 1)));
    try {
      // Re-sign per attempt so x-amz-date stays fresh.
      const attemptSigned = attempt === 0 ? signed : sigv4Sign({
        method: 'PUT', host, pathName, payload,
        accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey,
      });
      const res = await doFetch(`https://${host}${pathName}`, {
        method: 'PUT',
        headers: { ...attemptSigned.headers, 'content-length': String(payload.length) },
        body: payload,
      });
      if (res.ok) return { sent: true, remote, attempts: attempt + 1 };
      lastError = new Error(`HTTP ${res.status}`);
    } catch (e) {
      lastError = e;
    }
  }
  throw new Error(`upload failed after retries for ${objectKey}: ${/** @type {Error} */ (lastError).message}`);
}

/**
 * `archive upload` — upload eligible raws (skill/08 §9). On success the card
 * is updated by key-line substitution only; on failure no state changes.
 * @param {string} root
 * @param {{provider?: string, only?: string, dryRun?: boolean,
 *   env?: NodeJS.ProcessEnv, fetchImpl?: typeof fetch, backoffMs?: number}} opts
 * @param {RunReport} rep
 */
async function archiveUpload(root, opts, rep) {
  const provider = opts.provider || 'r2';
  if (provider !== 'r2') throw new UsageError(`unknown --provider ${provider}; v1 supports: r2`);
  const cfg = r2ConfigFromEnv(opts.env);
  const { cards, errors } = loadCards(root);
  for (const e of errors) rep.fail(`card frontmatter: ${e}`);
  let eligible = cards.filter(
    (c) => cardValue(c, 'visibility') === 'uploadable' && cardValue(c, 'status') === 'local-only'
  );
  if (opts.only) {
    const requested = cards.find((c) => c.id === opts.only);
    if (!requested) { rep.fail(`--only ${opts.only}: no such card`); eligible = []; }
    else if (!eligible.includes(requested)) {
      rep.fail(
        `--only ${opts.only}: not eligible (needs visibility: uploadable and status: local-only; ` +
        `found visibility: ${String(cardValue(requested, 'visibility'))}, status: ${String(cardValue(requested, 'status'))})`
      );
      eligible = [];
    } else eligible = [requested];
  }
  if (!eligible.length) { rep.info('archive upload: no eligible cards (visibility: uploadable, status: local-only)'); return; }

  for (const card of eligible) {
    const rawRel = String(cardValue(card, 'raw_local') ?? '');
    const rawPath = path.join(root, rawRel);
    if (!exists(rawPath)) { rep.warn(`skip ${card.id}: raw missing at ${rawRel}`); continue; }
    const payload = fs.readFileSync(rawPath);
    // Secret scan gate — findings block, naming card and kind, never the value.
    const kinds = scanSecrets(payload.toString('utf8'));
    if (kinds.length) {
      rep.fail(`upload BLOCKED for ${card.id}: secret scan found pattern kind(s): ${kinds.join(', ')} (08 §7) — nothing sent`);
      continue;
    }
    if (payload.length > UPLOAD_SIZE_CAP) {
      rep.warn(`skip ${card.id}: raw is ${payload.length} bytes, over the 100 MiB single-PUT cap — manual upload needed (08 §9)`);
      appendFollowUp(card, `Raw exceeds the 100 MiB upload cap (${payload.length} bytes) — upload \`${rawRel}\` manually and record \`raw_remote\` + \`status: uploaded\` by hand.`);
      continue;
    }
    const objectKey = `sessions/${card.id}.full.md`;
    try {
      const result = await r2Put(cfg, objectKey, payload, {
        dryRun: opts.dryRun, fetchImpl: opts.fetchImpl, backoffMs: opts.backoffMs,
      });
      if (opts.dryRun) {
        rep.info(`dry-run: would PUT ${objectKey} (${payload.length} bytes) → ${result.remote}; card untouched`);
      } else {
        writeText(card.file, substituteKeyLines(readText(card.file), { raw_remote: result.remote, status: 'uploaded' }));
        rep.info(`uploaded ${card.id} → ${result.remote} (attempt ${result.attempts})`);
      }
    } catch (e) {
      rep.fail(`upload failed for ${card.id}: ${/** @type {Error} */ (e).message} — card left untouched`);
    }
  }
}

/**
 * Append a manual-upload note to a card's Follow-ups section (08 §9 point 3).
 * @param {Card} card
 * @param {string} note
 */
function appendFollowUp(card, note) {
  const text = readText(card.file);
  const line = `- ${note}`;
  if (text.includes(line)) return; // idempotent
  const idx = text.indexOf('## Follow-ups');
  if (idx === -1) {
    writeText(card.file, text.replace(/\n*$/, '\n') + `\n## Follow-ups\n\n${line}\n`);
    return;
  }
  const insertAt = text.indexOf('\n', idx) + 1;
  writeText(card.file, text.slice(0, insertAt) + `\n${line}\n` + text.slice(insertAt).replace(/^\n/, ''));
}

// ---------------------------------------------------------------------------
// Visuals: media index (skill/09)
// ---------------------------------------------------------------------------

const MEDIA_FIELDS = ['type', 'path_local', 'sha256', 'bytes', 'created', 'referenced_by', 'remote', 'alt'];
const BINARY_EXTS = new Set([
  '.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.tiff', '.heic', '.ico',
  '.mp4', '.mov', '.avi', '.mkv', '.mp3', '.wav', '.flac',
  '.pdf', '.zip', '.gz', '.tar', '.7z', '.bin', '.exe', '.dll', '.so', '.dylib',
  '.woff', '.woff2', '.ttf', '.otf', '.eot', '.psd', '.sketch',
]);

/**
 * @typedef {{id: string, fields: Record<string, string>}} MediaEntry
 *   field values are kept as serialized strings; `referenced_by` uses inline
 *   list syntax, `remote` may be the literal `null`.
 */

/**
 * Parse `.context/_media/index.md` into entries.
 * @param {string} root
 * @returns {{entries: MediaEntry[], errors: string[]}}
 */
function loadMediaIndex(root) {
  const P = projectPaths(root);
  /** @type {MediaEntry[]} */ const entries = [];
  /** @type {string[]} */ const errors = [];
  if (!exists(P.mediaIndex)) return { entries, errors };
  let body;
  try { body = parseDocument(readText(P.mediaIndex)).body; }
  catch (e) { errors.push(`media index frontmatter: ${/** @type {Error} */ (e).message}`); return { entries, errors }; }
  const lines = body.split('\n');
  /** @type {MediaEntry|null} */ let current = null;
  for (const line of lines) {
    const h = /^## (\S+)\s*$/.exec(line);
    if (h) {
      current = { id: h[1], fields: {} };
      entries.push(current);
      continue;
    }
    const row = /^\| ([a-z_]+) \| (.*) \|$/.exec(line);
    if (row && current && MEDIA_FIELDS.includes(row[1])) current.fields[row[1]] = row[2];
  }
  for (const e of entries) {
    for (const f of MEDIA_FIELDS) {
      if (!(f in e.fields)) errors.push(`media entry ${e.id}: missing field row "${f}" (09 §4.1)`);
    }
  }
  return { entries, errors };
}

/**
 * Deterministic media index serialization: fixed field order, entries
 * ascending by id (09 §4.3).
 * @param {MediaEntry[]} entries
 */
function renderMediaIndex(entries) {
  const sorted = [...entries].sort((a, b) => a.id.localeCompare(b.id));
  const fm = fmFromObject({
    id: 'media-index',
    type: 'media-index',
    status: 'active',
    summary: `Media index: ${sorted.length} registered binary asset(s); regenerated by \`node scripts/hnk.mjs visuals index\` (merge — alt and remote preserved).`,
  });
  const parts = [serializeFrontmatter(fm), '\n# Media Index\n'];
  for (const e of sorted) {
    parts.push(`\n## ${e.id}\n`);
    parts.push('\n| Field | Value |');
    parts.push('\n| --- | --- |');
    for (const f of MEDIA_FIELDS) parts.push(`\n| ${f} | ${e.fields[f] ?? ''} |`);
    parts.push('\n');
  }
  if (!sorted.length) parts.push('\nNo binary assets registered yet.\n');
  return parts.join('');
}

/** Parse an inline-list field value like `[a, b]`. @param {string} src */
function parseInlineListField(src) {
  const t = src.trim();
  if (!t.startsWith('[') || !t.endsWith(']')) return [];
  const inner = t.slice(1, -1).trim();
  return inner ? inner.split(',').map((s) => s.trim()).filter(Boolean) : [];
}

/** GitHub-style heading anchor. @param {string} heading */
function headingAnchor(heading) {
  return heading.toLowerCase().replace(/[^a-z0-9 _-]/g, '').trim().replace(/ +/g, '-');
}

/**
 * Documents scanned for media-id references: committed `.context/` docs plus
 * Living layer markdown; the media index itself is excluded.
 * @param {string} root
 * @returns {string[]} project-root-relative paths
 */
function referenceScanDocs(root) {
  const docs = committedContextDocs(root).filter((p) => p !== '.context/_media/index.md');
  const living = livingLayerDir(root);
  if (living && exists(living)) {
    const rel = path.relative(root, living).split(path.sep).join('/');
    for (const f of walkFiles(living)) {
      if (f.endsWith('.md')) docs.push(`${rel}/${f}`);
    }
  }
  return docs;
}

/**
 * Fresh `referenced_by` scan: for every media id, each citing location as
 * `path#nearest-heading-anchor` (or bare path when no heading precedes).
 * @param {string} root
 * @param {string[]} ids
 * @returns {Map<string, string[]>} id → sorted unique locations
 */
function scanReferences(root, ids) {
  /** @type {Map<string, Set<string>>} */
  const found = new Map(ids.map((id) => [id, new Set()]));
  for (const rel of referenceScanDocs(root)) {
    const lines = readText(path.join(root, rel)).split('\n');
    let currentAnchor = '';
    for (const line of lines) {
      const h = /^#{1,6} (.+)$/.exec(line);
      if (h) currentAnchor = headingAnchor(h[1]);
      for (const id of ids) {
        if (line.includes(id)) {
          found.get(id)?.add(currentAnchor ? `${rel}#${currentAnchor}` : rel);
        }
      }
    }
  }
  return new Map([...found].map(([id, set]) => [id, [...set].sort()]));
}

/**
 * `visuals add` — place the payload, compute identity, append the entry.
 * @param {string} root
 * @param {{file: string, domain?: string, topic?: string, alt?: string, now?: Date}} opts
 * @returns {{id: string, dest: string, sha256: string, bytes: number, duplicateOf?: string}}
 */
function visualsAdd(root, opts) {
  if (!opts.file) throw new UsageError('visuals add requires a <file> argument');
  if (!opts.alt || !opts.alt.trim()) {
    throw new UsageError('visuals add requires --alt <text> — alt is mandatory and cannot be derived (09 §4.2); non-interactive runs hard-error without it');
  }
  const src = path.resolve(opts.file);
  if (!exists(src)) throw new Error(`file not found: ${src}`);
  const P = projectPaths(root);
  const payload = fs.readFileSync(src);
  const digest = sha256Hex(payload);
  const { entries, errors } = loadMediaIndex(root);
  if (errors.length) throw new Error(`media index unreadable:\n  ${errors.join('\n  ')}`);
  const dup = entries.find((e) => e.fields.sha256 === digest);
  if (dup) {
    return { id: dup.id, dest: '', sha256: digest, bytes: payload.length, duplicateOf: dup.id };
  }
  const now = opts.now || new Date();
  const filename = path.basename(src);
  const id = makeId('media', path.parse(filename).name, now);
  if (entries.some((e) => e.id === id)) throw new Error(`media id collision: ${id} already registered — retry (ids are second-precision)`);
  const segments = ['files'];
  if (opts.domain) segments.push(opts.domain);
  if (opts.topic) segments.push(opts.topic);
  const pathLocal = [...segments, filename].join('/');
  const dest = path.join(P.media, ...segments, filename);
  if (exists(dest)) throw new Error(`refusing to overwrite: ${dest} already exists (09 §6)`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  fs.rmSync(src);
  /** @type {MediaEntry} */
  const entry = {
    id,
    fields: {
      type: mediaType(filename),
      path_local: pathLocal,
      sha256: digest,
      bytes: String(payload.length),
      created: isoInstant(now),
      referenced_by: '[]',
      remote: 'null',
      alt: opts.alt.trim().replace(/\s+/g, ' '),
    },
  };
  writeText(P.mediaIndex, renderMediaIndex([...entries, entry]));
  return { id, dest, sha256: digest, bytes: payload.length };
}

/** Coarse media type from extension. @param {string} filename */
function mediaType(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.tiff', '.heic', '.ico'].includes(ext)) return 'image';
  if (['.mp4', '.mov', '.avi', '.mkv'].includes(ext)) return 'video';
  if (['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx'].includes(ext)) return 'document';
  return 'other';
}

/**
 * `visuals index` — merge regeneration (09 §4.3): recalculate sha256, bytes,
 * referenced_by; preserve alt, remote, type, path_local, created verbatim.
 * @param {string} root
 * @param {RunReport} rep
 */
function visualsIndex(root, rep) {
  const P = projectPaths(root);
  const { entries, errors } = loadMediaIndex(root);
  for (const e of errors) rep.fail(`media index: ${e}`);
  const refs = scanReferences(root, entries.map((e) => e.id));
  for (const e of entries) {
    const payloadPath = path.join(P.media, e.fields.path_local ?? '');
    if (e.fields.path_local && exists(payloadPath)) {
      const payload = fs.readFileSync(payloadPath);
      e.fields.sha256 = sha256Hex(payload);
      e.fields.bytes = String(payload.length);
    } // payload gone: keep recorded values — the entry is the surviving record
    const list = refs.get(e.id) || [];
    e.fields.referenced_by = `[${list.join(', ')}]`;
  }
  // Report — never auto-create — unregistered files (alt cannot be derived).
  const registered = new Set(entries.map((e) => e.fields.path_local));
  for (const rel of walkFiles(P.mediaFiles)) {
    if (!registered.has(`files/${rel}`)) {
      rep.warn(`unregistered payload (no entry created — alt cannot be derived): .context/_media/files/${rel} — register via \`visuals add\` (09 §4.3)`);
    }
  }
  writeText(P.mediaIndex, renderMediaIndex(entries));
  rep.info(`visuals index: ${entries.length} entr${entries.length === 1 ? 'y' : 'ies'} merge-regenerated`);
}

/**
 * Is this file binary, by extension or non-UTF8 sniff?
 * @param {string} absPath
 */
function sniffBinary(absPath) {
  if (BINARY_EXTS.has(path.extname(absPath).toLowerCase())) return true;
  let sample;
  try {
    const fd = fs.openSync(absPath, 'r');
    const buf = Buffer.alloc(8192);
    const n = fs.readSync(fd, buf, 0, 8192, 0);
    fs.closeSync(fd);
    sample = buf.subarray(0, n);
  } catch { return false; }
  if (sample.length === 0) return false;
  if (sample.includes(0)) return true;
  try {
    // Tolerate a multibyte char cut at the sample boundary.
    new TextDecoder('utf-8', { fatal: true }).decode(sample.subarray(0, Math.max(0, sample.length - 3)));
    return false;
  } catch { return true; }
}

/**
 * `visuals verify` — the checks of skill/09 §7.
 * @param {string} root
 * @param {RunReport} rep
 */
function visualsVerify(root, rep) {
  const P = projectPaths(root);
  const { entries, errors } = loadMediaIndex(root);
  for (const e of errors) rep.fail(`media index: ${e}`);

  // 1. stray binaries under .context outside _media/files (sessions excluded)
  for (const rel of walkFiles(P.context, (r) => r === '_media/files' || r === '_archive/sessions')) {
    const abs = path.join(P.context, rel);
    if (sniffBinary(abs)) {
      rep.fail(`binary content outside _media/files: .context/${rel} — the format-based rule (09 §2) was bypassed`);
    }
  }
  // 2. unregistered payloads
  const registered = new Set(entries.map((e) => e.fields.path_local));
  for (const rel of walkFiles(P.mediaFiles)) {
    if (!registered.has(`files/${rel}`)) {
      rep.fail(`unregistered payload: .context/_media/files/${rel} has no index entry (09 §7 check 2)`);
    }
  }
  /** @type {Map<string, number>} */
  const idCount = new Map();
  const refs = scanReferences(root, entries.map((e) => e.id));
  for (const e of entries) {
    idCount.set(e.id, (idCount.get(e.id) || 0) + 1);
    if (!MEDIA_ID_RE.test(e.id)) rep.fail(`media id violates the id scheme (09 §3): ${e.id}`);
    // 3. payload gone and remote null
    const payloadPath = path.join(P.media, e.fields.path_local ?? '');
    if ((!e.fields.path_local || !exists(payloadPath)) && (e.fields.remote ?? 'null') === 'null') {
      rep.warn(`content unreachable for ${e.id}: path_local missing and remote is null — the record survives as metadata + alt (09 §7 check 3)`);
    }
    // 4. alt required
    if (!e.fields.alt || !e.fields.alt.trim()) rep.fail(`entry ${e.id} has a missing or empty alt (09 §7 check 4)`);
    // 5. referenced_by staleness
    const stored = parseInlineListField(e.fields.referenced_by ?? '[]').sort();
    const fresh = refs.get(e.id) || [];
    if (JSON.stringify(stored) !== JSON.stringify(fresh)) {
      rep.warn(`referenced_by stale for ${e.id} — run \`node scripts/hnk.mjs visuals index\` (09 §7 check 5)`);
    }
  }
  // 5b. raw-path references to files/ in committed documents are failures
  for (const rel of referenceScanDocs(root)) {
    if (rel.startsWith('.context/') && readText(path.join(root, rel)).includes('_media/files/')) {
      rep.fail(`raw-path reference to _media/files/ in ${rel} — reference by media id anchor instead (09 §5)`);
    }
  }
  // 6. duplicate ids
  for (const [id, n] of idCount) if (n > 1) rep.fail(`duplicate media id: ${id} (${n} entries)`);
}

/**
 * `visuals upload` — payloads of entries with remote null (skill/09 §8).
 * @param {string} root
 * @param {{provider?: string, only?: string, dryRun?: boolean,
 *   env?: NodeJS.ProcessEnv, fetchImpl?: typeof fetch, backoffMs?: number}} opts
 * @param {RunReport} rep
 */
async function visualsUpload(root, opts, rep) {
  const provider = opts.provider || 'r2';
  if (provider !== 'r2') throw new UsageError(`unknown --provider ${provider}; v1 supports: r2`);
  const cfg = r2ConfigFromEnv(opts.env);
  const P = projectPaths(root);
  const { entries, errors } = loadMediaIndex(root);
  for (const e of errors) rep.fail(`media index: ${e}`);
  let targets = entries.filter((e) => (e.fields.remote ?? 'null') === 'null');
  if (opts.only) {
    targets = targets.filter((e) => e.id === opts.only);
    if (!targets.length) rep.warn(`--only ${opts.only}: no matching entry with remote: null`);
  }
  if (!targets.length) { rep.info('visuals upload: no entries with remote: null'); return; }
  for (const entry of targets) {
    const payloadPath = path.join(P.media, entry.fields.path_local ?? '');
    if (!entry.fields.path_local || !exists(payloadPath)) {
      rep.warn(`skip ${entry.id}: payload missing at ${entry.fields.path_local ?? '(unset)'} — manual restore/upload needed`);
      continue;
    }
    const payload = fs.readFileSync(payloadPath);
    if (payload.length > UPLOAD_SIZE_CAP) {
      rep.warn(`skip ${entry.id}: payload is ${payload.length} bytes, over the 100 MiB single-PUT cap — manual upload advised (09 §8)`);
      continue;
    }
    const filename = path.basename(entry.fields.path_local);
    const objectKey = `media/${entry.id}/${filename}`;
    try {
      const result = await r2Put(cfg, objectKey, payload, {
        dryRun: opts.dryRun, fetchImpl: opts.fetchImpl, backoffMs: opts.backoffMs,
      });
      if (opts.dryRun) {
        rep.info(`dry-run: would PUT ${objectKey} (${payload.length} bytes) → ${result.remote}; index untouched`);
      } else {
        replaceMediaRemote(P.mediaIndex, entry.id, result.remote);
        rep.info(`uploaded ${entry.id} → ${result.remote} (attempt ${result.attempts})`);
      }
    } catch (e) {
      rep.fail(`upload failed for ${entry.id}: ${/** @type {Error} */ (e).message} — entry left untouched`);
    }
  }
}

/**
 * Replace only the `remote` value of one entry — the visuals analogue of
 * key-line substitution (09 §8).
 * @param {string} indexPath
 * @param {string} id
 * @param {string} remote
 */
function replaceMediaRemote(indexPath, id, remote) {
  const lines = readText(indexPath).split('\n');
  let inEntry = false;
  for (let i = 0; i < lines.length; i++) {
    if (/^## /.test(lines[i])) inEntry = lines[i] === `## ${id}`;
    if (inEntry && /^\| remote \| /.test(lines[i])) {
      lines[i] = `| remote | ${remote} |`;
      writeText(indexPath, lines.join('\n'));
      return;
    }
  }
  throw new Error(`entry ${id} not found for remote substitution`);
}

// __CHUNK_END__
