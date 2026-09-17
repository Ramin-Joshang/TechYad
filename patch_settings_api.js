const fs = require('fs');

let service = fs.readFileSync('backend/src/modules/admin/admin.service.ts', 'utf8');
if (!service.includes('Setting.find')) {
  service = `import { Setting } from './setting.model.js';\n` + service;
  service = service.replace(
    'static async getDashboardStats() {',
    `
  // --- Global Settings ---
  static async getSettings() {
    const settings = await Setting.find().lean();
    return settings.reduce((acc, curr) => {
       acc[curr.key] = curr.value;
       return acc;
    }, {});
  }

  static async updateSettings(data: Record<string, any>) {
    const operations = Object.entries(data).map(([key, value]) => ({
      updateOne: {
        filter: { key },
        update: { $set: { value } },
        upsert: true
      }
    }));
    if (operations.length > 0) {
      await Setting.bulkWrite(operations);
    }
    return this.getSettings();
  }
  
  static async getDashboardStats() {`
  );
  fs.writeFileSync('backend/src/modules/admin/admin.service.ts', service);
}

let controller = fs.readFileSync('backend/src/modules/admin/admin.controller.ts', 'utf8');
if (!controller.includes('export const getSettings')) {
  controller += `
export const getSettings = async (req: Request, res: Response) => {
  const result = await AdminService.getSettings();
  sendSuccess(res, result, 'Settings retrieved');
};

export const updateSettings = async (req: Request, res: Response) => {
  const result = await AdminService.updateSettings(req.body);
  sendSuccess(res, result, 'Settings updated successfully');
};
`;
  fs.writeFileSync('backend/src/modules/admin/admin.controller.ts', controller);
}

let routes = fs.readFileSync('backend/src/modules/admin/admin.routes.ts', 'utf8');
if (!routes.includes('/super-admin/settings')) {
  routes = routes.replace(
    'export default router;',
    `
// Global Settings
router.get('/super-admin/settings', isSuperAdmin, asyncHandler(Controller.getSettings));
router.patch('/super-admin/settings', isSuperAdmin, asyncHandler(Controller.updateSettings));

export default router;`
  );
  fs.writeFileSync('backend/src/modules/admin/admin.routes.ts', routes);
}
console.log('Settings API patched');
