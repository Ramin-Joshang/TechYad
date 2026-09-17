const fs = require('fs');

// 1. Backend Argon2 Fix
let adminService = fs.readFileSync('backend/src/modules/admin/admin.service.ts', 'utf8');
adminService = adminService.replace(/import bcrypt from 'bcrypt';\n/g, '');
if (!adminService.includes("import * as argon2 from 'argon2';")) {
  adminService = "import * as argon2 from 'argon2';\n" + adminService;
}
adminService = adminService.replace(/bcrypt\.hash\(data\.password, 12\)/g, 'argon2.hash(data.password)');
fs.writeFileSync('backend/src/modules/admin/admin.service.ts', adminService);

// 2. Frontend Delete Fix
function fixDelete(path) {
  let code = fs.readFileSync(path, 'utf8');
  code = code.replace(/delete dataToSubmit\.password;/g, 'delete (dataToSubmit as any).password;');
  fs.writeFileSync(path, code);
}
fixDelete('frontend/src/app/(dashboard)/admin/users/[id]/page.tsx');
fixDelete('frontend/src/app/(dashboard)/super-admin/admins/[id]/page.tsx');

