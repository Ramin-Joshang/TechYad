const fs = require('fs');

function fixFile(filePath) {
    let code = fs.readFileSync(filePath, 'utf8');
    
    // Remove duplicate imports
    const imports = [];
    const importRegex = /^import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"];/gm;
    let match;
    const newCodeLines = [];
    const usedImports = new Set();

    // Instead of complex regex, let's just use string replace for duplicates specifically since we know what they are
    code = code.replace(/import { Assignment } from '\.\/assignment\.model\.js';\nimport { Course } from '\.\.\/courses\/course\.model\.js';\nimport { Lesson } from '\.\.\/courses\/lesson\.model\.js';\n/, '');
    code = code.replace(/import { Quiz } from '\.\/quiz\.model\.js';\nimport { Course } from '\.\.\/courses\/course\.model\.js';\nimport { Lesson } from '\.\.\/courses\/lesson\.model\.js';\n/, '');
    code = code.replace(/import { Course } from '\.\.\/courses\/course\.model\.js';\nimport { Course } from '\.\.\/courses\/course\.model\.js';/, "import { Course } from '../courses/course.model.js';");
    
    // Fix lesson is possibly null
    code = code.replace(/lesson\.title/g, 'lesson?.title');
    
    // Fix createdAt
    code = code.replace(/order\.createdAt/g, '(order as any).createdAt');
    code = code.replace(/curr\.createdAt/g, '(curr as any).createdAt');
    code = code.replace(/o\.createdAt/g, '(o as any).createdAt');
    
    fs.writeFileSync(filePath, code);
}

const files = [
    'backend/src/modules/admin/admin.service.ts',
    'backend/src/modules/commerce/commerce.service.ts',
    'backend/src/modules/courses/course.service.ts',
    'backend/src/modules/learning/assignment.service.ts',
    'backend/src/modules/learning/quiz.service.ts'
];

files.forEach(fixFile);
console.log('Fixed TypeScript errors');
