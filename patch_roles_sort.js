const fs = require('fs');
let service = fs.readFileSync('backend/src/modules/admin/admin.service.ts', 'utf8');

service = service.replace(
  'return rolesWithCounts.sort((a, b) => a.createdAt > b.createdAt ? 1 : -1);',
  'return rolesWithCounts.sort((a: any, b: any) => (a.createdAt > b.createdAt ? 1 : -1));'
);

fs.writeFileSync('backend/src/modules/admin/admin.service.ts', service);
