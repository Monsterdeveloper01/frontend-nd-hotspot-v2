const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/pages/admin');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

const replacements = [
  { from: /bg-white/g, to: 'bg-admin-card' },
  { from: /bg-slate-50/g, to: 'bg-zinc-900/50' },
  { from: /bg-gray-50/g, to: 'bg-zinc-900/50' },
  { from: /bg-slate-100/g, to: 'bg-zinc-800' },
  { from: /bg-gray-100/g, to: 'bg-zinc-800' },
  { from: /border-slate-100/g, to: 'border-admin-border' },
  { from: /border-gray-100/g, to: 'border-admin-border' },
  { from: /border-slate-200/g, to: 'border-admin-border' },
  { from: /border-gray-200/g, to: 'border-admin-border' },
  { from: /text-gray-900/g, to: 'text-zinc-100' },
  { from: /text-slate-900/g, to: 'text-zinc-100' },
  { from: /text-gray-800/g, to: 'text-zinc-200' },
  { from: /text-slate-800/g, to: 'text-zinc-200' },
  { from: /text-gray-700/g, to: 'text-zinc-300' },
  { from: /text-slate-700/g, to: 'text-zinc-300' },
  { from: /text-gray-600/g, to: 'text-zinc-300' },
  { from: /text-slate-600/g, to: 'text-zinc-300' },
  { from: /text-gray-500/g, to: 'text-zinc-400' },
  { from: /text-slate-500/g, to: 'text-zinc-400' },
  { from: /text-gray-400/g, to: 'text-zinc-500' },
  { from: /text-slate-400/g, to: 'text-zinc-500' },
  { from: /divide-gray-100/g, to: 'divide-admin-border' },
  { from: /divide-slate-100/g, to: 'divide-admin-border' },
  { from: /divide-gray-200/g, to: 'divide-admin-border' },
  { from: /divide-slate-200/g, to: 'divide-admin-border' },
  { from: /shadow-md/g, to: 'shadow-sm shadow-black/10' },
];

for (const file of files) {
  if (file === 'AdminDashboard.jsx') continue; // Already manually fixed
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  for (const { from, to } of replacements) {
    content = content.replace(from, to);
  }
  
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('Migrated', file);
}
