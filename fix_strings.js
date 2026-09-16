const fs = require('fs');
function patch(file) {
    let code = fs.readFileSync(file, 'utf8');
    code = code.replace(/req\.params\.[a-zA-Z0-9_]+/g, 'String($&)')
               .replace(/String\(String\(/g, 'String(')
               .replace(/\)\)/g, ')') // simple fix, might break something, let's just use `as string` properly.
               // Actually the issue is `req.params.id as string` is still failing if it's string | string[]. 
               // The easiest fix is `req.params.id as any as string`
    
    // Better:
    code = code.replace(/req\.params\.([a-zA-Z0-9_]+) as string/g, 'req.params.$1 as any as string')
               .replace(/req\.query\.([a-zA-Z0-9_]+) as string/g, 'req.query.$1 as any as string')
               .replace(/String\(req\.params\.([a-zA-Z0-9_]+)\)/g, 'req.params.$1 as any as string')
               .replace(/String\(req\.query\.([a-zA-Z0-9_]+)\)/g, 'req.query.$1 as any as string')
               .replace(/req\.params\.([a-zA-Z0-9_]+)/g, '(req.params.$1 as any as string)');
    fs.writeFileSync(file, code);
}
patch('backend/src/modules/admin/admin.controller.ts');
patch('backend/src/modules/courses/course.controller.ts');
patch('backend/src/modules/learning/assignment.controller.ts');
patch('backend/src/modules/learning/quiz.controller.ts');
