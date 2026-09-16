const fs = require('fs');
let code = fs.readFileSync('frontend/src/app/(dashboard)/instructor/assignments/page.tsx', 'utf8');

code = code.replace("api.patch(`/instructor/submissions/${data.id}/grade`, { grade: data.grade, feedback: data.feedback })", "api.patch(`/instructor/submissions/${data.id}/grade`, { score: data.grade, feedback: data.feedback })");

fs.writeFileSync('frontend/src/app/(dashboard)/instructor/assignments/page.tsx', code);
