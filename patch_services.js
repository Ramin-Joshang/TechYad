const fs = require('fs');

function fixCommerce() {
    let code = fs.readFileSync('backend/src/modules/commerce/commerce.service.ts', 'utf8');
    // It's probably completely mangled. Let's try to just fix the specific typings
    // Wait, I can just use any typing where needed.
    code = code.replace(/\(c: any\) =>/g, 'c =>');
    code = code.replace(/\(cid: any\) =>/g, 'cid =>');
    code = code.replace(/\(o as any\)\.createdAt/g, 'o.createdAt');
    code = code.replace(/curr\.totalAmount \|\| 0/g, 'curr.totalAmount');
    fs.writeFileSync('backend/src/modules/commerce/commerce.service.ts', code);
}
try { fixCommerce(); } catch (e) {}

function fixCourse() {
    let code = fs.readFileSync('backend/src/modules/courses/course.service.ts', 'utf8');
    code = code.replace(/\(c: any\) =>/g, 'c =>');
    code = code.replace(/\(cid: any\) =>/g, 'cid =>');
    code = code.replace(/\(order: any\) =>/g, 'order =>');
    code = code.replace(/\(item: any\) =>/g, 'item =>');
    code = code.replace(/\(acc: number, curr: any\)/g, '(acc, curr)');
    code = code.replace(/\(o as any\)\.createdAt/g, 'o.createdAt');
    fs.writeFileSync('backend/src/modules/courses/course.service.ts', code);
}
try { fixCourse(); } catch (e) {}

function fixAssign() {
    let code = fs.readFileSync('backend/src/modules/learning/assignment.service.ts', 'utf8');
    code = code.replace(/\(c: any\) =>/g, 'c =>');
    fs.writeFileSync('backend/src/modules/learning/assignment.service.ts', code);
}
try { fixAssign(); } catch(e) {}
