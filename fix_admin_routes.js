const fs = require('fs');
let code = fs.readFileSync('backend/src/modules/admin/admin.routes.ts', 'utf8');

if (!code.includes('/super-admin/admins')) {
  code = code.replace(
    'export default router;',
    `
// Super Admin Specific Routes
const isSuperAdmin = [requireAuth, authorize('super_admin.access')];

router.get('/super-admin/admins', isSuperAdmin, asyncHandler(Controller.getAdmins));
router.post('/super-admin/admins', isSuperAdmin, asyncHandler(Controller.createAdmin));
router.patch('/super-admin/admins/:id/status', isSuperAdmin, asyncHandler(Controller.updateAdminStatus));
router.get('/super-admin/roles', isSuperAdmin, asyncHandler(Controller.getRoles));

export default router;`
  );
  fs.writeFileSync('backend/src/modules/admin/admin.routes.ts', code);
  console.log('Added super admin routes');
}
