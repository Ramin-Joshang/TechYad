const fs = require('fs');

// Frontend Fix
let frontendCode = fs.readFileSync('frontend/src/app/(dashboard)/admin/courses/page.tsx', 'utf8');
if (frontendCode.startsWith("import toast from 'react-hot-toast';\n'use client';")) {
  frontendCode = frontendCode.replace(
    "import toast from 'react-hot-toast';\n'use client';",
    "'use client';\nimport toast from 'react-hot-toast';"
  );
  fs.writeFileSync('frontend/src/app/(dashboard)/admin/courses/page.tsx', frontendCode);
}

// Backend Fixes
function castParams(path) {
  let code = fs.readFileSync(path, 'utf8');
  code = code.replace(/req\.params\.id(?! as string)/g, '(req.params.id as string)');
  fs.writeFileSync(path, code);
}
castParams('backend/src/modules/admin/admin.controller.ts');
castParams('backend/src/modules/classes/class.controller.ts');
castParams('backend/src/modules/courses/course.controller.ts');

let adminService = fs.readFileSync('backend/src/modules/admin/admin.service.ts', 'utf8');
if (!adminService.includes("import bcrypt")) {
  adminService = "import bcrypt from 'bcrypt';\n" + adminService;
  fs.writeFileSync('backend/src/modules/admin/admin.service.ts', adminService);
}
