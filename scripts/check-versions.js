#!/usr/bin/env node

const { execSync } = require('node:child_process');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

// Read required versions from mise config
const miseConfig = readFileSync(join(__dirname, '..', '.mise.toml'), 'utf8');
const requiredNode = miseConfig.match(/node = "([^"]+)"/)?.[1];
const requiredPython = miseConfig.match(/python = "([^"]+)"/)?.[1];

// Get current versions
let currentNode, currentPython;

try {
  currentNode = execSync('node --version', { encoding: 'utf8' })
    .trim()
    .slice(1);
  currentPython = execSync('python --version', { encoding: 'utf8' })
    .trim()
    .split(' ')[1];
} catch (_error) {
  process.exit(1);
}

// Check versions
let hasError = false;

if (currentNode !== requiredNode) {
  hasError = true;
}

if (currentPython !== requiredPython) {
  hasError = true;
}

if (hasError) {
  process.exit(1);
} else {
  process.stdout.write('✅ All versions match!\n');
  process.stdout.write(`   Node:   ${currentNode}\n`);
  process.stdout.write(`   Python: ${currentPython}\n`);
}
