const fs = require('fs');

// Ah, the model has "in_person" but the frontend sends "in-person".
function fixFrontendMode(path) {
  let code = fs.readFileSync(path, 'utf8');
  code = code.replace(/value="in-person"/g, 'value="in_person"');
  code = code.replace(/"in-person"/g, '"in_person"');
  code = code.replace(/'in-person'/g, "'in_person'");
  fs.writeFileSync(path, code);
}

fixFrontendMode('frontend/src/app/(dashboard)/admin/classes/page.tsx');
fixFrontendMode('frontend/src/app/(dashboard)/instructor/classes/page.tsx');

// Also class schema requires description, we fixed it via shortDescription fallback,
// let's ensure endDate is set correctly too.

