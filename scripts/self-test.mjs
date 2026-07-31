#!/usr/bin/env node
/**
 * self-test.mjs — node:test suite for scripts/hnk.mjs.
 *
 * Repo-only (never copied into targets). Runs on Node 18.17+ with no
 * dependencies and no network access; upload paths are exercised via
 * --dry-run and injected fetch stubs only.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import * as hnk from './hnk.mjs';

const HNK = decodeURIComponent(new URL('./hnk.mjs', import.meta.url).pathname);

// ---------------------------------------------------------------------------
// Frontmatter subset parser
// ---------------------------------------------------------------------------

const VALID_DOC = `---
id: artifact-0001-notification-spec
type: artifact
status: active
version: 2
domain: notification
topic: 0001-notification-pipeline
related: [invariant-notification, dictionary-notification]
meta: {author: user-handle, agent: tool@model}
empty_list: []
empty_map: {}
pending: null
flag: true
count: 42
summary: "Specification v2: queue-based dispatch replaces synchronous send."
---

# Body

Text.
`;

test('parser: valid document parses with correct values', () => {
  const { fm, body } = hnk.parseDocument(VALID_DOC);
  assert.equal(fm.entries.id.value, 'artifact-0001-notification-spec');
  assert.equal(fm.entries.version.value, 2);
  assert.deepEqual(fm.entries.related.value, ['invariant-notification', 'dictionary-notification']);
  assert.deepEqual(fm.entries.meta.value, { author: 'user-handle', agent: 'tool@model' });
  assert.deepEqual(fm.entries.empty_list.value, []);
  assert.deepEqual(fm.entries.empty_map.value, {});
  assert.equal(fm.entries.pending.value, null);
  assert.equal(fm.entries.flag.value, true);
  assert.equal(fm.entries.count.value, 42);
  assert.equal(fm.entries.summary.value, 'Specification v2: queue-based dispatch replaces synchronous send.');
  assert.ok(body.includes('# Body'));
});

test('parser: round trip is byte-stable for compliant input', () => {
  const { fm, body } = hnk.parseDocument(VALID_DOC);
  assert.equal(hnk.serializeFrontmatter(fm) + body, VALID_DOC);
});

test('parser: named errors for subset violations', () => {
  /** @type {[string, string][]} */
  const cases = [
    ['---\nid: x\nrelated:\n  - a\nsummary: "s"\n---\n', 'E_EMPTY_VALUE'], // block list intro: key with no value
    ['---\nid: x\nitems:\n- a\nsummary: "s"\n---\n', 'E_EMPTY_VALUE'],
    ['---\nid: x\n- item\nsummary: "s"\n---\n', 'E_BLOCK_LIST'],
    ['---\nid: x\n  nested: y\nsummary: "s"\n---\n', 'E_NESTED_BLOCK'],
    ['---\nid: x\nnote: | pipe\nsummary: "s"\n---\n', 'E_MULTILINE_SCALAR'],
    ['---\nid: x\nnote: >fold\nsummary: "s"\n---\n', 'E_MULTILINE_SCALAR'],
    ['---\nid: x\nnote: &anchor v\nsummary: "s"\n---\n', 'E_ANCHOR_TAG'],
    ['---\nid: x\nnote: *alias\nsummary: "s"\n---\n', 'E_ANCHOR_TAG'],
    ['---\nid: x\nnote: !!str v\nsummary: "s"\n---\n', 'E_ANCHOR_TAG'],
    ['---\nid: x\n# comment\nsummary: "s"\n---\n', 'E_COMMENT'],
    ['---\nid: x\nid: y\nsummary: "s"\n---\n', 'E_DUPLICATE_KEY'],
    ['---\nid: x\nBadKey: y\nsummary: "s"\n---\n', 'E_BAD_KEY'],
    ['---\nid: x\nnote: has: colon\nsummary: "s"\n---\n', 'E_QUOTING'],
    ['---\nid: x\nlist: [a, [b]]\nsummary: "s"\n---\n', 'E_NESTED_FLOW'],
    ['---\nid: x\nmap: {a: {b: c}}\nsummary: "s"\n---\n', 'E_NESTED_FLOW'],
    ['---\nid: x\nsummary: unquoted line\n---\n', 'E_SUMMARY_UNQUOTED'],
    ['---\nid: x\n---\n', 'E_SUMMARY_MISSING'],
    ['---\nid: x\nsummary: "s"\n', 'E_UNTERMINATED'],
    ['# no frontmatter\n', 'E_NO_FRONTMATTER'],
    ['---\nid: x\nbad: "unterminated\nsummary: "s"\n---\n', 'E_UNTERMINATED_STRING'],
    ['---\nid: x\nbad: "closed" trailing\nsummary: "s"\n---\n', 'E_TRAILING_CONTENT'],
  ];
  for (const [doc, code] of cases) {
    assert.throws(
      () => hnk.parseDocument(doc),
      (e) => e instanceof hnk.FrontmatterError && e.code === code,
      `expected ${code} for: ${JSON.stringify(doc)}`
    );
  }
});

test('parser: quoted strings unescape and reserved null stays a sentinel', () => {
  const doc = '---\nid: x\nnote: "a \\"quoted\\" value with \\\\ backslash"\npending: null\nliteral: "null"\nsummary: "s"\n---\n';
  const { fm } = hnk.parseDocument(doc);
  assert.equal(fm.entries.note.value, 'a "quoted" value with \\ backslash');
  assert.equal(fm.entries.pending.value, null);
  assert.equal(fm.entries.literal.value, 'null'); // quoted "null" is a string, not the sentinel
  assert.equal(hnk.serializeFrontmatter(fm), doc);
});

test('serializeValue: canonical quoting rules (§3.2)', () => {
  assert.equal(hnk.serializeValue('plain-value'), 'plain-value');
  assert.equal(hnk.serializeValue('has: colon'), '"has: colon"');
  assert.equal(hnk.serializeValue('[starts-bracket'), '"[starts-bracket"');
  assert.equal(hnk.serializeValue(' padded '), '" padded "');
  assert.equal(hnk.serializeValue('null'), '"null"'); // string "null" must not collide with the sentinel
  assert.equal(hnk.serializeValue('42'), '"42"');
  assert.equal(hnk.serializeValue(null), 'null');
  assert.equal(hnk.serializeValue(true), 'true');
  assert.equal(hnk.serializeValue(7), '7');
  assert.equal(hnk.serializeValue([]), '[]');
  assert.equal(hnk.serializeValue({}), '{}');
  assert.equal(hnk.serializeValue(['a', 'b']), '[a, b]');
  assert.equal(hnk.serializeValue({ author: 'x', agent: 'tool@model' }), '{author: x, agent: tool@model}');
  assert.equal(hnk.serializeValue('plain', { forceQuote: true }), '"plain"');
  assert.equal(hnk.serializeValue('a "q" \\'), '"a \\"q\\" \\\\"');
});

test('key-line substitution touches only the named lines', () => {
  const doc = '---\nid: s\nstatus: local-only\nraw_remote: null\nraw_sha256: null\nsummary: "keep me"\n---\n\nBody stays.\n';
  const out = hnk.substituteKeyLines(doc, { raw_remote: 'r2://bucket/sessions/x.full.md', status: 'uploaded' });
  assert.ok(out.includes('raw_remote: r2://bucket/sessions/x.full.md'));
  assert.ok(out.includes('status: uploaded'));
  assert.ok(out.includes('summary: "keep me"'));
  assert.ok(out.includes('raw_sha256: null'));
  assert.ok(out.includes('Body stays.'));
  // every other line is byte-identical
  const before = doc.split('\n');
  const after = out.split('\n');
  assert.equal(before.length, after.length);
  for (let i = 0; i < before.length; i++) {
    if (!/^(raw_remote|status): /.test(before[i])) assert.equal(after[i], before[i]);
  }
  assert.throws(() => hnk.substituteKeyLines(doc, { missing_key: 1 }), /E_KEY_NOT_FOUND/);
});

// ---------------------------------------------------------------------------
// Identifiers
// ---------------------------------------------------------------------------

test('id generation: timestamp + slug scheme', () => {
  const date = new Date('2026-07-29T15:30:42Z');
  assert.equal(hnk.makeId('session', 'Queue Pivot!', date), 'session-20260729-153042-queue-pivot');
  assert.equal(hnk.makeId('media', 'wireframe.PNG sketch', date), 'media-20260729-153042-wireframe-png-sketch');
  assert.ok(hnk.SESSION_ID_RE.test('session-20260729-153042-queue-pivot'));
  assert.ok(!hnk.SESSION_ID_RE.test('session-2026-queue'));
  assert.ok(hnk.MEDIA_ID_RE.test('media-20260729-142001-wireframe'));
  // slug capped at five words
  assert.equal(
    hnk.slugify('one two three four five six seven'),
    'one-two-three-four-five'
  );
  assert.throws(() => hnk.makeId('session', '!!!', date));
});

// ---------------------------------------------------------------------------
// Redaction
// ---------------------------------------------------------------------------

test('redaction masks credential patterns at write time', () => {
  const input = [
    'key id AKIAIOSFODNN7EXAMPLE in text',
    'export API_KEY=sk-abcdef1234567890',
    'password: hunter2secret',
    'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload',
    '-----BEGIN RSA PRIVATE KEY-----',
    'MIIEpAIBAAKCAQEA7',
    '-----END RSA PRIVATE KEY-----',
  ].join('\n');
  const { text, kinds } = hnk.redactSecrets(input);
  assert.ok(!text.includes('AKIAIOSFODNN7EXAMPLE'));
  assert.ok(!text.includes('sk-abcdef1234567890'));
  assert.ok(!text.includes('hunter2secret'));
  assert.ok(!text.includes('MIIEpAIBAAKCAQEA7'));
  assert.ok(text.includes('[REDACTED:aws-access-key-id]'));
  assert.ok(text.includes('API_KEY=[REDACTED:credential-assignment]')); // key name survives, value masked
  assert.ok(text.includes('[REDACTED:private-key-block]'));
  assert.ok(text.includes('[REDACTED:bearer-token]'));
  assert.ok(kinds.includes('aws-access-key-id'));
  assert.ok(kinds.includes('credential-assignment'));
  assert.ok(kinds.includes('private-key-block'));
  assert.ok(kinds.includes('bearer-token'));
  // already-masked text scans clean and re-redaction is idempotent
  assert.deepEqual(hnk.scanSecrets(text), []);
  assert.equal(hnk.redactSecrets(text).text, text);
  // clean text passes untouched
  const clean = 'ordinary prose about the api design, no values';
  assert.equal(hnk.redactSecrets(clean).text, clean);
  assert.deepEqual(hnk.scanSecrets(clean), []);
});

// ---------------------------------------------------------------------------
// SigV4
// ---------------------------------------------------------------------------

test('sigv4: canonical request shape, string-to-sign, pinned stable signature', () => {
  const fixed = {
    method: 'PUT',
    host: 'example.r2.cloudflarestorage.com',
    pathName: '/bucket/sessions/test.full.md',
    payload: 'hello world',
    accessKeyId: 'AKIDEXAMPLE',
    secretAccessKey: 'wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY',
    date: new Date('2026-07-29T12:00:00Z'),
  };
  const r = hnk.sigv4Sign(fixed);
  const payloadHash = hnk.sha256Hex('hello world');
  assert.equal(payloadHash, 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9');
  // canonical request: method / path / query / headers / signed-headers / payload-hash
  assert.deepEqual(r.canonicalRequest.split('\n'), [
    'PUT',
    '/bucket/sessions/test.full.md',
    '',
    'host:example.r2.cloudflarestorage.com',
    `x-amz-content-sha256:${payloadHash}`,
    'x-amz-date:20260729T120000Z',
    '',
    'host;x-amz-content-sha256;x-amz-date',
    payloadHash,
  ]);
  // string-to-sign: algorithm / date / scope / hashed canonical request
  assert.deepEqual(r.stringToSign.split('\n'), [
    'AWS4-HMAC-SHA256',
    '20260729T120000Z',
    '20260729/auto/s3/aws4_request',
    hnk.sha256Hex(r.canonicalRequest),
  ]);
  // signature: 64 lowercase hex, stable across calls, pinned expected value
  assert.match(r.signature, /^[0-9a-f]{64}$/);
  assert.equal(hnk.sigv4Sign(fixed).signature, r.signature);
  assert.equal(r.signature, '481e2d47e098de919655b3b004afb90332ee31bffef5aecd49822c006ae8d6cd');
  assert.ok(r.headers.Authorization.includes(`Signature=${r.signature}`));
  assert.ok(r.headers.Authorization.includes('Credential=AKIDEXAMPLE/20260729/auto/s3/aws4_request'));
  assert.ok(r.headers.Authorization.includes('SignedHeaders=host;x-amz-content-sha256;x-amz-date'));
  // any input change changes the signature
  const other = hnk.sigv4Sign({ ...fixed, payload: 'hello world!' });
  assert.notEqual(other.signature, r.signature);
});

test('r2Put: dry-run signs without sending; retries with backoff then fails', async () => {
  const cfg = {
    accountId: 'acct', accessKeyId: 'k', secretAccessKey: 's',
    bucket: 'bucket', publicBaseUrl: null,
  };
  let calls = 0;
  const neverCalled = async () => { calls++; throw new Error('network disabled in tests'); };
  const dry = await hnk.r2Put(cfg, 'sessions/x.full.md', Buffer.from('x'), { dryRun: true, fetchImpl: neverCalled });
  assert.deepEqual(dry, { sent: false, remote: 'r2://bucket/sessions/x.full.md', attempts: 0 });
  assert.equal(calls, 0);
  // failure path: initial try + two retries, then throw, no partial state
  await assert.rejects(
    () => hnk.r2Put(cfg, 'sessions/x.full.md', Buffer.from('x'), { fetchImpl: neverCalled, backoffMs: 1 }),
    /upload failed after retries/
  );
  assert.equal(calls, 3);
  // success path records the public base URL when set
  const okFetch = async (url, init) => {
    assert.ok(url.startsWith('https://acct.r2.cloudflarestorage.com/bucket/'));
    assert.equal(init.method, 'PUT');
    assert.ok(init.headers.Authorization.startsWith('AWS4-HMAC-SHA256 '));
    return { ok: true, status: 200 };
  };
  const sent = await hnk.r2Put(
    { ...cfg, publicBaseUrl: 'https://cdn.example.com' },
    'media/media-20260729-142001-wireframe/wireframe.png',
    Buffer.from('x'),
    { fetchImpl: okFetch }
  );
  assert.equal(sent.sent, true);
  assert.equal(sent.remote, 'https://cdn.example.com/media/media-20260729-142001-wireframe/wireframe.png');
  assert.equal(sent.attempts, 1);
});

test('node version gate accepts the running Node', () => {
  assert.equal(hnk.nodeVersionError(), null);
});

// ---------------------------------------------------------------------------
// End-to-end fixture tests
// ---------------------------------------------------------------------------

/** Minimal valid Open Knowledge Format doc. */
function okfDoc(fields, body = '') {
  return hnk.serializeFrontmatter(hnk.fmFromObject(fields)) + '\n' + body;
}

/** Build a temp target project conforming to skill/02. */
function makeFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hnk-selftest-'));
  const w = (rel, text) => {
    const p = path.join(root, rel);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, text);
  };
  w('.context/_global/orchestrator.md', okfDoc(
    { id: 'orchestrator', type: 'wiki', status: 'active', version: 1, related: [], summary: 'Standing rules the AI reads first, every session.' },
    '# Orchestrator\n\nStanding rules.\n'
  ));
  w('.context/_global/invariants.md', okfDoc(
    { id: 'invariants-global', type: 'invariant', status: 'active', version: 1, related: [], summary: 'Project-wide inviolable rules.' },
    '# Invariants\n'
  ));
  w('.context/_global/dictionary.md', okfDoc(
    { id: 'dictionary-global', type: 'dictionary', status: 'active', version: 1, related: [], summary: 'Term dictionary.' },
    '# Dictionary\n'
  ));
  w('.context/_global/project-profile.md', okfDoc(
    {
      id: 'project-profile', type: 'profile', status: 'active', version: 1, related: [],
      project_type: 'mixed', environments: ['claude-code'], stack: 'demo fixture',
      git: true, domain_layer: false, design_system: false, viewer: 'none',
      living_layer: 'wiki/', storage: 'r2', languages: ['en'], audience: 'test suite',
      dictionary_seeded: true, hnk_version: '1.0.0', hnk_commit: 'a1b2c3d',
      defaults: { mode: 'confirm-spec-changes-only', depth: 'full-topic' },
      summary: 'Level 1 record for the self-test fixture project.',
    },
    '# Project profile\n\n## Level 1 answers\n\n## Level 2 defaults\n\n## Environment integration\n'
  ));
  w('.context/0001-demo/ai-spec.md', okfDoc(
    {
      id: 'artifact-0001-demo-spec', type: 'artifact', status: 'active', version: 2,
      topic: '0001-demo', related: ['invariants-global'],
      frozen_commits: { v1: 'a1b2c3d' },
      summary: 'Demo topic specification, version 2.',
    },
    '# Demo spec\n\nSee [dictionary](../_global/dictionary.md).\n\n## Version History\n\n### v1 -> v2 — 2026-07-29\n- **reason:** fixture pivot\n- **frozen-as:** v1 at commit `a1b2c3d`\n'
  ));
  w('.context/_archive/index.md', hnk.renderArchiveIndex([]));
  w('.context/_media/index.md', hnk.renderMediaIndex([]));
  fs.mkdirSync(path.join(root, '.context/_archive/sessions'), { recursive: true });
  fs.mkdirSync(path.join(root, '.context/_media/files'), { recursive: true });
  w('wiki/index.md', okfDoc(
    { id: 'wiki-index', type: 'wiki', status: 'active', version: 1, related: [], summary: 'Living layer entry page.' },
    '# Wiki\n\nCurrent state.\n'
  ));
  w('wiki/notes.md', '# Adopted notes\n\nPre-existing Living document without frontmatter.\n');
  w('.gitignore', 'node_modules/\n\n# hnk:begin (managed block — do not edit between markers)\n.context/_archive/sessions/\n.context/_media/files/\n# hnk:end\n');
  return root;
}

/** Run the CLI. @returns {{code: number, out: string}} */
function runCli(root, args, env = {}) {
  const r = spawnSync(process.execPath, [HNK, '--root', root, ...args], {
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
  return { code: r.status ?? -1, out: `${r.stdout}${r.stderr}` };
}

const R2_ENV = {
  R2_ACCOUNT_ID: 'testacct',
  R2_ACCESS_KEY_ID: 'AKIDEXAMPLE',
  R2_SECRET_ACCESS_KEY: 'wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY',
  R2_BUCKET: 'test-bucket',
};

test('end-to-end target project flow', async (t) => {
  const root = makeFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  /** @type {string} */ let sessionId = '';
  /** @type {string} */ let mediaId = '';
  const cardPath = () => path.join(root, '.context/_archive', `${sessionId}.md`);
  const rawPath = () => path.join(root, '.context/_archive/sessions', `${sessionId}.full.md`);

  await t.test('archive new creates a draft card + raw placeholder', () => {
    const r = runCli(root, ['archive', 'new', '--title', 'Queue pivot test', '--topic', '0001-demo', '--mode', 'autonomous-with-report']);
    assert.equal(r.code, 0, r.out);
    const m = /created draft card (session-\d{8}-\d{6}-queue-pivot-test)/.exec(r.out);
    assert.ok(m, r.out);
    sessionId = m[1];
    assert.ok(hnk.SESSION_ID_RE.test(sessionId));
    const { fm, body } = hnk.parseDocument(fs.readFileSync(cardPath(), 'utf8'));
    assert.equal(fm.entries.type.value, 'session');
    assert.equal(fm.entries.ended.value, null);
    assert.equal(fm.entries.visibility.value, 'private');
    assert.equal(fm.entries.status.value, 'local-only');
    assert.equal(fm.entries.raw_fidelity.value, 'reconstructed');
    assert.equal(fm.entries.raw_sha256.value, null);
    assert.equal(fm.entries.raw_remote.value, null);
    assert.equal(fm.entries.raw_local.value, `.context/_archive/sessions/${sessionId}.full.md`);
    assert.equal(fm.entries.mode.value, 'autonomous-with-report');
    assert.equal(fm.entries.topic.value, '0001-demo');
    assert.ok(typeof fm.entries.meta.value === 'object');
    for (const s of ['## Goal', '## Key decisions', '## Deltas', '## Affected files', '## Follow-ups']) {
      assert.ok(body.includes(s), `draft body missing ${s}`);
    }
    assert.ok(fs.existsSync(rawPath()));
    assert.ok(fs.readFileSync(rawPath(), 'utf8').includes('format: hnk-raw v1'));
  });

  await t.test('archive index regenerates the frozen columns + anchors', () => {
    const r = runCli(root, ['archive', 'index']);
    assert.equal(r.code, 0, r.out);
    const idx = fs.readFileSync(path.join(root, '.context/_archive/index.md'), 'utf8');
    const { fm } = hnk.parseDocument(idx);
    assert.equal(fm.entries.id.value, 'archive-index');
    assert.equal(fm.entries.type.value, 'archive-index');
    assert.ok(idx.includes('| id | date | summary | domain/topic | mode | status | raw_fidelity | visibility |'));
    assert.ok(idx.includes(`<a id="${sessionId}"></a>[${sessionId}](${sessionId}.md)`));
    assert.ok(idx.includes('| 0001-demo |'));
  });

  await t.test('archive verify: draft warning only, exit 0', () => {
    const r = runCli(root, ['archive', 'verify']);
    assert.equal(r.code, 0, r.out);
    assert.ok(r.out.includes('recovery sweep'));
    assert.ok(r.out.includes('hnk-summary: archive-verify ok'));
  });

  await t.test('archive capture: JSONL → hnk-raw v1, redacted, card updated', () => {
    const jsonl = [
      JSON.stringify({ type: 'user', timestamp: '2026-07-29T15:31:00Z', message: { role: 'user', content: [{ type: 'text', text: 'Move dispatch to a queue. API_KEY=supersecret123456' }] } }),
      JSON.stringify({ type: 'assistant', timestamp: '2026-07-29T15:31:30Z', message: { role: 'assistant', content: [{ type: 'text', text: 'Proposal: enqueue on receipt.' }, { type: 'tool_use', name: 'Edit', input: { file_path: 'specs/ai-spec.md', old_string: 'a very long payload that must never be transcribed' } }] } }),
      JSON.stringify({ type: 'user', message: { role: 'user', content: [{ type: 'tool_result', content: 'giant tool result payload MUST NOT appear' }] } }),
      JSON.stringify({ type: 'summary', summary: 'ignored line type' }),
      'not json at all — tolerated',
    ].join('\n');
    const tPath = path.join(root, 'transcript.jsonl');
    fs.writeFileSync(tPath, jsonl);
    const r = runCli(root, ['archive', 'capture', '--transcript', tPath]);
    assert.equal(r.code, 0, r.out);
    const raw = fs.readFileSync(rawPath(), 'utf8');
    assert.ok(raw.startsWith(`# ${sessionId} — normalized raw`));
    assert.ok(raw.includes('- fidelity: captured'));
    assert.ok(raw.includes('- format: hnk-raw v1'));
    assert.ok(raw.includes('## human — 2026-07-29T15:31:00Z'));
    assert.ok(raw.includes('## agent — 2026-07-29T15:31:30Z'));
    assert.ok(raw.includes('- tool-call: Edit — file_path: specs/ai-spec.md (summary only)'));
    assert.ok(!raw.includes('supersecret123456'), 'secret value must be redacted');
    assert.ok(raw.includes('API_KEY=[REDACTED:credential-assignment]'));
    assert.ok(!raw.includes('MUST NOT appear'), 'tool_result payloads must not be transcribed');
    assert.ok(!raw.includes('a very long payload'), 'tool_use payload fields must not be transcribed');
    const card = hnk.parseDocument(fs.readFileSync(cardPath(), 'utf8'));
    assert.equal(card.fm.entries.raw_fidelity.value, 'captured');
    assert.equal(card.fm.entries.raw_sha256.value, hnk.sha256Hex(fs.readFileSync(rawPath())));
    // repeat run replaces the snapshot idempotently (08 §8)
    const before = fs.readFileSync(cardPath(), 'utf8');
    const r2 = runCli(root, ['archive', 'capture', '--transcript', tPath, '--id', sessionId]);
    assert.equal(r2.code, 0, r2.out);
    assert.equal(fs.readFileSync(cardPath(), 'utf8'), before);
    fs.rmSync(tPath);
  });

  await t.test('stage 2: complete the card, reindex', () => {
    const text = fs.readFileSync(cardPath(), 'utf8');
    fs.writeFileSync(cardPath(), hnk.substituteKeyLines(text, {
      ended: hnk.isoInstant(new Date()),
      summary: 'Queue pivot test session, completed by the self-test.',
    }));
    const r = runCli(root, ['archive', 'index']);
    assert.equal(r.code, 0, r.out);
    const v = runCli(root, ['archive', 'verify']);
    assert.equal(v.code, 0, v.out);
    assert.ok(!v.out.includes('draft card'), v.out);
  });

  await t.test('visuals add: alt required, then registers and moves payload', () => {
    const png = Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      Buffer.from('tiny-test-image-payload-0001'),
    ]);
    const src = path.join(root, 'tiny.png');
    fs.writeFileSync(src, png);
    const noAlt = runCli(root, ['visuals', 'add', src, '--topic', '0001-demo']);
    assert.equal(noAlt.code, 2, noAlt.out); // hard usage error without --alt
    assert.ok(fs.existsSync(src), 'file must not move on error');
    const r = runCli(root, ['visuals', 'add', src, '--topic', '0001-demo', '--alt', 'Tiny generated test image: eight-byte PNG signature plus a text payload.']);
    assert.equal(r.code, 0, r.out);
    const m = /registered (media-\d{8}-\d{6}-tiny)/.exec(r.out);
    assert.ok(m, r.out);
    mediaId = m[1];
    assert.ok(!fs.existsSync(src), 'source must be moved');
    const dest = path.join(root, '.context/_media/files/0001-demo/tiny.png');
    assert.ok(fs.existsSync(dest));
    const { entries } = hnk.loadMediaIndex(root);
    assert.equal(entries.length, 1);
    const e = entries[0];
    assert.equal(e.id, mediaId);
    assert.equal(e.fields.type, 'image');
    assert.equal(e.fields.path_local, 'files/0001-demo/tiny.png');
    assert.equal(e.fields.sha256, hnk.sha256Hex(png));
    assert.equal(e.fields.bytes, String(png.length));
    assert.equal(e.fields.remote, 'null');
    assert.equal(e.fields.referenced_by, '[]');
    assert.ok(e.fields.alt.startsWith('Tiny generated test image'));
    // duplicate payload: warns, points at the existing entry, no new entry
    fs.writeFileSync(src, png);
    const dup = runCli(root, ['visuals', 'add', src, '--alt', 'Duplicate payload attempt.']);
    assert.equal(dup.code, 0, dup.out);
    assert.ok(dup.out.includes(`already registered as ${mediaId}`), dup.out);
    assert.equal(hnk.loadMediaIndex(root).entries.length, 1);
    fs.rmSync(src);
  });

  await t.test('visuals index: merge regeneration rebuilds referenced_by, idempotent', () => {
    const wiki = path.join(root, 'wiki/index.md');
    fs.appendFileSync(wiki, `\n## Design sketches\n\nSee [${mediaId}](.context/_media/index.md#${mediaId}).\n`);
    const r = runCli(root, ['visuals', 'index']);
    assert.equal(r.code, 0, r.out);
    const { entries } = hnk.loadMediaIndex(root);
    assert.equal(entries[0].fields.referenced_by, '[wiki/index.md#design-sketches]');
    assert.ok(entries[0].fields.alt.startsWith('Tiny generated test image'), 'merge must preserve alt');
    const bytes1 = fs.readFileSync(path.join(root, '.context/_media/index.md'), 'utf8');
    const r2 = runCli(root, ['visuals', 'index']);
    assert.equal(r2.code, 0, r2.out);
    assert.equal(fs.readFileSync(path.join(root, '.context/_media/index.md'), 'utf8'), bytes1, 'visuals index must be idempotent');
  });

  await t.test('visuals verify: clean, then catches stray + unregistered binaries', () => {
    const clean = runCli(root, ['visuals', 'verify']);
    assert.equal(clean.code, 0, clean.out);
    const stray = path.join(root, '.context/_global/stray.png');
    fs.writeFileSync(stray, Buffer.from([0x89, 0x50, 0x4e, 0x47, 0, 1, 2, 3]));
    const r1 = runCli(root, ['visuals', 'verify']);
    assert.equal(r1.code, 1, r1.out);
    assert.ok(r1.out.includes('binary content outside _media/files'), r1.out);
    fs.rmSync(stray);
    const unreg = path.join(root, '.context/_media/files/extra.bin');
    fs.writeFileSync(unreg, Buffer.from([0, 1, 2, 3]));
    const r2 = runCli(root, ['visuals', 'verify']);
    assert.equal(r2.code, 1, r2.out);
    assert.ok(r2.out.includes('unregistered payload'), r2.out);
    fs.rmSync(unreg);
  });

  await t.test('llm build: knowledge map + fallback for frontmatter-less Living doc, idempotent', () => {
    const r = runCli(root, ['llm', 'build']);
    assert.equal(r.code, 0, r.out);
    assert.ok(r.out.includes('Living document without frontmatter'), r.out); // advisory, not failure
    const llm = fs.readFileSync(path.join(root, 'llm.txt'), 'utf8');
    assert.ok(llm.includes('## Knowledge map'));
    assert.ok(llm.includes('## Reading order'));
    assert.ok(llm.includes('## Boundary rules'));
    assert.ok(llm.includes('[project-profile](.context/_global/project-profile.md)'));
    assert.ok(llm.includes('[orchestrator](.context/_global/orchestrator.md)'));
    assert.ok(llm.includes('[notes](wiki/notes.md) | wiki |'), 'fallback doc must appear with filename id');
    assert.ok(llm.includes('`wiki/`'), 'Living layer location must be stated');
    assert.ok(llm.includes('.context/_archive/sessions/'));
    const first = llm;
    const r2 = runCli(root, ['llm', 'build']);
    assert.equal(r2.code, 0, r2.out);
    assert.equal(fs.readFileSync(path.join(root, 'llm.txt'), 'utf8'), first, 'llm build must be deterministic');
  });

  await t.test('report: digest of matching cards to stdout', () => {
    const r = runCli(root, ['report', '--topic', '0001-demo']);
    assert.equal(r.code, 0, r.out);
    assert.ok(r.out.includes(`## ${sessionId}`));
    assert.ok(r.out.includes('### Goal'));
    assert.ok(r.out.includes('Queue pivot test'));
    const none = runCli(root, ['report', '--from', '2099-01-01']);
    assert.ok(none.out.includes('0 matching card(s)'));
  });

  await t.test('global verify: clean fixture passes; dead pointer fails', () => {
    const r = runCli(root, ['verify']);
    assert.equal(r.code, 0, r.out);
    assert.ok(r.out.includes('hnk-summary: verify ok'), r.out);
    const spec = path.join(root, '.context/0001-demo/ai-spec.md');
    const original = fs.readFileSync(spec, 'utf8');
    fs.writeFileSync(spec, original + '\nDead: [gone](./no-such-file.md)\n');
    const bad = runCli(root, ['verify']);
    assert.equal(bad.code, 1, bad.out);
    assert.ok(bad.out.includes('dead semantic pointer'), bad.out);
    fs.writeFileSync(spec, original);
    runCli(root, ['llm', 'build']); // refresh llm.txt after the touch
  });

  await t.test('archive verify: sha mismatch and raw-lost proposal', () => {
    const original = fs.readFileSync(rawPath());
    fs.appendFileSync(rawPath(), '\ntampered\n');
    const r1 = runCli(root, ['archive', 'verify']);
    assert.equal(r1.code, 1, r1.out);
    assert.ok(r1.out.includes('raw_sha256 mismatch'), r1.out);
    fs.writeFileSync(rawPath(), original);
    fs.rmSync(rawPath());
    const r2 = runCli(root, ['archive', 'verify']);
    assert.equal(r2.code, 1, r2.out);
    assert.ok(r2.out.includes('propose status: raw-lost'), r2.out);
    fs.writeFileSync(rawPath(), original);
    const r3 = runCli(root, ['archive', 'verify']);
    assert.equal(r3.code, 0, r3.out);
  });

  await t.test('archive upload: private is never eligible; --dry-run changes nothing', () => {
    const nothing = runCli(root, ['archive', 'upload', '--dry-run'], R2_ENV);
    assert.equal(nothing.code, 0, nothing.out);
    assert.ok(nothing.out.includes('no eligible cards'), nothing.out);
    // opt in, then dry-run
    fs.writeFileSync(cardPath(), hnk.substituteKeyLines(fs.readFileSync(cardPath(), 'utf8'), { visibility: 'uploadable' }));
    const before = fs.readFileSync(cardPath(), 'utf8');
    const dry = runCli(root, ['archive', 'upload', '--dry-run'], R2_ENV);
    assert.equal(dry.code, 0, dry.out);
    assert.ok(dry.out.includes(`dry-run: would PUT sessions/${sessionId}.full.md`), dry.out);
    assert.equal(fs.readFileSync(cardPath(), 'utf8'), before, 'dry-run must not change the card');
    const missingEnv = runCli(root, ['archive', 'upload', '--dry-run']);
    assert.equal(missingEnv.code, 1, missingEnv.out);
    assert.ok(missingEnv.out.includes('missing environment variable'), missingEnv.out);
  });

  await t.test('archive upload: secret scan gate blocks before any network', async () => {
    const original = fs.readFileSync(rawPath(), 'utf8');
    fs.writeFileSync(rawPath(), original + '\nleaked AKIAIOSFODNN7EXAMPLE\n');
    const rep = new hnk.RunReport('archive-upload');
    let fetchCalls = 0;
    await hnk.archiveUpload(root, {
      env: { ...R2_ENV }, fetchImpl: async () => { fetchCalls++; return { ok: true, status: 200 }; },
    }, rep);
    assert.equal(fetchCalls, 0, 'nothing may be sent when the scan finds secrets');
    assert.equal(rep.failures.length, 1);
    assert.ok(rep.failures[0].includes('BLOCKED'));
    assert.ok(rep.failures[0].includes('aws-access-key-id'));
    assert.ok(!rep.failures[0].includes('AKIAIOSFODNN7EXAMPLE'), 'the matched value is never printed');
    fs.writeFileSync(rawPath(), original);
  });

  await t.test('archive upload: success updates raw_remote + status by key-line substitution', async () => {
    const before = fs.readFileSync(cardPath(), 'utf8');
    const rep = new hnk.RunReport('archive-upload');
    await hnk.archiveUpload(root, {
      env: { ...R2_ENV }, backoffMs: 1,
      fetchImpl: async () => ({ ok: true, status: 200 }),
    }, rep);
    assert.equal(rep.failures.length, 0, rep.failures.join('; '));
    const after = fs.readFileSync(cardPath(), 'utf8');
    const { fm } = hnk.parseDocument(after);
    assert.equal(fm.entries.status.value, 'uploaded');
    assert.equal(fm.entries.raw_remote.value, `r2://test-bucket/sessions/${sessionId}.full.md`);
    // only the two key lines moved
    const b = before.split('\n');
    const a = after.split('\n');
    assert.equal(b.length, a.length);
    for (let i = 0; i < b.length; i++) {
      if (!/^(raw_remote|status): /.test(b[i])) assert.equal(a[i], b[i]);
    }
    // now uploaded → no longer eligible
    const rep2 = new hnk.RunReport('archive-upload');
    let calls = 0;
    await hnk.archiveUpload(root, { env: { ...R2_ENV }, fetchImpl: async () => { calls++; return { ok: true, status: 200 }; } }, rep2);
    assert.equal(calls, 0);
  });

  await t.test('visuals upload: dry-run, then success replaces only the remote value', async () => {
    const dry = runCli(root, ['visuals', 'upload', '--dry-run'], R2_ENV);
    assert.equal(dry.code, 0, dry.out);
    assert.ok(dry.out.includes(`dry-run: would PUT media/${mediaId}/tiny.png`), dry.out);
    const before = fs.readFileSync(path.join(root, '.context/_media/index.md'), 'utf8');
    const rep = new hnk.RunReport('visuals-upload');
    await hnk.visualsUpload(root, {
      env: { ...R2_ENV }, backoffMs: 1,
      fetchImpl: async () => ({ ok: true, status: 200 }),
    }, rep);
    assert.equal(rep.failures.length, 0, rep.failures.join('; '));
    const after = fs.readFileSync(path.join(root, '.context/_media/index.md'), 'utf8');
    const b = before.split('\n');
    const a = after.split('\n');
    assert.equal(b.length, a.length);
    for (let i = 0; i < b.length; i++) {
      if (b[i] !== a[i]) assert.equal(a[i], `| remote | r2://test-bucket/media/${mediaId}/tiny.png |`);
    }
    const { entries } = hnk.loadMediaIndex(root);
    assert.equal(entries[0].fields.remote, `r2://test-bucket/media/${mediaId}/tiny.png`);
    assert.ok(entries[0].fields.alt.startsWith('Tiny generated test image'));
  });

  await t.test('usage errors exit 2', () => {
    assert.equal(runCli(root, ['nonsense']).code, 2);
    assert.equal(runCli(root, ['archive', 'new']).code, 2); // missing --title
    assert.equal(runCli(root, ['archive', 'capture']).code, 2); // missing --transcript
    assert.equal(runCli(root, ['archive', 'upload', '--provider', 'gcs', '--dry-run'], R2_ENV).code, 2);
    const r = runCli(root, []);
    assert.equal(r.code, 2);
    assert.ok(r.out.includes('Usage:'));
  });
});

test('archive verify: uncarded-work warning from git commits', (t) => {
  const root = makeFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const git = (args) => spawnSync('git', ['-c', 'user.email=t@t', '-c', 'user.name=t', ...args], { cwd: root, encoding: 'utf8' });
  if ((git(['init', '-q']).status ?? 1) !== 0) { t.skip('git unavailable'); return; }

  // A completed card whose session ended in the past.
  const id = 'session-20200101-120000-old-work';
  const raw = `format: hnk-raw v1\nsession: ${id}\nfidelity: reconstructed\n\n## note\n\nold work\n`;
  fs.mkdirSync(path.join(root, '.context/_archive/sessions'), { recursive: true });
  fs.writeFileSync(path.join(root, '.context/_archive/sessions', `${id}.full.md`), raw);
  const sha = hnk.sha256Hex(Buffer.from(raw));
  fs.writeFileSync(path.join(root, '.context/_archive', `${id}.md`), [
    '---',
    `id: ${id}`,
    'type: session',
    'started: 2020-01-01T12:00:00Z',
    'ended: 2020-01-01T13:00:00Z',
    'meta: {author: t, agent: t@t}',
    'mode: confirm-spec-changes-only',
    'visibility: private',
    'status: local-only',
    'raw_fidelity: reconstructed',
    `raw_local: .context/_archive/sessions/${id}.full.md`,
    'raw_remote: null',
    `raw_sha256: ${sha}`,
    'summary: "Old carded work."',
    '---',
    '',
    '## Goal', '', 'g', '',
    '## Key decisions', '', 'k', '',
    '## Deltas', '', 'd', '',
    '## Affected files', '', 'a', '',
    '## Follow-ups', '', 'f', '',
  ].join('\n'));
  runCli(root, ['archive', 'index']);

  // Commit 1 touches the archive (the carded freeze-point commit): no warning.
  git(['add', '-A']);
  git(['commit', '-q', '-m', 'freeze point incl. archive']);
  const r1 = runCli(root, ['archive', 'verify']);
  assert.ok(!r1.out.includes('uncarded work'), r1.out);

  // Commit 2 touches only source: uncarded-work warning, still exit 0 (advisory).
  fs.writeFileSync(path.join(root, 'src.mjs'), 'export const x = 1;\n');
  git(['add', 'src.mjs']);
  git(['commit', '-q', '-m', 'direct change, no card']);
  const r2 = runCli(root, ['archive', 'verify']);
  assert.equal(r2.code, 0, r2.out);
  assert.ok(r2.out.includes('uncarded work: 1 commit(s)'), r2.out);
});

test('status: ten-second handover view', (t) => {
  const root = makeFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const id = 'session-20200101-120000-old-work';
  fs.mkdirSync(path.join(root, '.context/_archive'), { recursive: true });
  fs.writeFileSync(path.join(root, '.context/_archive', `${id}.md`), [
    '---', `id: ${id}`, 'type: session',
    'started: 2020-01-01T12:00:00Z', 'ended: 2020-01-01T13:00:00Z',
    'meta: {author: t, agent: t@t}', 'mode: confirm-spec-changes-only',
    'visibility: private', 'status: raw-lost', 'raw_fidelity: reconstructed',
    `raw_local: .context/_archive/sessions/${id}.full.md`,
    'raw_remote: null', 'raw_sha256: null',
    'summary: "Old carded work."', '---', '',
    '## Goal', '', 'g', '',
    '## Key decisions', '', '- decided the thing because reasons', '',
    '## Deltas', '', 'd', '',
    '## Affected files', '', 'a', '',
    '## Follow-ups', '', '- open end one', '',
  ].join('\n'));
  const draftId = 'session-20200102-120000-in-flight';
  fs.writeFileSync(path.join(root, '.context/_archive', `${draftId}.md`), [
    '---', `id: ${draftId}`, 'type: session',
    'started: 2020-01-02T12:00:00Z', 'ended: null',
    'meta: {author: t, agent: t@t}', 'mode: confirm-spec-changes-only',
    'visibility: private', 'status: local-only', 'raw_fidelity: reconstructed',
    `raw_local: .context/_archive/sessions/${draftId}.full.md`,
    'raw_remote: null', 'raw_sha256: null',
    'summary: "In flight."', '---', '',
    '## Goal', '', '', '## Key decisions', '', '', '## Deltas', '', '',
    '## Affected files', '', '', '## Follow-ups', '', '',
  ].join('\n'));
  const r = runCli(root, ['status']);
  assert.equal(r.code, 0, r.out);
  assert.ok(r.out.includes(`Newest completed session: ${id}`), r.out);
  assert.ok(r.out.includes('decided the thing because reasons'), r.out);
  assert.ok(r.out.includes('open end one'), r.out);
  assert.ok(r.out.includes(`1 draft card(s) (ended: null): ${draftId}`), r.out);
});

// ---------------------------------------------------------------------------
// Compat views (skill/02 §11)
// ---------------------------------------------------------------------------

test('verify: compat views resolve by id (02 §11.4)', async (t) => {
  const root = makeFixture();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));

  // makeFixture() alone is not verify-clean: llm.txt is generated by an
  // explicit `llm build`, mirroring real project setup (and the pattern the
  // 'llm build: knowledge map + fallback for frontmatter-less Living doc,
  // idempotent' and 'global verify: clean fixture passes; dead pointer fails'
  // subtests use, above, inside 'end-to-end target project flow'). Establish
  // that precondition before asserting anything about the compat-view stub.
  const built = runCli(root, ['llm', 'build']);
  assert.equal(built.code, 0, built.out);
  const preclean = runCli(root, ['verify']);
  assert.equal(preclean.code, 0, preclean.out); // sanity: fixture is verify-clean before we add a stub

  // TARGET_ID: 'orchestrator' — the id of .context/_global/orchestrator.md,
  // a document makeFixture() always seeds (also verify's requiredFiles list).
  const stubDir = path.join(root, 'docs', 'external-tool', 'plans');
  fs.mkdirSync(stubDir, { recursive: true });
  const stubPath = path.join(stubDir, 'legacy-plan.md');

  await t.test('valid view passes verify', () => {
    fs.writeFileSync(stubPath, okfDoc({
      id: 'view-0001-legacy-plan',
      type: 'view',
      status: 'active',
      version: 1,
      related: [],
      resolves_to: 'orchestrator',
      summary: 'Compat view: the authoritative plan lives in .context.',
    }, [
      'Authoritative: [target](../../../.context/_global/orchestrator.md)',
      'If that path is stale, resolve `resolves_to` via llm.txt or the archive index.',
      'Keywords: legacy plan compat view fixture',
    ].join('\n')));
    const r = runCli(root, ['verify']);
    assert.equal(r.code, 0, r.out);
  });

  await t.test('unknown resolves_to id fails verify', () => {
    const text = fs.readFileSync(stubPath, 'utf8');
    fs.writeFileSync(stubPath, text.replace('resolves_to: orchestrator', 'resolves_to: no-such-id'));
    const r = runCli(root, ['verify']);
    assert.notEqual(r.code, 0);
    assert.match(r.out, /resolves_to/);
    fs.writeFileSync(stubPath, text); // restore
  });

  await t.test('dead relative link in a stub fails verify', () => {
    const text = fs.readFileSync(stubPath, 'utf8');
    fs.writeFileSync(stubPath, text.replace('orchestrator.md', 'no-such-file.md'));
    const r = runCli(root, ['verify']);
    assert.notEqual(r.code, 0);
    assert.match(r.out, /dead semantic pointer/);
    fs.writeFileSync(stubPath, text); // restore
  });

  await t.test('missing summary in a stub fails verify', () => {
    const text = fs.readFileSync(stubPath, 'utf8');
    fs.writeFileSync(stubPath, text.split('\n').filter((l) => !l.startsWith('summary:')).join('\n'));
    const r = runCli(root, ['verify']);
    assert.notEqual(r.code, 0);
    assert.match(r.out, /summary/);
    fs.writeFileSync(stubPath, text); // restore
  });

  await t.test('body-level type: view mention in a non-view doc does not trigger the scan', () => {
    const wikiPath = path.join(root, 'wiki', 'how-views-work.md');
    fs.writeFileSync(wikiPath, okfDoc({
      id: 'wiki-how-views-work',
      type: 'wiki',
      status: 'active',
      version: 1,
      related: [],
      summary: 'Explains compat views with an example.',
    }, ['```markdown', 'type: view', '```'].join('\n')));
    const r = runCli(root, ['verify']);
    assert.equal(r.code, 0, r.out);
    fs.rmSync(wikiPath);
  });

  await t.test('valid view resolving to a Living-layer doc id passes verify', () => {
    const livingViewPath = path.join(stubDir, 'legacy-plan-living.md');
    fs.writeFileSync(livingViewPath, okfDoc({
      id: 'view-0002-legacy-plan-living',
      type: 'view',
      status: 'active',
      version: 1,
      related: [],
      resolves_to: 'wiki-index', // makeFixture() seeds wiki/index.md with id: wiki-index
      summary: 'Compat view: the authoritative page lives in the Living layer.',
    }, [
      'Authoritative: [target](../../../wiki/index.md)',
      'Keywords: legacy plan compat view fixture living layer',
    ].join('\n')));
    const r = runCli(root, ['verify']);
    assert.equal(r.code, 0, r.out);
    fs.rmSync(livingViewPath);
  });

  await t.test('quoted type: "view" stub with unresolvable resolves_to fails verify', () => {
    const quotedViewPath = path.join(stubDir, 'quoted-type-view.md');
    fs.writeFileSync(quotedViewPath, [
      '---',
      'id: view-0003-quoted-type',
      'type: "view"',
      'status: active',
      'version: 1',
      'related: []',
      'resolves_to: no-such-id',
      'summary: "Quoted type value compat view fixture."',
      '---',
      '',
      'Keywords: quoted type compat view fixture',
      '',
    ].join('\n'));
    const r = runCli(root, ['verify']);
    assert.notEqual(r.code, 0);
    assert.match(r.out, /resolves_to/);
    fs.rmSync(quotedViewPath);
  });

  await t.test('CRLF-terminated stub fails loudly, not silently skipped', () => {
    const crlfViewPath = path.join(stubDir, 'crlf-view.md');
    fs.writeFileSync(crlfViewPath, [
      '---',
      'id: view-0004-crlf',
      'type: view',
      'status: active',
      'version: 1',
      'related: []',
      'resolves_to: orchestrator',
      'summary: "CRLF compat view fixture."',
      '---',
      '',
      'Keywords: crlf compat view fixture',
      '',
    ].join('\r\n'));
    const r = runCli(root, ['verify']);
    assert.notEqual(r.code, 0);
    assert.match(r.out, /frontmatter fence/);
    fs.rmSync(crlfViewPath);
  });

  await t.test('view resolving to another view id fails verify', () => {
    const viewAPath = path.join(stubDir, 'view-a.md');
    const viewBPath = path.join(stubDir, 'view-b.md');
    fs.writeFileSync(viewBPath, okfDoc({
      id: 'view-0006-b',
      type: 'view',
      status: 'active',
      version: 1,
      related: [],
      resolves_to: 'orchestrator',
      summary: 'Compat view B: the authoritative plan lives in .context.',
    }, [
      'Authoritative: [target](../../../.context/_global/orchestrator.md)',
    ].join('\n')));
    fs.writeFileSync(viewAPath, okfDoc({
      id: 'view-0005-a',
      type: 'view',
      status: 'active',
      version: 1,
      related: [],
      resolves_to: 'view-0006-b',
      summary: 'Compat view A: resolves to another view (invalid).',
    }, [
      'Authoritative: [target](./view-b.md)',
    ].join('\n')));
    const r = runCli(root, ['verify']);
    assert.notEqual(r.code, 0);
    assert.match(r.out, /names another view/);
    fs.rmSync(viewAPath);
    fs.rmSync(viewBPath);
  });
});
