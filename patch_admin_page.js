const fs = require('fs');
let code = fs.readFileSync('frontend/src/app/(dashboard)/admin/page.tsx', 'utf8');

code = code.replace(/const mockAdminStats = \{[\s\S]*?\};\n/, '');
code = code.replace(/mockAdminStats/g, 'statsData');

fs.writeFileSync('frontend/src/app/(dashboard)/admin/page.tsx', code);
