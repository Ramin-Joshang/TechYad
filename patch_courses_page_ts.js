const fs = require('fs');
let code = fs.readFileSync('frontend/src/app/(dashboard)/instructor/courses/page.tsx', 'utf8');

code = code.replace("data?.pages > 1", "data && data.pages > 1");
code = code.replace("[...Array(data.pages)]", "[...Array(data?.pages || 0)]");

fs.writeFileSync('frontend/src/app/(dashboard)/instructor/courses/page.tsx', code);
