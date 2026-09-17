const fs = require('fs');
let code = fs.readFileSync('frontend/src/app/(dashboard)/super-admin/admins/page.tsx', 'utf8');

code = code.replace(
  '<button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">\n                          <Edit className="w-5 h-5" />\n                        </button>',
  `<Link href={\`/super-admin/admins/\${admin._id}\`} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">\n                          <Edit className="w-5 h-5" />\n                        </Link>`
);

fs.writeFileSync('frontend/src/app/(dashboard)/super-admin/admins/page.tsx', code);
