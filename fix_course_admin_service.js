const fs = require('fs');
let code = fs.readFileSync('backend/src/modules/courses/course.service.ts', 'utf8');

code = code.replace(
  'static async updateCourse(id: string, instructorId: string, data: any) {',
  `static async updateCourse(id: string, instructorId: string, data: any, overrideAuth: boolean = false) {`
);

code = code.replace(
  `const course = await Course.findOneAndUpdate(
      { _id: id, instructors: instructorId },
      data,
      { new: true, runValidators: true }
    );`,
  `const query = overrideAuth ? { _id: id } : { _id: id, instructors: instructorId };
    const course = await Course.findOneAndUpdate(
      query,
      data,
      { new: true, runValidators: true }
    );`
);

code = code.replace(
  `static async deleteCourse(id: string) {`,
  `// this string doesn't exist yet, we will append it`
);

fs.writeFileSync('backend/src/modules/courses/course.service.ts', code);
