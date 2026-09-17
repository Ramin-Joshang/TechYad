const fs = require('fs');
let code = fs.readFileSync('frontend/src/app/(dashboard)/instructor/courses/[id]/edit/CurriculumBuilder.tsx', 'utf8');

// The issue "توی ایجاد فصل دوتا باکس هست توی هم" means when editing/creating a chapter, it shows the form inside the list and maybe duplicated, 
// or there's a bug with rendering `isEditingChapter`.
// I will check the Add Chapter part.
code = code.replace(
  `{isAddingChapter && (
        <div className="bg-white p-6 rounded-3xl border border-gray-200 mb-6">`,
  `{isAddingChapter && !editingChapter && (
        <div className="bg-white p-6 rounded-3xl border border-gray-200 mb-6">`
);

fs.writeFileSync('frontend/src/app/(dashboard)/instructor/courses/[id]/edit/CurriculumBuilder.tsx', code);
