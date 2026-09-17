const fs = require('fs');
const servicePath = 'backend/src/modules/admin/admin.service.ts';
let sCode = fs.readFileSync(servicePath, 'utf8');

if (!sCode.includes('static async updateUser(')) {
  sCode = sCode.replace(
      'static async updateUserStatus',
      `static async updateUser(id: string, data: any) {
    if (data.password) {
      data.passwordHash = await bcrypt.hash(data.password, 12);
      delete data.password;
    }
    const userToUpdate = await User.findByIdAndUpdate(id, data, { new: true });
    if (!userToUpdate) throw new AppError('User not found', 404);
    return userToUpdate;
  }

  static async updateUserStatus`
  );
  fs.writeFileSync(servicePath, sCode);
}

const ctrlPath = 'backend/src/modules/admin/admin.controller.ts';
let cCode = fs.readFileSync(ctrlPath, 'utf8');
if (!cCode.includes('export const updateUser =')) {
  cCode = cCode.replace(
      'export const updateUserStatus',
      `export const updateUser = async (req: Request, res: Response) => {
  const result = await AdminService.updateUser(req.params.id, req.body);
  res.status(200).json({ success: true, data: result });
};

export const updateUserStatus`
  );
  fs.writeFileSync(ctrlPath, cCode);
}

const rPath = 'backend/src/modules/admin/admin.routes.ts';
let rCode = fs.readFileSync(rPath, 'utf8');
if (!rCode.includes("router.patch('/admin/users/:id'")) {
  rCode = rCode.replace(
      "router.patch('/admin/users/:id/status'",
      `router.patch('/admin/users/:id', isAdmin, asyncHandler(Controller.updateUser));
router.patch('/admin/users/:id/status'`
  );
  fs.writeFileSync(rPath, rCode);
}
