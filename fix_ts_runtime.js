const fs = require('fs');

function patch(filePath) {
    let code = fs.readFileSync(filePath, 'utf8');
    code = code.replace(/lesson\.courseId/g, 'lesson?.courseId');
    fs.writeFileSync(filePath, code);
}
patch('backend/src/modules/learning/assignment.service.ts');
patch('backend/src/modules/learning/quiz.service.ts');
