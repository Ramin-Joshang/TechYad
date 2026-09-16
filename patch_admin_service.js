const fs = require('fs');
let code = fs.readFileSync('backend/src/modules/courses/course.service.ts', 'utf8');

code = code.replace(
  "static async publishCourse",
  "static async getAdminCourses(query: any) {\n    const page = parseInt(query.page) || 1;\n    const limit = parseInt(query.limit) || 10;\n    const skip = (page - 1) * limit;\n    const filter: any = {};\n    if (query.status) filter.status = query.status;\n    const courses = await Course.find(filter)\n      .populate('instructors', 'firstName lastName avatar')\n      .sort({ updatedAt: -1 })\n      .skip(skip)\n      .limit(limit);\n    const total = await Course.countDocuments(filter);\n    return { courses, total, page, pages: Math.ceil(total / limit) };\n  }\n\n  static async publishCourse"
);

fs.writeFileSync('backend/src/modules/courses/course.service.ts', code);
