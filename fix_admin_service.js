const fs = require('fs');
let code = fs.readFileSync('backend/src/modules/admin/admin.service.ts', 'utf8');

code = code.replace(/import \{ SupportTicket \} from '\.\.\/support\/support\.model\.js';/g, '');
code = code.replace(/SupportTicket/g, 'Ticket');

fs.writeFileSync('backend/src/modules/admin/admin.service.ts', code);
console.log('Fixed admin.service.ts');
