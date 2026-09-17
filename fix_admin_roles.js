const fs = require('fs');
let code = fs.readFileSync('backend/src/modules/admin/admin.routes.ts', 'utf8');

if (!code.includes("router.get('/admin/roles'")) {
  code = code.replace(
    "router.get('/super-admin/roles', isSuperAdmin, asyncHandler(Controller.getRoles));",
    "router.get('/super-admin/roles', isSuperAdmin, asyncHandler(Controller.getRoles));\nrouter.get('/admin/roles', isAdmin, asyncHandler(Controller.getRoles));"
  );
  fs.writeFileSync('backend/src/modules/admin/admin.routes.ts', code);
}
