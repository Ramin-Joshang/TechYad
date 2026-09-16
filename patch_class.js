const fs = require('fs');

let service = fs.readFileSync('backend/src/modules/classes/class.service.ts', 'utf8');
if (!service.includes('getInstructorClasses')) {
  service = service.replace(
    "  static async getClasses() {",
    "  static async getInstructorClasses(instructorId: string) {\n    return await Class.find({ instructors: instructorId }).sort({ startDate: 1 });\n  }\n\n  static async getClasses() {"
  );
  fs.writeFileSync('backend/src/modules/classes/class.service.ts', service);
}

let controller = fs.readFileSync('backend/src/modules/classes/class.controller.ts', 'utf8');
if (!controller.includes('getInstructorClasses')) {
  controller += `
export const getInstructorClasses = async (req: AuthRequest, res: Response) => {
  const result = await ClassService.getInstructorClasses(req.user._id as string);
  sendSuccess(res, result, 'Instructor classes retrieved successfully');
};
`;
  fs.writeFileSync('backend/src/modules/classes/class.controller.ts', controller);
}

let routes = fs.readFileSync('backend/src/modules/classes/class.routes.ts', 'utf8');
if (!routes.includes('getInstructorClasses')) {
  routes = routes.replace(
    "// Instructor routes",
    "// Instructor routes\nrouter.get('/instructor/classes', isInstructor, asyncHandler(Controller.getInstructorClasses));"
  );
  fs.writeFileSync('backend/src/modules/classes/class.routes.ts', routes);
}
