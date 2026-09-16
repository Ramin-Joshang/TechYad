const fs = require('fs');

// PATCH ROUTE
let routeCode = fs.readFileSync('backend/src/modules/courses/course.routes.ts', 'utf8');
if (!routeCode.includes("router.get('/instructor/courses/:id'")) {
  routeCode = routeCode.replace(
    "router.get('/instructor/courses', isInstructor, asyncHandler(Controller.getInstructorCourses));",
    "router.get('/instructor/courses', isInstructor, asyncHandler(Controller.getInstructorCourses));\nrouter.get('/instructor/courses/:id', isInstructor, asyncHandler(Controller.getInstructorCourseById));"
  );
  fs.writeFileSync('backend/src/modules/courses/course.routes.ts', routeCode);
}

// PATCH CONTROLLER
let ctrlCode = fs.readFileSync('backend/src/modules/courses/course.controller.ts', 'utf8');
if (!ctrlCode.includes("getInstructorCourseById = async")) {
  const methodCode = `
  export const getInstructorCourseById = async (req: AuthRequest, res: Response) => {
    const course = await CourseService.getInstructorCourseById(req.params.id, req.user._id as string);
    sendSuccess(res, course, 'Course retrieved successfully');
  };
  `;
  ctrlCode += methodCode;
  fs.writeFileSync('backend/src/modules/courses/course.controller.ts', ctrlCode);
}

// PATCH SERVICE
let svcCode = fs.readFileSync('backend/src/modules/courses/course.service.ts', 'utf8');
if (!svcCode.includes("getInstructorCourseById(courseId: string,")) {
  const methodCode = `
  static async getInstructorCourseById(courseId: string, instructorId: string) {
    const course = await Course.findOne({ _id: courseId, instructors: instructorId });
    if (!course) throw new AppError('Course not found or you are not authorized', 404, 'NOT_FOUND');
    return course;
  }
`;
  svcCode = svcCode.replace("static async getInstructorCourses(", methodCode + "static async getInstructorCourses(");
  fs.writeFileSync('backend/src/modules/courses/course.service.ts', svcCode);
}
