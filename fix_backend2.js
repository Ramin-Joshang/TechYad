const fs = require('fs');

function fixFile(filePath) {
    let code = fs.readFileSync(filePath, 'utf8');
    
    // Specifically for commerce.service.ts
    code = code.replace(/import { Course } from '\.\.\/courses\/course\.model\.js';\nimport { Course } from '\.\.\/courses\/course\.model\.js';/g, "import { Course } from '../courses/course.model.js';");
    
    // For lesson possibly null
    code = code.replace(/lesson\.title/g, 'lesson?.title');
    
    fs.writeFileSync(filePath, code);
}

fixFile('backend/src/modules/commerce/commerce.service.ts');
fixFile('backend/src/modules/learning/assignment.service.ts');
fixFile('backend/src/modules/learning/quiz.service.ts');
console.log('Fixed TypeScript errors');
