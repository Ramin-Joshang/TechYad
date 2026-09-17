const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/instructors/InstructorProfileContainer.tsx', 'utf8');

code = code.replace(
  /queryFn: \(\) => api\.get\(\`\/instructors\/\$\{id\}\`\)\.then\(res => res\.data\.data\)/,
  'queryFn: () => api.get(`/instructors/${id}`).then((res: any) => res.data)'
);

fs.writeFileSync('frontend/src/components/instructors/InstructorProfileContainer.tsx', code);
