const fs = require('fs');
let code = fs.readFileSync('backend/src/modules/courses/course.service.ts', 'utf8');

code = code.replace(
  `  static async createCourse(instructorId: string, data: any) {
    return await Course.create({
      ...data,
      instructors: [instructorId],
      createdBy: instructorId,
      status: 'draft'
    });
  }`,
  `  static async createCourse(instructorId: string, data: any) {
    return await Course.create({
      ...data,
      instructors: data.instructors?.length > 0 ? data.instructors : [instructorId],
      createdBy: instructorId,
      status: 'draft'
    });
  }`
);
fs.writeFileSync('backend/src/modules/courses/course.service.ts', code);
