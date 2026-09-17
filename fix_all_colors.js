const fs = require('fs');
const path = require('path');

const dirsToScan = [
    'frontend/src/app/(public)',
    'frontend/src/components',
];

const walk = (dir) => {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
};

const replaceColors = (content) => {
    let code = content;
    
    // Grays -> Neo equivalents
    code = code.replace(/bg-gray-900\/50/g, "bg-black/50"); // Keep overlays dark
    code = code.replace(/bg-gray-900/g, "bg-[var(--neo-text-main)]");
    code = code.replace(/text-gray-900/g, "text-[var(--neo-text-main)]");
    code = code.replace(/border-gray-900/g, "border-[var(--neo-text-main)]");
    
    code = code.replace(/bg-gray-800/g, "bg-[var(--neo-text-main)]");
    code = code.replace(/text-gray-800/g, "text-[var(--neo-text-main)]");
    code = code.replace(/border-gray-800/g, "border-[var(--neo-text-main)]");

    code = code.replace(/bg-gray-700/g, "bg-[var(--neo-text-secondary)]");
    code = code.replace(/text-gray-700/g, "text-[var(--neo-text-secondary)]");
    
    code = code.replace(/bg-gray-600/g, "bg-[var(--neo-text-secondary)]");
    code = code.replace(/text-gray-600/g, "text-[var(--neo-text-secondary)]");
    
    code = code.replace(/bg-gray-500/g, "bg-[var(--neo-text-muted)]");
    code = code.replace(/text-gray-500/g, "text-[var(--neo-text-muted)]");
    
    code = code.replace(/bg-gray-400/g, "bg-[var(--neo-text-muted)]");
    code = code.replace(/text-gray-400/g, "text-[var(--neo-text-muted)]");

    code = code.replace(/bg-gray-300/g, "bg-[var(--neo-border)]");
    code = code.replace(/border-gray-300/g, "border-[var(--neo-border)]");
    
    code = code.replace(/bg-gray-200/g, "bg-[var(--neo-border)]");
    code = code.replace(/border-gray-200/g, "border-[var(--neo-border)]");
    
    code = code.replace(/bg-gray-100/g, "bg-[var(--neo-surface-2)]");
    code = code.replace(/border-gray-100/g, "border-[var(--neo-border)]");
    code = code.replace(/hover:bg-gray-100/g, "hover:bg-[var(--neo-surface-2)]");
    
    code = code.replace(/bg-gray-50/g, "bg-[var(--neo-bg)]");
    code = code.replace(/hover:bg-gray-50/g, "hover:bg-[var(--neo-surface-2)]");
    
    // Blues -> Primary/Secondary
    code = code.replace(/bg-blue-600/g, "bg-[var(--neo-primary)]");
    code = code.replace(/text-blue-600/g, "text-[var(--neo-primary)]");
    code = code.replace(/border-blue-600/g, "border-[var(--neo-primary)]");
    code = code.replace(/hover:bg-blue-600/g, "hover:bg-[var(--neo-primary)]");
    code = code.replace(/hover:text-blue-600/g, "hover:text-[var(--neo-primary)]");
    code = code.replace(/hover:border-blue-600/g, "hover:border-[var(--neo-primary)]");
    code = code.replace(/ring-blue-600/g, "ring-[var(--neo-primary)]");
    code = code.replace(/focus:border-blue-600/g, "focus:border-[var(--neo-primary)]");
    code = code.replace(/focus:ring-blue-600/g, "focus:ring-[var(--neo-primary)]");
    
    code = code.replace(/bg-blue-500/g, "bg-[var(--neo-secondary)]");
    code = code.replace(/text-blue-500/g, "text-[var(--neo-secondary)]");
    code = code.replace(/border-blue-500/g, "border-[var(--neo-secondary)]");
    
    code = code.replace(/bg-blue-100/g, "bg-[var(--neo-primary)]/10");
    code = code.replace(/text-blue-100/g, "text-[var(--neo-primary)]/10");
    
    code = code.replace(/bg-blue-50/g, "bg-[var(--neo-primary)]/5");
    code = code.replace(/text-blue-50/g, "text-[var(--neo-primary)]/5");

    code = code.replace(/shadow-blue-900/g, "shadow-[var(--neo-primary)]");
    code = code.replace(/shadow-blue-600/g, "shadow-[var(--neo-primary)]");

    return code;
};

let files = [];
dirsToScan.forEach(dir => {
    files = files.concat(walk(dir));
});

files.forEach(file => {
    const original = fs.readFileSync(file, 'utf8');
    const updated = replaceColors(original);
    if (original !== updated) {
        fs.writeFileSync(file, updated);
        console.log('Updated:', file);
    }
});
