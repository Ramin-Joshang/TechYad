const fs = require('fs');

// 1. Update admin.service.ts
let service = fs.readFileSync('backend/src/modules/admin/admin.service.ts', 'utf8');

if (!service.includes('createRole(data')) {
  service = service.replace(
    'static async getRoles() {\n    return await Role.find().sort({ createdAt: 1 });\n  }',
    `static async getRoles() {
    // Add user count to each role
    const roles = await Role.find().lean();
    const rolesWithCounts = await Promise.all(roles.map(async (role) => {
      const count = await User.countDocuments({ role: role._id });
      return { ...role, userCount: count };
    }));
    return rolesWithCounts.sort((a, b) => a.createdAt > b.createdAt ? 1 : -1);
  }

  static async getRoleById(id: string) {
    const role = await Role.findById(id);
    if (!role) throw new AppError('Role not found', 404);
    return role;
  }

  static async createRole(data: any) {
    if (['super-admin', 'admin', 'instructor', 'student', 'support'].includes(data.slug)) {
       throw new AppError('Cannot create system reserved roles', 400);
    }
    return await Role.create(data);
  }

  static async updateRole(id: string, data: any) {
    const role = await Role.findById(id);
    if (!role) throw new AppError('Role not found', 404);
    
    // Protection
    if (['super-admin', 'admin', 'instructor', 'student'].includes(role.slug)) {
       // Allow updating description and permissions (except super-admin which has all), but not slug/name
       if (role.slug === 'super-admin') {
           throw new AppError('Cannot modify super-admin role', 403);
       }
       delete data.slug; // prevent slug change
       delete data.name; // prevent name change
    }
    
    Object.assign(role, data);
    await role.save();
    return role;
  }

  static async deleteRole(id: string) {
    const role = await Role.findById(id);
    if (!role) throw new AppError('Role not found', 404);
    
    if (['super-admin', 'admin', 'instructor', 'student', 'support'].includes(role.slug)) {
       throw new AppError('Cannot delete system roles', 403);
    }
    
    const usersWithRole = await User.countDocuments({ role: id });
    if (usersWithRole > 0) {
       throw new AppError('Cannot delete role that is assigned to users', 400);
    }
    
    await role.deleteOne();
    return { success: true };
  }`
  );
  fs.writeFileSync('backend/src/modules/admin/admin.service.ts', service);
}

// 2. Update admin.controller.ts
let controller = fs.readFileSync('backend/src/modules/admin/admin.controller.ts', 'utf8');

if (!controller.includes('createRole =')) {
  controller += `
export const getRoleById = async (req: Request, res: Response) => {
  const result = await AdminService.getRoleById((req.params.id as any as string) as any as string);
  sendSuccess(res, result, 'Role retrieved');
};

export const createRole = async (req: Request, res: Response) => {
  const result = await AdminService.createRole(req.body);
  sendSuccess(res, result, 'Role created successfully', 201);
};

export const updateRole = async (req: Request, res: Response) => {
  const result = await AdminService.updateRole((req.params.id as any as string) as any as string, req.body);
  sendSuccess(res, result, 'Role updated successfully');
};

export const deleteRole = async (req: Request, res: Response) => {
  const result = await AdminService.deleteRole((req.params.id as any as string) as any as string);
  sendSuccess(res, result, 'Role deleted successfully');
};
`;
  fs.writeFileSync('backend/src/modules/admin/admin.controller.ts', controller);
}

// 3. Update admin.routes.ts
let routes = fs.readFileSync('backend/src/modules/admin/admin.routes.ts', 'utf8');
if (!routes.includes('router.post(\'/super-admin/roles\'')) {
  routes = routes.replace(
    "router.get('/super-admin/roles', isSuperAdmin, asyncHandler(Controller.getRoles));",
    `router.get('/super-admin/roles', isSuperAdmin, asyncHandler(Controller.getRoles));
router.get('/super-admin/roles/:id', isSuperAdmin, asyncHandler(Controller.getRoleById));
router.post('/super-admin/roles', isSuperAdmin, asyncHandler(Controller.createRole));
router.patch('/super-admin/roles/:id', isSuperAdmin, asyncHandler(Controller.updateRole));
router.delete('/super-admin/roles/:id', isSuperAdmin, asyncHandler(Controller.deleteRole));`
  );
  fs.writeFileSync('backend/src/modules/admin/admin.routes.ts', routes);
}
console.log('Backend RBAC patched');
