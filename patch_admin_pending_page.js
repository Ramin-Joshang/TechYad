const fs = require('fs');
let code = fs.readFileSync('frontend/src/app/(dashboard)/admin/courses/pending/page.tsx', 'utf8');

code = code.replace(
  "api.get('/courses', { params: { status: 'pending_review' } })",
  "api.get('/admin/courses', { params: { status: 'pending_review' } })"
);

fs.writeFileSync('frontend/src/app/(dashboard)/admin/courses/pending/page.tsx', code);
