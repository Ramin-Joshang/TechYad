const fs = require('fs');
let code = fs.readFileSync('frontend/src/features/admin/api/admin.api.ts', 'utf8');

code = code.replace(
  'getTickets: async (params?: any) => {',
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

  getTickets: async (params?: any) => {`
);
fs.writeFileSync('frontend/src/features/admin/api/admin.api.ts', code);
console.log('admin.api.ts patched for coupons!');

let revenueCode = fs.readFileSync('frontend/src/app/(dashboard)/admin/revenue/page.tsx', 'utf8');
revenueCode = revenueCode.replace(
  'formatter={(value: number) => [`${value.toLocaleString()} تومان`, \'درآمد\']}',
  'formatter={(value: any) => [`${value?.toLocaleString() || 0} تومان`, \'درآمد\']}'
);
fs.writeFileSync('frontend/src/app/(dashboard)/admin/revenue/page.tsx', revenueCode);

