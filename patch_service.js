const fs = require('fs');
let code = fs.readFileSync('backend/src/modules/courses/course.service.ts', 'utf8');

code = code.replace(
  "static async updateCourse",
  "static async getInstructorCourses(instructorId: string, query: any) {\n    const page = parseInt(query.page) || 1;\n    const limit = parseInt(query.limit) || 10;\n    const skip = (page - 1) * limit;\n    const filter: any = { instructors: instructorId };\n    if (query.status) {\n      filter.status = query.status;\n    }\n    const courses = await Course.find(filter)\n      .populate('categoryId', 'title slug')\n      .sort({ createdAt: -1 })\n      .skip(skip)\n      .limit(limit);\n    const total = await Course.countDocuments(filter);\n    return {\n      courses,\n      pagination: {\n        total,\n        page,\n        limit,\n        pages: Math.ceil(total / limit)\n      }\n    };\n  }\n\n  static async getInstructorStats(instructorId: string) {\n    const courses = await Course.find({ instructors: instructorId });\n    const totalCourses = courses.length;\n    const publishedCourses = courses.filter(c => c.status === 'published').length;\n    const totalStudents = courses.reduce((acc, curr) => acc + (curr.studentCount || 0), 0);\n    \n    // In a real app, calculate revenue from orders, for now mockup\n    const totalRevenue = courses.reduce((acc, curr) => acc + ((curr.studentCount || 0) * (curr.price || 0)), 0) * 0.7; // 70% share\n    \n    return {\n      totalCourses,\n      publishedCourses,\n      totalStudents,\n      totalRevenue\n    };\n  }\n\n  static async updateCourse"
);

fs.writeFileSync('backend/src/modules/courses/course.service.ts', code);
