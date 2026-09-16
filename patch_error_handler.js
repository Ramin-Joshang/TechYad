const fs = require('fs');

let code = fs.readFileSync('backend/src/common/middleware/errorHandler.ts', 'utf8');
code = code.replace(
    /message = 'Internal Server Error';/g,
    "message = env.NODE_ENV === 'development' ? err.message || 'Internal Server Error' : 'Internal Server Error';"
);
fs.writeFileSync('backend/src/common/middleware/errorHandler.ts', code);
console.log('Patched errorHandler.ts');
