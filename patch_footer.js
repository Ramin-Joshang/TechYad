const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/layout/Footer.tsx', 'utf8');

code = code.replace(
  "export function Footer() {",
  "import { usePathname } from 'next/navigation';\n\nexport function Footer() {\n  const pathname = usePathname();\n\n  // Hide Footer in dashboard routes\n  if (pathname?.startsWith('/admin') || pathname?.startsWith('/student') || pathname?.startsWith('/instructor') || pathname?.startsWith('/profile')) {\n    return null;\n  }\n"
);

// If it's already a client component? Let's check.
fs.writeFileSync('frontend/src/components/layout/Footer.tsx', code);
