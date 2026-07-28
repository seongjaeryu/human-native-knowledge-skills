#!/usr/bin/env node
// coffee-tracker — prints a summary of the brew log.

import fs from 'node:fs';
import path from 'node:path';

const LOG_FILE = path.join(process.cwd(), 'brews.log');

/**
 * @spec-node NODE-BREW-03
 * @spec-doc .context/0001-brew-log-format/ai-spec.md
 * @description Parses every brew-log line and computes the brew count and average extraction ratio for the report output.
 */
export function readBrews() {
  if (!fs.existsSync(LOG_FILE)) return [];
  return fs
    .readFileSync(LOG_FILE, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [ts, bean, dose, yieldG, seconds] = line.split(' ');
      return { ts, bean, dose: Number(dose), yieldG: Number(yieldG), seconds: Number(seconds) };
    });
}

/** Average extraction ratio (yield / dose) over all brews. */
export function averageRatio(brews) {
  if (!brews.length) return 0;
  const total = brews.reduce((sum, b) => sum + b.yieldG / b.dose, 0);
  return total / brews.length;
}

if (process.argv[1] && process.argv[1].endsWith('report.mjs')) {
  const brews = readBrews();
  console.log(`${brews.length} brew(s) logged`);
  console.log(`average ratio: ${averageRatio(brews).toFixed(2)}`);
}
