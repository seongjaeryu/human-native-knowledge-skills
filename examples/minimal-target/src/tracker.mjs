#!/usr/bin/env node
// coffee-tracker — records one espresso brew per invocation.

import fs from 'node:fs';
import path from 'node:path';

const LOG_FILE = path.join(process.cwd(), 'brews.log');

/** Parse `--key value` pairs from argv. */
export function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      out[argv[i].slice(2)] = argv[i + 1];
      i++;
    }
  }
  return out;
}

/**
 * @spec-node NODE-BREW-01
 * @spec-doc .context/0001-brew-log-format/ai-spec.md
 * @description Composes one brew-log line (ISO-timestamp bean dose yield seconds) and appends it; the log is append-only per INV-BREW-001.
 */
export function recordBrew({ bean, doseGrams, yieldGrams, seconds }) {
  const line = `${new Date().toISOString()} ${bean} ${doseGrams} ${yieldGrams} ${seconds}\n`;
  fs.appendFileSync(LOG_FILE, line);
  return line.trim();
}

if (process.argv[1] && process.argv[1].endsWith('tracker.mjs')) {
  const args = parseArgs(process.argv.slice(2));
  const line = recordBrew({
    bean: args.bean ?? 'unknown',
    doseGrams: args.dose ?? '18',
    yieldGrams: args.yield ?? '36',
    seconds: args.seconds ?? '28',
  });
  console.log(`recorded: ${line}`);
}
