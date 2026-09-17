const fs = require('fs');
let code = fs.readFileSync('frontend/src/features/admin/api/super-admin.api.ts', 'utf8');

if (!code.includes('getSettings:')) {
  code = code.replace(
    'deleteRole: async (id: string) => {\n    return api.delete<any, any>(`/super-admin/roles/${id}`);\n  }',
    `deleteRole: async (id: string) => {
    return api.delete<any, any>(\`/super-admin/roles/\${id}\`);
  },
  
  // Global Settings
  getSettings: async () => {
    return api.get<any, any>('/super-admin/settings');
  },
  updateSettings: async (data: Record<string, any>) => {
    return api.patch<any, any>('/super-admin/settings', data);
  }`
  );
  fs.writeFileSync('frontend/src/features/admin/api/super-admin.api.ts', code);
  console.log('super-admin api patched');
}
