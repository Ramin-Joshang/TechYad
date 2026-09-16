const fs = require('fs');
let code = fs.readFileSync('frontend/src/app/(dashboard)/student/courses/page.tsx', 'utf8');

code = code.replace("onChange={(e) =>", "onChange={(e: any) =>");

fs.writeFileSync('frontend/src/app/(dashboard)/student/courses/page.tsx', code);
