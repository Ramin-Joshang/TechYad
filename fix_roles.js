const fs = require('fs');
let code = fs.readFileSync('backend/src/seed.ts', 'utf8');
code = code.replace(
  "'courses.read', 'courses.manage', 'courses.publish',",
  "'courses.read', 'courses.manage', 'courses.publish', 'create_course', 'create_class',"
);
fs.writeFileSync('backend/src/seed.ts', code);
