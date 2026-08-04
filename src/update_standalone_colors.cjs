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
    
    // Replace all leftover #1e3a8a (old dark) with #0e4696 (new dark)
    content = content.replace(/#1e3a8a/g, '#0e4696');
    
    // Replace all leftover #1d4ed8 (old mid) with #1877f2 (new mid)
    content = content.replace(/#1d4ed8/g, '#1877f2');
    
    // Replace all leftover #2563eb (old light) with #60a5fa (new light)
    content = content.replace(/#2563eb/g, '#60a5fa');
    
    fs.writeFileSync(file, content, 'utf8');
});
console.log('Update standalone colors complete');
