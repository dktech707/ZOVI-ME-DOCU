import fs from 'node:fs';

function exists(p) { return fs.existsSync(p); }

const checks = [
  'package.json',
  'apps/web/package.json',
  'apps/api/package.json',
  'packages/shared/package.json'
];

let ok = true;
for (const c of checks) {
  if (!exists(c)) { console.error('Missing:', c); ok = false; }
}
if (ok) console.log('VERIFY OK');
process.exit(ok ? 0 : 1);
