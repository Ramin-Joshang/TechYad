const fs = require('fs');
let code = fs.readFileSync('frontend/src/app/(dashboard)/admin/revenue/page.tsx', 'utf8');
code = code.replace(
  '\\`\\${(val/1000000).toFixed(0)}M\\`',
  '`${(val/1000000).toFixed(0)}M`'
);
fs.writeFileSync('frontend/src/app/(dashboard)/admin/revenue/page.tsx', code);
