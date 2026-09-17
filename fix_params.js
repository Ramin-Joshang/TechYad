const fs = require('fs');

function fixParams(path) {
  let code = fs.readFileSync(path, 'utf8');
  if (code.includes('use(params)')) {
    code = code.replace(/export default function Page\(\{ params \}: \{ params: Promise<\{ id: string \}> \}\) \{/, 'export default function Page() {');
    code = code.replace(/export default function EditCoursePage\(\{ params \}: \{ params: Promise<\{ id: string \}> \}\) \{/, 'export default function EditCoursePage() {');
    
    if (!code.includes("import { useParams } from 'next/navigation';")) {
      code = code.replace(
        "import { useRouter } from 'next/navigation';", 
        "import { useRouter, useParams } from 'next/navigation';"
      );
    }
    
    // Replace unwrapping logic
    code = code.replace(/const unwrappedParams = use\(params\) as any;\n\s*const id = unwrappedParams\.id;/, 'const params = useParams();\n  const id = params.id as string;');
    
    // Remove React.use
    code = code.replace(/use \}/, '}'); // Clean up 'import { ..., use } from' just in case, but it's easier to leave it or just remove
    
    fs.writeFileSync(path, code);
  }
}

fixParams('frontend/src/app/(dashboard)/super-admin/admins/[id]/page.tsx');
fixParams('frontend/src/app/(dashboard)/admin/users/[id]/page.tsx');
fixParams('frontend/src/app/(dashboard)/instructor/courses/[id]/edit/page.tsx');
