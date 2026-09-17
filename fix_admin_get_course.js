const fs = require('fs');
let code = fs.readFileSync('frontend/src/app/(dashboard)/instructor/courses/[id]/edit/page.tsx', 'utf8');

code = code.replace(
  `queryFn: () => api.get(\`/instructor/courses/\${courseId}\`).then(res => res.data)`,
  `queryFn: () => {
      if (user?.role === 'admin' || user?.role === 'super-admin') {
        return adminApi.getCourseById(courseId).then(res => res.data.data || res.data);
      }
      return api.get(\`/instructor/courses/\${courseId}\`).then(res => res.data.data || res.data);
    }`
);
fs.writeFileSync('frontend/src/app/(dashboard)/instructor/courses/[id]/edit/page.tsx', code);
