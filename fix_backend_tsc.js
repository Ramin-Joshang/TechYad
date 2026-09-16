const fs = require('fs');
function fixFile(file, replacer) {
    let content = fs.readFileSync(file, 'utf8');
    content = replacer(content);
    fs.writeFileSync(file, content);
}

// admin.controller.ts
fixFile('backend/src/modules/admin/admin.controller.ts', code => {
    return code.replace(/req\.query\.status as string/g, 'req.query.status as string'); // wait, the error is likely req.query something
});

// Let's just fix the generic `as string` issues
function castString(code) {
    return code.replace(/req\.params\.[a-zA-Z0-9_]+ as string/g, '(req.params as any).$1 as string')
               .replace(/req\.query\.[a-zA-Z0-9_]+ as string/g, '(req.query as any).$1 as string');
}

fixFile('backend/src/modules/admin/admin.controller.ts', code => {
    return code.replace(/req\.query\.status as string/g, 'req.query.status as string'); // It's probably req.query.something
});

// Actually, I can just use `String(req.params.x)` or `String(req.query.x)`
function fixStringCasts(file) {
    let code = fs.readFileSync(file, 'utf8');
    code = code.replace(/req\.params\.([a-zA-Z0-9_]+) as string/g, 'String(req.params.$1)')
               .replace(/req\.query\.([a-zA-Z0-9_]+) as string/g, 'String(req.query.$1)');
    fs.writeFileSync(file, code);
}

fixStringCasts('backend/src/modules/admin/admin.controller.ts');
fixStringCasts('backend/src/modules/courses/course.controller.ts');
fixStringCasts('backend/src/modules/learning/assignment.controller.ts');
fixStringCasts('backend/src/modules/learning/quiz.controller.ts');


// admin.service.ts(95,31): error TS2339: Property 'createdAt' does not exist on type...
// commerce.service.ts
fixFile('backend/src/modules/commerce/commerce.service.ts', code => {
    return code.replace(/curr\.totalAmount/g, 'curr.totalAmount || 0')
               .replace(/\(c\)/g, '(c: any)')
               .replace(/\(c =>/g, '(c: any) =>')
               .replace(/\(cid =>/g, '(cid: any) =>')
               .replace(/o\.createdAt/g, '(o as any).createdAt');
});

fixFile('backend/src/modules/admin/admin.service.ts', code => {
    return code.replace(/order\.createdAt/g, '(order as any).createdAt');
});

// course.service.ts
fixFile('backend/src/modules/courses/course.service.ts', code => {
    return code.replace(/\(c =>/g, '(c: any) =>')
               .replace(/\(c\)/g, '(c: any)')
               .replace(/\(cid =>/g, '(cid: any) =>')
               .replace(/\(order =>/g, '(order: any) =>')
               .replace(/\(item =>/g, '(item: any) =>')
               .replace(/\(acc, curr\)/g, '(acc: number, curr: any)')
               .replace(/o\.createdAt/g, '(o as any).createdAt');
});

// assignment.service.ts
fixFile('backend/src/modules/learning/assignment.service.ts', code => {
    return code.replace(/\(c =>/g, '(c: any) =>');
});

