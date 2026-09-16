const fs = require('fs');
let code = fs.readFileSync('backend/src/modules/courses/course.service.ts', 'utf8');

code = code.replace(
  "static async requestReview",
  "static async getCourseStudents(courseId: string, query: any) {\n    const Enrollment = require('../learning/enrollment.model').Enrollment;\n    const page = parseInt(query.page) || 1;\n    const limit = parseInt(query.limit) || 10;\n    const skip = (page - 1) * limit;\n    const enrollments = await Enrollment.find({ courseId })\n      .populate('userId', 'firstName lastName email avatar')\n      .sort({ createdAt: -1 })\n      .skip(skip)\n      .limit(limit);\n    const total = await Enrollment.countDocuments({ courseId });\n    return { students: enrollments, total, page, pages: Math.ceil(total / limit) };\n  }\n\n  static async requestReview"
);

fs.writeFileSync('backend/src/modules/courses/course.service.ts', code);
