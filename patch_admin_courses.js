const fs = require('fs');
let code = fs.readFileSync('frontend/src/features/admin/api/admin.api.ts', 'utf8');

if (!code.includes('updateCourse: async')) {
  code = code.replace(
    'publishCourse: async (id: string) => {',
    `updateCourse: async (id: string, data: any) => {
    return api.patch<any, any>(\`/admin/courses/\${id}\`, data);
  },
  deleteCourse: async (id: string) => {
    return api.delete<any, any>(\`/admin/courses/\${id}\`);
  },
  publishCourse: async (id: string) => {`
  );
  fs.writeFileSync('frontend/src/features/admin/api/admin.api.ts', code);
}
