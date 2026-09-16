const fs = require('fs');
let svcCode = fs.readFileSync('backend/src/modules/classes/class.service.ts', 'utf8');

svcCode = svcCode.replace(
  "return await Class.create({",
  "return await Class.create({\n      capacity: data.capacity || data.maxStudents,"
);

fs.writeFileSync('backend/src/modules/classes/class.service.ts', svcCode);
