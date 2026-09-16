const fs = require('fs');
let code = fs.readFileSync('backend/src/modules/courses/course.service.ts', 'utf8');

code = code.replace(
  "{ _id: id, instructors: instructorId, status: 'draft' },",
  "{ _id: id, instructors: instructorId, status: { $in: ['draft', 'rejected'] } },"
);

fs.writeFileSync('backend/src/modules/courses/course.service.ts', code);
