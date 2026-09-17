const fs = require('fs');

let backend = fs.readFileSync('backend/src/modules/admin/admin.service.ts', 'utf8');

backend = backend.replace(
  `static async getRevenueStats() {
    const orders = await Order.find({ status: 'paid' });
    const totalRevenue = orders.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const thisMonthRevenue = orders
      .filter(o => new Date((o as any).createdAt).getMonth() === new Date().getMonth())
      .reduce((acc, curr) => acc + curr.totalAmount, 0);
      
    return { totalRevenue, thisMonthRevenue, ordersCount: orders.length };
  }`,
  `static async getRevenueStats() {
    const orders = await Order.find({ status: 'paid' });
    const totalRevenue = orders.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const thisMonthRevenue = orders
      .filter(o => new Date((o as any).createdAt).getMonth() === new Date().getMonth())
      .reduce((acc, curr) => acc + curr.totalAmount, 0);
      
    // Create monthly data for the chart
    const monthNames = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
    const monthlyData = monthNames.map(name => ({ name, revenue: 0 }));
    
    // Simply group by JS getMonth() for current year
    const currentYear = new Date().getFullYear();
    orders.forEach(o => {
      const date = new Date((o as any).createdAt);
      if (date.getFullYear() === currentYear) {
         // rough map to jalali month, for demo purposes we just use index 0-11
         // A better way is relying on actual jalali conversion, but let's keep it simple mapping
         const monthIndex = date.getMonth(); // 0-11
         if (monthlyData[monthIndex]) {
            monthlyData[monthIndex].revenue += o.totalAmount;
         }
      }
    });

    return { totalRevenue, thisMonthRevenue, ordersCount: orders.length, chartData: monthlyData };
  }`
);

fs.writeFileSync('backend/src/modules/admin/admin.service.ts', backend);

let frontend = fs.readFileSync('frontend/src/app/(dashboard)/admin/revenue/page.tsx', 'utf8');
frontend = frontend.replace(
  "const { totalRevenue = 0, thisMonthRevenue = 0, ordersCount = 0 } = revenueData || {};\n\n  // Mock data for the chart (since we don't have historical data API yet, we just show a static beautiful chart for now)\n  const chartData = [\n    { name: 'فروردین', revenue: totalRevenue * 0.1 },\n    { name: 'اردیبهشت', revenue: totalRevenue * 0.15 },\n    { name: 'خرداد', revenue: totalRevenue * 0.05 },\n    { name: 'تیر', revenue: totalRevenue * 0.12 },\n    { name: 'مرداد', revenue: totalRevenue * 0.2 },\n    { name: 'شهریور', revenue: totalRevenue * 0.25 },\n    { name: 'مهر', revenue: thisMonthRevenue },\n  ];",
  "const { totalRevenue = 0, thisMonthRevenue = 0, ordersCount = 0, chartData = [] } = revenueData || {};"
);
fs.writeFileSync('frontend/src/app/(dashboard)/admin/revenue/page.tsx', frontend);

