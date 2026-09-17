const fs = require('fs');
const path = 'backend/src/modules/admin/admin.routes.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
    'router.patch(\'/super-admin/admins/:id/status\', isSuperAdmin, asyncHandler(Controller.updateAdminStatus));',
    `router.patch('/super-admin/admins/:id', isSuperAdmin, asyncHandler(Controller.updateAdmin));
router.patch('/super-admin/admins/:id/status', isSuperAdmin, asyncHandler(Controller.updateAdminStatus));`
);
fs.writeFileSync(path, code);
