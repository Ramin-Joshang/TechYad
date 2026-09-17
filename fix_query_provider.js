const fs = require('fs');
let code = fs.readFileSync('frontend/src/lib/QueryProvider.tsx', 'utf8');

if (!code.includes('retry: false')) {
  code = code.replace(
    /refetchOnWindowFocus: false,/g,
    "refetchOnWindowFocus: false,\n        retry: false,"
  );
  fs.writeFileSync('frontend/src/lib/QueryProvider.tsx', code);
}
