const fs = require('fs');
let code = fs.readFileSync('frontend/src/app/(dashboard)/instructor/courses/[id]/edit/page.tsx', 'utf8');

code = code.replace(
  "import { \n  ArrowRight, Loader2, Save, Send, AlertCircle, \n  CheckCircle, Plus, ChevronDown, ChevronUp, Video, FileText\n} from 'lucide-react';",
  "import { \n  ArrowRight, Loader2, Save, Send, AlertCircle, \n  CheckCircle, Plus\n} from 'lucide-react';\nimport { CurriculumBuilder } from './CurriculumBuilder';"
);

// We need to remove the mock chapter mapping and use <CurriculumBuilder courseId={courseId} />
const oldCurriculum = `          {loadingChapters ? (
            <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
          ) : chapters?.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-gray-500 font-medium">هنوز هیچ سرفصلی ایجاد نشده است.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Mockup for Chapter builder UI since we need more complex logic to actually build it fully */}
              {chapters?.map((chapter: any, idx: number) => (
                <div key={chapter._id} className="border border-gray-200 rounded-2xl overflow-hidden">
                  <div className="bg-gray-50 p-4 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="font-bold text-gray-900">فصل {idx + 1}: {chapter.title}</div>
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  </div>
                </div>
              ))}
            </div>
          )}`;

code = code.replace(oldCurriculum, "<CurriculumBuilder courseId={courseId} />");

fs.writeFileSync('frontend/src/app/(dashboard)/instructor/courses/[id]/edit/page.tsx', code);
