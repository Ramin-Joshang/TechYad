const fs = require('fs');
let code = fs.readFileSync('frontend/src/features/admin/api/admin.api.ts', 'utf8');

if (!code.includes('getRoles: async () => {')) {
  code = code.replace(
    'getUsers: async (params?: any) => {',
    `getRoles: async () => {
    return api.get<any, any>('/admin/roles');
  },
  getUsers: async (params?: any) => {`
  );
  fs.writeFileSync('frontend/src/features/admin/api/admin.api.ts', code);
}
