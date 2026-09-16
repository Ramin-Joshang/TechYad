const fs = require('fs');
let code = fs.readFileSync('backend/src/seed.ts', 'utf8');

code = code.replace("process.env.MONGODB_URI || 'mongodb://localhost:27017/tekyad'", "process.env.MONGO_URI || 'mongodb://localhost:27017/tekyad'");

fs.writeFileSync('backend/src/seed.ts', code);
