const fs = require('fs');
const path = require('path');

const dirsToSearch = [
  path.join(__dirname, 'src/pages/admin'),
  path.join(__dirname, 'src/components/admin'),
  path.join(__dirname, 'src/components'),
  path.join(__dirname, 'src/pages')
];

const replacements = [
  { from: /text-zinc-100/g, to: 'text-admin-text' },
  { from: /text-zinc-200/g, to: 'text-admin-text' },
  { from: /text-zinc-300/g, to: 'text-admin-text' },
  { from: /text-zinc-400/g, to: 'text-admin-muted' },
  { from: /text-zinc-500/g, to: 'text-admin-muted' },
  { from: /text-zinc-600/g, to: 'text-admin-muted' },
  { from: /bg-zinc-800/g, to: 'bg-admin-base' },
  { from: /bg-zinc-900\/50/g, to: 'bg-admin-base' },
  { from: /bg-zinc-900/g, to: 'bg-admin-base' },
  { from: /bg-zinc-950\/50/g, to: 'bg-admin-card' },
  { from: /bg-zinc-950/g, to: 'bg-admin-base' },
  { from: /border-zinc-700\/50/g, to: 'border-admin-border' },
  { from: /border-zinc-700/g, to: 'border-admin-border' },
  { from: /border-zinc-800/g, to: 'border-admin-border' },
  // For AdminLogin
  { from: /text-white/g, to: 'text-admin-text' }, // CAUTION: might break some things, better be careful
];

function processDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (file.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      let changed = false;
      for (const { from, to } of replacements) {
        if (from.test(content)) {
          content = content.replace(from, to);
          changed = true;
        }
      }
      
      // Specifically fix text-white inside AdminLogin and components
      if (file === 'AdminLogin.jsx' || file === 'AdminLayout.jsx' || file.startsWith('Admin')) {
        content = content.replace(/text-white/g, 'text-admin-text');
        content = content.replace(/text-zinc-900/g, 'text-admin-text'); // for button text
        content = content.replace(/bg-zinc-100/g, 'bg-admin-accent'); 
        content = content.replace(/hover:bg-white/g, 'hover:bg-admin-accent/90');
        // Fix Chart config colors in AdminDashboard.jsx
        if (file === 'AdminDashboard.jsx') {
           content = content.replace(/backgroundColor: '#18181b'/g, "backgroundColor: '#ffffff'");
           content = content.replace(/titleColor: '#a1a1aa'/g, "titleColor: '#64748b'");
           content = content.replace(/bodyColor: '#f4f4f5'/g, "bodyColor: '#0f172a'");
           content = content.replace(/borderColor: '#27272a'/g, "borderColor: '#e2e8f0'");
           content = content.replace(/color: 'rgba\(255, 255, 255, 0\.05\)'/g, "color: '#f1f5f9'");
           content = content.replace(/color: '#71717a'/g, "color: '#64748b'");
        }
        changed = true;
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf-8');
        console.log('Migrated', file);
      }
    }
  }
}

for (const dir of dirsToSearch) {
  processDir(dir);
}
