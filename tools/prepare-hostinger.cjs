#!/usr/bin/env node

/**
 * Prepare backend for Hostinger deployment
 * - Copies backend/ to dist/backend/
 * - Installs production dependencies
 * - Creates necessary .env file placeholder
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BACKEND_SRC = path.join(__dirname, '../backend');
const BACKEND_DEST = path.join(__dirname, '../dist/backend');

console.log('📦 Preparing backend for Hostinger deployment...\n');

// ── Step 1: Remove existing backend directory if it exists ──────────────────
if (fs.existsSync(BACKEND_DEST)) {
  console.log('Removing existing dist/backend...');
  fs.rmSync(BACKEND_DEST, { recursive: true, force: true });
}

// ── Step 2: Copy backend files (excluding node_modules and .env) ────────────
console.log('Copying backend files to dist/backend...');

function copyDir(src, dest, excludes = []) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const items = fs.readdirSync(src);

  items.forEach((item) => {
    if (excludes.includes(item)) return;

    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      copyDir(srcPath, destPath, excludes);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

copyDir(BACKEND_SRC, BACKEND_DEST, ['node_modules', '.env', '.env.local']);

// ── Step 3: Install production dependencies in dist/backend ────────────────
console.log('Installing production dependencies in dist/backend...');
try {
  execSync('npm install --omit=dev', {
    cwd: BACKEND_DEST,
    stdio: 'inherit',
  });
  console.log('✅ Dependencies installed\n');
} catch (err) {
  console.error('❌ Failed to install dependencies:', err.message);
  process.exit(1);
}

// ── Step 4: Create .env placeholder if it doesn't exist ────────────────────
const envPath = path.join(BACKEND_DEST, '.env');
if (!fs.existsSync(envPath)) {
  console.log('Creating .env placeholder...');
  fs.writeFileSync(
    envPath,
    `# Backend environment variables (set in Hostinger panel)
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://loversapp.donydonitasss.com
DB_PATH=./database/loversapp.db
# Email, JWT, Admin settings should be configured in Hostinger environment variables
`,
    'utf8'
  );
}

console.log('✅ Backend preparation complete!');
console.log('📂 Structure:');
console.log('   dist/');
console.log('   ├── index.html (frontend SPA)');
console.log('   ├── assets/');
console.log('   └── backend/');
console.log('       ├── server.js');
console.log('       ├── package.json');
console.log('       ├── node_modules/');
console.log('       ├── database/');
console.log('       ├── routes/');
console.log('       ├── middleware/');
console.log('       └── .env (placeholder)');
console.log('\n📝 Next: Update Hostinger settings to use Entry file: backend/server.js\n');
