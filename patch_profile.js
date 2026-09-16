const fs = require('fs');
let code = fs.readFileSync('frontend/src/app/(dashboard)/profile/page.tsx', 'utf8');

code = code.replace(
  "setFormData(prev => ({ ...prev, avatar: res.data.url }));",
  "const newAvatar = res.data.url;\n      setFormData(prev => ({ ...prev, avatar: newAvatar }));\n      // Auto-save the avatar\n      try {\n        const updateRes = await authApi.updateProfile({ ...formData, avatar: newAvatar });\n        if (updateRes.success) {\n          updateUser({ avatar: newAvatar });\n          setMessage('تصویر پروفایل با موفقیت بروزرسانی شد.');\n          setStatus('success');\n        }\n      } catch (e) { console.error('auto save failed', e); }"
);

fs.writeFileSync('frontend/src/app/(dashboard)/profile/page.tsx', code);
