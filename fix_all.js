const fs = require('fs');

function fixSyntax(file) {
    let code = fs.readFileSync(file, 'utf8');
    
    code = code.replace(/\.filterc =>/g, '.filter((c: any) =>')
               .replace(/\.mapc =>/g, '.map((c: any) =>')
               .replace(/\.forEachorder =>/g, '.forEach((order: any) =>')
               .replace(/\.filteritem =>/g, '.filter((item: any) =>')
               .replace(/\.somecid =>/g, '.some((cid: any) =>')
               .replace(/\.reduce\(\(acc, curr\)/g, '.reduce((acc: number, curr: any)');
               
    // Fix Assignment Service
    code = code.replace(/\.findc =>/g, '.find((c: any) =>')
               .replace(/\.mapc =>/g, '.map((c: any) =>')
               .replace(/\.filterc =>/g, '.filter((c: any) =>');
               
    // Fix Commerce Service
    code = code.replace(/\.mapitem =>/g, '.map((item: any) =>')
               .replace(/\.filteritem =>/g, '.filter((item: any) =>')
               .replace(/\.somecid =>/g, '.some((cid: any) =>')
               .replace(/\.finditem =>/g, '.find((item: any) =>');
               
    fs.writeFileSync(file, code);
}

fixSyntax('backend/src/modules/courses/course.service.ts');
fixSyntax('backend/src/modules/commerce/commerce.service.ts');
fixSyntax('backend/src/modules/learning/assignment.service.ts');

