const fs = require('fs');

let ctrl = fs.readFileSync('backend/src/modules/classes/class.controller.ts', 'utf8');
if (!ctrl.includes('updateClass =')) {
  ctrl += `\nexport const updateClass = async (req: AuthRequest, res: Response) => {
  const result = await ClassService.updateClass(req.params.id, req.user._id as string, req.body);
  sendSuccess(res, result, 'Class updated successfully');
};
export const deleteClass = async (req: AuthRequest, res: Response) => {
  await ClassService.deleteClass(req.params.id, req.user._id as string);
  sendSuccess(res, null, 'Class deleted successfully');
};
export const adminUpdateClass = async (req: Request, res: Response) => {
  const result = await ClassService.updateClass(req.params.id, '', req.body, true);
  sendSuccess(res, result, 'Class updated by admin successfully');
};
export const adminDeleteClass = async (req: Request, res: Response) => {
  await ClassService.deleteClass(req.params.id, '', true);
  sendSuccess(res, null, 'Class deleted successfully');
};
`;
  fs.writeFileSync('backend/src/modules/classes/class.controller.ts', ctrl);
}

let routes = fs.readFileSync('backend/src/modules/classes/class.routes.ts', 'utf8');
if (!routes.includes("router.patch('/instructor/classes/:id'")) {
  routes = routes.replace(
    "router.post('/instructor/classes', isInstructor, asyncHandler(Controller.createClass));",
    `router.post('/instructor/classes', isInstructor, asyncHandler(Controller.createClass));
router.patch('/instructor/classes/:id', isInstructor, asyncHandler(Controller.updateClass));
router.delete('/instructor/classes/:id', isInstructor, asyncHandler(Controller.deleteClass));`
  );
}
if (!routes.includes("router.patch('/admin/classes/:id'")) {
  routes = routes.replace(
    "export default router;",
    `
const isAdmin = [requireAuth, authorize('classes.manage')];
router.post('/admin/classes', isAdmin, asyncHandler(Controller.createClass)); // Admin can create too
router.patch('/admin/classes/:id', isAdmin, asyncHandler(Controller.adminUpdateClass));
router.delete('/admin/classes/:id', isAdmin, asyncHandler(Controller.adminDeleteClass));

export default router;`
  );
}
fs.writeFileSync('backend/src/modules/classes/class.routes.ts', routes);
