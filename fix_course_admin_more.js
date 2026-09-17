const fs = require('fs');

// Service
let serviceCode = fs.readFileSync('backend/src/modules/courses/course.service.ts', 'utf8');
if (!serviceCode.includes('static async deleteCourse(id: string)')) {
  serviceCode = serviceCode.replace(
    'static async publishCourse(id: string) {',
    `static async deleteCourse(id: string) {
    const course = await Course.findByIdAndDelete(id);
    if (!course) throw new AppError('Course not found', 404);
    // TODO: cleanup chapters, lessons, etc.
    return course;
  }
  static async publishCourse(id: string) {`
  );
  fs.writeFileSync('backend/src/modules/courses/course.service.ts', serviceCode);
}

// Controller
let ctrlCode = fs.readFileSync('backend/src/modules/courses/course.controller.ts', 'utf8');
if (!ctrlCode.includes('export const adminUpdateCourse')) {
  ctrlCode += `\nexport const adminUpdateCourse = async (req: Request, res: Response) => {
  const result = await CourseService.updateCourse(req.params.id, '', req.body, true);
  sendSuccess(res, result, 'Course updated by admin successfully');
};\nexport const adminDeleteCourse = async (req: Request, res: Response) => {
  await CourseService.deleteCourse(req.params.id);
  sendSuccess(res, null, 'Course deleted successfully');
};\n`;
  fs.writeFileSync('backend/src/modules/courses/course.controller.ts', ctrlCode);
}

// Routes
let routeCode = fs.readFileSync('backend/src/modules/courses/course.routes.ts', 'utf8');
if (!routeCode.includes('router.patch(\'/admin/courses/:id\'')) {
  routeCode = routeCode.replace(
    "router.post('/admin/courses/:id/publish', isAdmin, asyncHandler(Controller.publishCourse));",
    `router.patch('/admin/courses/:id', isAdmin, asyncHandler(Controller.adminUpdateCourse));
router.delete('/admin/courses/:id', isAdmin, asyncHandler(Controller.adminDeleteCourse));
router.post('/admin/courses/:id/publish', isAdmin, asyncHandler(Controller.publishCourse));`
  );
  fs.writeFileSync('backend/src/modules/courses/course.routes.ts', routeCode);
}
