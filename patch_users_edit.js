const fs = require('fs');
let code = fs.readFileSync('frontend/src/app/(dashboard)/admin/users/page.tsx', 'utf8');

if (!code.includes("import Link from 'next/link';")) {
  code = code.replace("import { Loader2, Search, Shield, UserX, UserCheck, MoreVertical } from 'lucide-react';", "import { Loader2, Search, Shield, UserX, UserCheck, MoreVertical, Edit } from 'lucide-react';\nimport Link from 'next/link';");
}

code = code.replace(
  '<div className="flex justify-center gap-2">',
  `<div className="flex justify-center items-center gap-2">
                        <Link href={\`/admin/users/\${user._id}\`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="ویرایش">
                          <Edit className="w-4 h-4" />
                        </Link>`
);

fs.writeFileSync('frontend/src/app/(dashboard)/admin/users/page.tsx', code);
