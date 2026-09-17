const fs = require('fs');

const files = [
    'frontend/src/app/(auth)/login/page.tsx',
    'frontend/src/app/(auth)/register/page.tsx',
    'frontend/src/app/(auth)/forgot-password/page.tsx',
    'frontend/src/app/(auth)/reset-password/page.tsx',
];

files.forEach(file => {
    if (fs.existsSync(file)) {
        let code = fs.readFileSync(file, 'utf8');
        code = code.replace(/focus:ring-blue-500/g, "focus:ring-[var(--neo-primary)]");
        code = code.replace(/hover:bg-blue-700/g, "hover:bg-opacity-90");
        code = code.replace(/hover:text-blue-700/g, "hover:text-opacity-80");
        code = code.replace(/bg-blue-600/g, "bg-[var(--neo-primary)]");
        code = code.replace(/text-blue-600/g, "text-[var(--neo-primary)]");
        
        fs.writeFileSync(file, code);
    }
});
