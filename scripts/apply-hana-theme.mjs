import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

const replacements = [
  ['bg-[#FDFBF7]', 'bg-[#F4F7F4]'],
  ['blue-950', 'emerald-950'],
  ['blue-900', 'emerald-900'],
  ['blue-800', 'emerald-800'],
  ['blue-700', 'emerald-700'],
  ['blue-600', 'emerald-600'],
  ['blue-500', 'emerald-500'],
  ['blue-400', 'emerald-400'],
  ['blue-300', 'emerald-300'],
  ['blue-200', 'emerald-200'],
  ['blue-100', 'emerald-100'],
  ['blue-50', 'emerald-50'],
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === 'scripts') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) files.push(full);
  }
  return files;
}

let count = 0;
for (const file of walk(root)) {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  for (const [from, to] of replacements) {
    content = content.split(from).join(to);
  }
  if (content !== original) {
    fs.writeFileSync(file, content);
    count += 1;
    console.log(path.relative(root, file));
  }
}
console.log(`Updated ${count} files.`);
