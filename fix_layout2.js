const fs = require('fs');
let code = fs.readFileSync('frontend/src/app/(dashboard)/layout.tsx', 'utf8');

code = code.replace(/BarChart2/g, 'BarChart');

fs.writeFileSync('frontend/src/app/(dashboard)/layout.tsx', code);
