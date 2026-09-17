const fs = require('fs');
let service = fs.readFileSync('backend/src/modules/admin/admin.service.ts', 'utf8');

if (!service.includes("if (data.permissions && data.permissions.includes('super_admin.access'))")) {
  service = service.replace(
    'return await Role.create(data);',
    `
    if (data.permissions && data.permissions.includes('super_admin.access')) {
        throw new AppError('Cannot grant super_admin access to new roles', 403);
    }
    return await Role.create(data);`
  );
  
  service = service.replace(
    'Object.assign(role, data);',
    `
    if (role.slug !== 'super-admin' && data.permissions && data.permissions.includes('super_admin.access')) {
        throw new AppError('Cannot grant super_admin access to non-super-admin roles', 403);
    }
    Object.assign(role, data);`
  );
  
  fs.writeFileSync('backend/src/modules/admin/admin.service.ts', service);
  console.log('Backend escalation protection added');
}
