const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');
const root = __dirname;
const isolated = fs.mkdtempSync(path.join(os.tmpdir(), 'kadeo-experience-'));
// Existing tests write local fixtures: redirect every such write to a disposable copy.
for (const dir of ['src', 'tests', 'supabase', 'node_modules']) fs.symlinkSync(path.join(root, dir), path.join(isolated, dir), 'junction');
fs.copyFileSync(path.join(root, 'kadeo-local-db.json'), path.join(isolated, 'kadeo-local-db.json'));
const files = fs.readdirSync(path.join(root, 'tests/unit')).filter(name => /\.test\.(mjs|cjs)$/.test(name)).map(name => path.join(root, 'tests/unit', name));
const result = spawnSync(process.execPath, ['--test', '--test-concurrency=1', ...files], { cwd: isolated, encoding: 'utf8', timeout: 90000 });
fs.writeFileSync(path.join(root, 'experience-tests.log'), result.stdout + result.stderr);
console.log((result.stdout + result.stderr).split('\n').slice(-16).join('\n'));
console.log('Isolated test directory:', isolated);
process.exitCode = result.status ?? 1;
