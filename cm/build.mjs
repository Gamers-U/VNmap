import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
const pkgs = ['@codemirror/state', '@codemirror/view', '@codemirror/commands', '@codemirror/language', '@codemirror/search', '@codemirror/autocomplete', '@codemirror/lint', '@lezer/highlight', '@replit/codemirror-minimap'];
const ver = {};
for (const p of pkgs) { const f = `node_modules/${p}/package.json`; ver[p] = existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')).version : '?'; }
mkdirSync('dist', { recursive: true });
await build({
  entryPoints: ['entry.js'], bundle: true, minify: true, format: 'iife', globalName: 'CM6', target: 'es2019',
  outfile: 'dist/cm6.js', legalComments: 'eof', charset: 'utf8',
  banner: { js: '/* CodeMirror 6 (MIT): ' + pkgs.map(p => p + ' ' + ver[p]).join(', ') + ' */' },
});
writeFileSync('dist/versions.json', JSON.stringify(ver, null, 2) + '\n');
const size = readFileSync('dist/cm6.js').length;
console.log('cm6.js', size, 'bytes', JSON.stringify(ver));
