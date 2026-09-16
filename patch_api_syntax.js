const fs = require('fs');
let code = fs.readFileSync('frontend/src/features/courses/api/courses.api.ts', 'utf8');

code = code.replace("import { api } from '@/lib/api';export interface Course", "import { api } from '@/lib/api';\nexport interface Course");

fs.writeFileSync('frontend/src/features/courses/api/courses.api.ts', code);
