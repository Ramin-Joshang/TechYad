const fs = require('fs');
let code = fs.readFileSync('frontend/src/app/(dashboard)/layout.tsx', 'utf8');

code = code.replace("Settings, PlayCircle, BarChart, FileText, CheckSquare,", "Settings, PlayCircle, BarChart, FileText, CheckSquare, MessageSquare,");

fs.writeFileSync('frontend/src/app/(dashboard)/layout.tsx', code);
