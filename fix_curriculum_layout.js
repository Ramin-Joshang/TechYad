const fs = require('fs');

let code = fs.readFileSync('frontend/src/app/(dashboard)/instructor/courses/[id]/edit/CurriculumBuilder.tsx', 'utf8');

// When adding a new chapter it shows at the top. Let's make sure it doesn't nest inside the list.
code = code.replace(
  `{isAddingChapter && !editingChapter && (
        <div className="bg-white p-6 rounded-3xl border border-gray-200 mb-6">`,
  `{!editingChapter && isAddingChapter && (
        <div className="bg-white p-6 rounded-3xl border border-gray-200 mb-6">`
);

fs.writeFileSync('frontend/src/app/(dashboard)/instructor/courses/[id]/edit/CurriculumBuilder.tsx', code);
