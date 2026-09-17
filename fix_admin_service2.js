const fs = require('fs');
const path = 'backend/src/modules/admin/admin.service.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
    'static async updateAdminStatus',
    `static async updateAdmin(id: string, data: any) {
    if (data.password) {
      data.passwordHash = await bcrypt.hash(data.password, 12);
      delete data.password;
    }
    const userToUpdate = await User.findByIdAndUpdate(id, data, { new: true });
    if (!userToUpdate) throw new AppError('Admin not found', 404);
    return userToUpdate;
  }

  static async updateAdminStatus`
);
fs.writeFileSync(path, code);
