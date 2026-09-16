const fs = require('fs');
let code = fs.readFileSync('backend/src/modules/learning/assignment.service.ts', 'utf8');

code = code.replace(
  "static async gradeSubmission",
  "static async getInstructorAssignments(instructorId: string, query: any) {\n    const Course = require('../courses/course.model').Course;\n    const courses = await Course.find({ instructors: instructorId });\n    const courseIds = courses.map(c => c._id);\n    const assignments = await Assignment.find({ courseId: { $in: courseIds } }).populate('lessonId', 'title');\n    return assignments;\n  }\n\n  static async getInstructorSubmissions(instructorId: string, query: any) {\n    const Course = require('../courses/course.model').Course;\n    const courses = await Course.find({ instructors: instructorId });\n    const courseIds = courses.map(c => c._id);\n    const assignments = await Assignment.find({ courseId: { $in: courseIds } });\n    const assignmentIds = assignments.map(a => a._id);\n    \n    const page = parseInt(query.page) || 1;\n    const limit = parseInt(query.limit) || 10;\n    const skip = (page - 1) * limit;\n    const filter: any = { assignmentId: { $in: assignmentIds } };\n    if (query.status) filter.status = query.status;\n\n    const submissions = await AssignmentSubmission.find(filter)\n      .populate('userId', 'firstName lastName avatar')\n      .populate('assignmentId', 'title')\n      .sort({ submittedAt: -1 })\n      .skip(skip).limit(limit);\n    const total = await AssignmentSubmission.countDocuments(filter);\n    return { submissions, total, page, pages: Math.ceil(total / limit) };\n  }\n\n  static async gradeSubmission"
);

fs.writeFileSync('backend/src/modules/learning/assignment.service.ts', code);
