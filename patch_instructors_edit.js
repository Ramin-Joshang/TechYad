const fs = require('fs');
let code = fs.readFileSync('frontend/src/app/(dashboard)/admin/instructors/page.tsx', 'utf8');

if (!code.includes("import Link from 'next/link';")) {
  code = code.replace("import { Loader2, Search, Briefcase } from 'lucide-react';", "import { Loader2, Search, Briefcase, Edit } from 'lucide-react';\nimport Link from 'next/link';");
}

code = code.replace(
  '<th className="p-4 font-bold text-gray-600 text-sm">وضعیت</th>',
  '<th className="p-4 font-bold text-gray-600 text-sm">وضعیت</th>\n                  <th className="p-4 font-bold text-gray-600 text-sm text-center">عملیات</th>'
);

code = code.replace(
  '</tr>\n                ))}',
  `  <td className="p-4">
                      <div className="flex justify-center items-center gap-2">
                        <Link href={\`/admin/users/\${user._id}\`} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="ویرایش">
                          <Edit className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}`
);

fs.writeFileSync('frontend/src/app/(dashboard)/admin/instructors/page.tsx', code);
