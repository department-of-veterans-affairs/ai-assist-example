#!/usr/bin/env node

const { execSync } = require('child_process');
const { readFileSync } = require('fs');
const { join } = require('path');

// Read required versions from mise config
const miseConfig = readFileSync(join(__dirname, '..', '.mise.toml'), 'utf8');
const requiredNode = miseConfig.match(/node = "([^"]+)"/)?.[1];
const requiredPython = miseConfig.match(/python = "([^"]+)"/)?.[1];

// Get current versions
let currentNode, currentPython;

try {
  currentNode = execSync('node --version', { encoding: 'utf8' }).trim().slice(1);
  currentPython = execSync('python --version', { encoding: 'utf8' }).trim().split(' ')[1];
} catch (error) {
  console.error('❌ Error checking versions:', error.message);
  process.exit(1);
}

// Check versions
let hasError = false;

if (currentNode !== requiredNode) {
  console.error(`❌ Node version mismatch:
   Required: ${requiredNode}
   Current:  ${currentNode}
   
   Please install the correct version using mise, nvm, or fnm`);
  hasError = true;
}

if (currentPython !== requiredPython) {
  console.error(`❌ Python version mismatch:
   Required: ${requiredPython}
   Current:  ${currentPython}
   
   Please install the correct version using mise, pyenv, or python.org`);
  hasError = true;
}

if (!hasError) {
  console.log('✅ All versions match!');
  console.log(`   Node:   ${currentNode}`);
  console.log(`   Python: ${currentPython}`);
} else {
  console.log('\n💡 Tip: Run "mise install" to automatically install the correct versions');
  process.exit(1);
}