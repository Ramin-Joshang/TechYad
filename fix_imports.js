const fs = require('fs');
let code = fs.readFileSync('frontend/src/app/(dashboard)/layout.tsx', 'utf8');

code = code.replace(
  /} from 'lucide-react';/,
  '  , ShieldAlert, Key, Tag } from \'lucide-react\';'
);

fs.writeFileSync('frontend/src/app/(dashboard)/layout.tsx', code);
