const fs = require('fs');
let code = fs.readFileSync('backend/src/modules/admin/admin.controller.ts', 'utf8');

if (!code.includes('export const getAdmins = ')) {
  code += `\n
export const getAdmins = async (req: Request, res: Response) => {
  const result = await AdminService.getAdmins();
  sendSuccess(res, result, 'Admins retrieved');
};

export const createAdmin = async (req: Request, res: Response) => {
  const result = await AdminService.createAdmin(req.body);
  sendSuccess(res, result, 'Admin created successfully', 201);
};

export const updateAdminStatus = async (req: Request, res: Response) => {
  const result = await AdminService.updateAdminStatus((req.params.id as any as string) as any as string, req.body.status);
  sendSuccess(res, result, 'Admin status updated');
};

export const getRoles = async (req: Request, res: Response) => {
  const result = await AdminService.getRoles();
  sendSuccess(res, result, 'Roles retrieved');
};
`;
  fs.writeFileSync('backend/src/modules/admin/admin.controller.ts', code);
  console.log('Added super admin controllers');
}
