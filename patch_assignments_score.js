const fs = require('fs');
let code = fs.readFileSync('frontend/src/app/(dashboard)/instructor/assignments/page.tsx', 'utf8');

code = code.replace("نمره: {sub.grade}", "نمره: {sub.score}");

fs.writeFileSync('frontend/src/app/(dashboard)/instructor/assignments/page.tsx', code);
