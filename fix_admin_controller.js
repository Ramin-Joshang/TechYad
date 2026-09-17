const fs = require('fs');
const path = 'backend/src/modules/admin/admin.controller.ts';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('export const updateAdmin =')) {
  code = code.replace(
      'export const updateAdminStatus',
      `export const updateAdmin = async (req: Request, res: Response) => {
  const result = await AdminService.updateAdmin(req.params.id, req.body);
  res.status(200).json({ success: true, data: result });
};

export const updateAdminStatus`
  );
  fs.writeFileSync(path, code);
}
