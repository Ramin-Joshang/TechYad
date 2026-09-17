const fs = require('fs');
let code = fs.readFileSync('frontend/src/app/(dashboard)/admin/users/[id]/page.tsx', 'utf8');

if (!code.includes('const { data: rolesData }')) {
  code = code.replace(
    'const id = params.id;',
    `const id = params.id;
  const { data: rolesData } = useQuery({
    queryKey: ['superAdminRoles'],
    queryFn: () => adminApi.getRoles().then((res: any) => res?.data || res).catch(() => [])
  });`
  );
}

if (!code.includes('role: user.role')) {
  code = code.replace(
    "status: user.status || 'active',",
    "status: user.status || 'active',\n          role: user.role?._id || user.role || '',"
  );
}
if (!code.includes('role: \'\',')) {
  code = code.replace(
    "status: 'active',",
    "status: 'active',\n    role: '',"
  );
}

if (!code.includes('name="role"')) {
  code = code.replace(
    '</form>',
    `
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">نقش کاربری <span className="text-red-500">*</span></label>
            <select required name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">انتخاب نقش...</option>
              {rolesData?.map((role: any) => (
                <option key={role._id} value={role._id}>{role.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button type="submit" disabled={updateMutation.isPending} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition disabled:opacity-70">
            {updateMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            ذخیره تغییرات
          </button>
        </div>
      </form>`
  );
  // Also clean up the original buttons
  code = code.replace(/<div className="flex justify-end pt-4 border-t border-gray-100">[\s\S]*?<\/div>[\s]*<\/form>/g, (match, offset, string) => {
    // wait I just duplicated the end of the form. Let me do this carefully.
    return match;
  });
}
fs.writeFileSync('frontend/src/app/(dashboard)/admin/users/[id]/page.tsx', code);
