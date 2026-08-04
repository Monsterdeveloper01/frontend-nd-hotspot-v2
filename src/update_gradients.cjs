const fs = require('fs');
const path = require('path');

const directory = 'd:/Application/examppp/htdocs/nd-hotspot-2.0/frontend/src';

const walk = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.jsx')) {
            results.push(file);
        }
    });
    return results;
};

const files = walk(directory);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Update the light color to a lighter one if it has the nb object
    content = content.replace(/const nb = \{ dark: '#0e4696', mid: '#1877f2', light: '#3b82f6' \}/g, "const nb = { dark: '#0e4696', mid: '#1877f2', light: '#60a5fa' }");
    
    // Update gradient from dark -> light to mid -> light
    content = content.replace(/\$\{nb\.dark\}, \$\{nb\.light\}/g, '${nb.mid}, ${nb.light}');
    content = content.replace(/\$\{nb\.dark\}, \$\{nb\.mid\}, \$\{nb\.light\}/g, '${nb.mid}, ${nb.light}');
    
    // Fix inline colors in App.jsx and any other places using raw hex
    content = content.replace(/#1e3a8a, #1d4ed8, #2563eb/g, '#1877f2, #60a5fa');
    content = content.replace(/#1e3a8a, #2563eb/g, '#1877f2, #60a5fa');
    
    fs.writeFileSync(file, content, 'utf8');
});
console.log('Update complete');
