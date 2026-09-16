const fs = require('fs');
let code = fs.readFileSync('frontend/src/components/layout/Navbar.tsx', 'utf8');

code = code.replace(
  "  return (\n    <header",
  "  // Hide Navbar in dashboard routes\n  if (pathname?.startsWith('/admin') || pathname?.startsWith('/student') || pathname?.startsWith('/instructor') || pathname?.startsWith('/profile')) {\n    return null;\n  }\n\n  return (\n    <header"
);

fs.writeFileSync('frontend/src/components/layout/Navbar.tsx', code);
