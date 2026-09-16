const fs = require('fs');
let code = fs.readFileSync('frontend/src/lib/api.ts', 'utf8');

code = code.replace(
    /const message = error\.response\.data\?\.message \|\| 'خطایی رخ داده است';/,
    "const message = error.response.data?.error?.message || error.response.data?.message || 'خطایی رخ داده است';"
);

// We should also let 500 show the actual error if in development, or at least a good message
code = code.replace(
    /case 500:\s+toast\.error\('خطای سرور\. لطفا مجددا تلاش کنید'\);\s+break;/g,
    "case 500:\n            toast.error(message || 'خطای سرور. لطفا مجددا تلاش کنید');\n            break;"
);

// We can also allow 403, 404, 409, 422 to show the message instead of fixed strings!
code = code.replace(
    /case 403:\s+toast\.error\('شما دسترسی لازم برای این عملیات را ندارید'\);\s+break;/g,
    "case 403:\n            toast.error(message || 'شما دسترسی لازم برای این عملیات را ندارید');\n            break;"
);
code = code.replace(
    /case 404:\s+toast\.error\('مورد یافت نشد'\);\s+break;/g,
    "case 404:\n            toast.error(message || 'مورد یافت نشد');\n            break;"
);

fs.writeFileSync('frontend/src/lib/api.ts', code);
console.log('Fixed api.ts error messages');
