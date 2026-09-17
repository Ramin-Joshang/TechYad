const fs = require('fs');
let code = fs.readFileSync('backend/src/modules/admin/admin.service.ts', 'utf8');

if (!code.includes('static async getAdmins()')) {
  code = code.replace(
    'static async getCoupons() {',
    `
  // --- Super Admin ---
  static async getAdmins() {
    const adminRoles = await Role.find({ slug: { $in: ['admin', 'super-admin'] } });
    const roleIds = adminRoles.map(r => r._id);
    return await User.find({ role: { $in: roleIds } })
      .populate('role', 'name slug')
      .sort({ createdAt: -1 });
  }

  static async createAdmin(data: any) {
    // Only super-admin or admin role should be assignable here
    const role = await Role.findById(data.role);
    if (!role || !['admin', 'super-admin'].includes(role.slug)) {
       throw new AppError('Invalid role for admin creation', 400);
    }
    
    // Hash password (should be handled by pre-save hook in User model)
    const newUser = await User.create(data);
    return newUser;
  }

  static async updateAdminStatus(adminId: string, status: string) {
    const userToUpdate = await User.findById(adminId).populate('role');
    if (!userToUpdate) throw new AppError('Admin not found', 404);
    
    // Prevent blocking super-admin
    if ((userToUpdate.role as any)?.slug === 'super-admin' && status === 'blocked') {
      throw new AppError('Cannot block a super admin', 403);
    }
    
    userToUpdate.status = status as 'active' | 'blocked';
    await userToUpdate.save();
    return userToUpdate;
  }

  static async getRoles() {
    return await Role.find().sort({ createdAt: 1 });
  }

  static async getCoupons() {`
  );
  fs.writeFileSync('backend/src/modules/admin/admin.service.ts', code);
  console.log('Added super admin methods to service');
}
