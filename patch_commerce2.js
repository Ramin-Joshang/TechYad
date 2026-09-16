const fs = require('fs');

let routes = fs.readFileSync('backend/src/modules/commerce/commerce.routes.ts', 'utf8');
if (!routes.includes('const isInstructor')) {
  routes = routes.replace(
    "import { authenticate } from '../../common/middleware/auth.js';",
    "import { authenticate, authorize } from '../../common/middleware/auth.js';"
  );
  routes = routes.replace(
    "const requireAuth = asyncHandler(authenticate);",
    "const requireAuth = asyncHandler(authenticate);\nconst isInstructor = [requireAuth, authorize('create_course')];"
  );
  fs.writeFileSync('backend/src/modules/commerce/commerce.routes.ts', routes);
}
