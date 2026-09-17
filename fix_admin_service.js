const fs = require('fs');
let code = fs.readFileSync('backend/src/modules/admin/admin.service.ts', 'utf8');

if (!code.includes('const adminRole = await Role.findOne({ slug: \'admin\' })')) {
  code = code.replace(
    'const instructorRole = await Role.findOne({ slug: \'instructor\' });',
    'const instructorRole = await Role.findOne({ slug: \'instructor\' });\n    const adminRole = await Role.findOne({ slug: \'admin\' });\n    const superAdminRole = await Role.findOne({ slug: \'super-admin\' });'
  );
  
  code = code.replace(
    'const instructors = instructorRole ? await User.countDocuments({ role: instructorRole._id }) : 0;',
    'const instructors = instructorRole ? await User.countDocuments({ role: instructorRole._id }) : 0;\n    const admins = (adminRole ? await User.countDocuments({ role: adminRole._id }) : 0) + (superAdminRole ? await User.countDocuments({ role: superAdminRole._id }) : 0);'
  );
  
  code = code.replace(
    '      tickets\n    };',
    '      tickets,\n      admins\n    };'
  );
  fs.writeFileSync('backend/src/modules/admin/admin.service.ts', code);
  console.log('Added admins count to getDashboardStats');
}
