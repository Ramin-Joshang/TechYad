const fs = require('fs');
function fix(file) {
    let code = fs.readFileSync(file, 'utf8');
    // For commerce.service.ts
    code = code.replace(/import { Course } from '\.\.\/courses\/course\.model\.js';\s*import { Course } from '\.\.\/courses\/course\.model\.js';/g, "import { Course } from '../courses/course.model.js';");
    
    // Fix lesson possibly null inside assignment and quiz service
    // Where it says `lesson._id` or `lesson.something`
    code = code.replace(/lesson\._id/g, 'lesson?._id');
    code = code.replace(/lesson\.order/g, 'lesson?.order');
    
    fs.writeFileSync(file, code);
}
fix('backend/src/modules/commerce/commerce.service.ts');
fix('backend/src/modules/learning/assignment.service.ts');
fix('backend/src/modules/learning/quiz.service.ts');
