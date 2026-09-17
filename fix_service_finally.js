const fs = require('fs');
let code = fs.readFileSync('backend/src/modules/courses/course.service.ts', 'utf8');

code = code.replace(
  'static async getInstructorCourseById(courseId: string, instructorId: string) {',
  `static async getCourseById(id: string) {
    const course = await Course.findById(id).populate('categoryId subjectId fieldId levelId instructors');
    if (!course) throw new AppError('Course not found', 404);
    return course;
  }
  
  static async getInstructorCourseById(courseId: string, instructorId: string) {`
);

fs.writeFileSync('backend/src/modules/courses/course.service.ts', code);
