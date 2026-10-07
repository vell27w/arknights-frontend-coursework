const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'demo2');
const output = path.join(root, 'dist');
// Only this fixed, generated directory is replaced; source files are never removed.
if (path.dirname(output) !== root || path.basename(output) !== 'dist') throw new Error('Invalid output directory');
fs.rmSync(output, {recursive:true, force:true});
fs.mkdirSync(output);
fs.cpSync(source, output, {recursive:true});
fs.copyFileSync(path.join(source, 'main.html'), path.join(output, 'index.html'));
fs.copyFileSync(path.join(root, 'deploy', '_headers'), path.join(output, '_headers'));
fs.copyFileSync(path.join(root, 'deploy', '404.html'), path.join(output, '404.html'));
let count = 0, total = 0;
function validate(directory) {
  for (const entry of fs.readdirSync(directory, {withFileTypes:true})) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) validate(target);
    else {
      const size = fs.statSync(target).size;
      if (size > 25 * 1024 * 1024) throw new Error(`Cloudflare Pages file limit exceeded: ${path.relative(output,target)}`);
      count++; total += size;
    }
  }
}
validate(output);
console.log(`Deployment ready: ${count} files, ${(total/1024/1024).toFixed(2)} MiB. Every asset is below 25 MiB.`);
