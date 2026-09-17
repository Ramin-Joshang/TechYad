const fs = require('fs');
let code = fs.readFileSync('frontend/src/features/admin/api/admin.api.ts', 'utf8');

if (!code.includes('updateClass: async')) {
  code = code.replace(
    'getClasses: async (params?: any) => {\n    return api.get<any, any>(\'/admin/classes\', { params });\n  },',
    `getClasses: async (params?: any) => {
    return api.get<any, any>('/admin/classes', { params });
  },
  createClass: async (data: any) => {
    return api.post<any, any>('/admin/classes', data);
  },
  updateClass: async (id: string, data: any) => {
    return api.patch<any, any>(\`/admin/classes/\${id}\`, data);
  },
  deleteClass: async (id: string) => {
    return api.delete<any, any>(\`/admin/classes/\${id}\`);
  },`
  );
  fs.writeFileSync('frontend/src/features/admin/api/admin.api.ts', code);
}
