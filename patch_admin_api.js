const fs = require('fs');
let code = fs.readFileSync('frontend/src/features/admin/api/admin.api.ts', 'utf8');

if (!code.includes('getCoupons:')) {
  code = code.replace(
    'getTickets: async () => {',
    `
  // Coupons
  getCoupons: async () => {
    return api.get<any, any>('/admin/coupons');
  },
  createCoupon: async (data: any) => {
    return api.post<any, any>('/admin/coupons', data);
  },
  deleteCoupon: async (id: string) => {
    return api.delete<any, any>(\`/admin/coupons/\${id}\`);
  },

  getTickets: async () => {`
  );
  fs.writeFileSync('frontend/src/features/admin/api/admin.api.ts', code);
  console.log('admin.api.ts patched for coupons');
}
