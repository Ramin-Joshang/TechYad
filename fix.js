const fs = require('fs');
let code = fs.readFileSync('backend/src/modules/admin/admin.service.ts', 'utf8');
code = code.replace(
  '}, {});',
  '}, {} as Record<string, any>);'
);
fs.writeFileSync('backend/src/modules/admin/admin.service.ts', code);
