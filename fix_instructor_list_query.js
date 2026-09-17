const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/instructors/InstructorsList.tsx', 'utf8');

code = code.replace(
  /queryFn: \(\) => api\.get\('\/instructors'\)\.then\(res => res\.data\.data\)/,
  "queryFn: () => api.get('/instructors').then((res: any) => res.data)"
);

fs.writeFileSync('frontend/src/components/instructors/InstructorsList.tsx', code);
