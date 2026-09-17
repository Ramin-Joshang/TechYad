const fs = require('fs');
const path = 'backend/src/modules/admin/admin.service.ts';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('import bcrypt')) {
    code = code.replace("import { AppError } from '../../common/utils/AppError.js';", "import { AppError } from '../../common/utils/AppError.js';\nimport bcrypt from 'bcrypt';");
}

code = code.replace(
    '// Hash password (should be handled by pre-save hook in User model)\n    const newUser = await User.create(data);',
    `// Hash password manually
    if (data.password) {
      data.passwordHash = await bcrypt.hash(data.password, 12);
      delete data.password;
    } else {
      throw new AppError('Password is required', 400);
    }
    const newUser = await User.create(data);`
);
fs.writeFileSync(path, code);
