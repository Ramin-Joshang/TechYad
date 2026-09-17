const fs = require('fs');

function fix(path) {
  let code = fs.readFileSync(path, 'utf8');
  
  if (code.includes('const resolvedParams = use(params);')) {
     code = code.replace(
       /const resolvedParams = use\(params\);\n\s*const courseId = resolvedParams\.id;/,
       "const params = useParams();\n  const courseId = params.id as string;"
     );
  }

  // Double check admin/users/[id]
  if (code.includes('useParams')) {
    code = code.replace(/import \{ useState, useEffect,  \} from 'react';/, "import { useState, useEffect } from 'react';");
    code = code.replace(/import \{ useState, useEffect, use \} from 'react';/, "import { useState, useEffect } from 'react';");
  }

  fs.writeFileSync(path, code);
}

fix('frontend/src/app/(dashboard)/instructor/courses/[id]/edit/page.tsx');
fix('frontend/src/app/(dashboard)/admin/users/[id]/page.tsx');
fix('frontend/src/app/(dashboard)/super-admin/admins/[id]/page.tsx');
