const fs = require('fs');
let code = fs.readFileSync('frontend/src/features/admin/api/admin.api.ts', 'utf8');

if (!code.includes('updateUser: async (id: string, data: any)')) {
  code = code.replace(
    'updateUserStatus: async (id: string, status: string) => {',
    `updateUser: async (id: string, data: any) => {
    return api.patch<any, any>(\`/admin/users/\${id}\`, data);
  },
  updateUserStatus: async (id: string, status: string) => {`
  );
  fs.writeFileSync('frontend/src/features/admin/api/admin.api.ts', code);
}
