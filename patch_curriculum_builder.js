const fs = require('fs');
let code = fs.readFileSync('frontend/src/app/(dashboard)/instructor/courses/[id]/edit/CurriculumBuilder.tsx', 'utf8');

// Just inject the Lucide icons we need
if (!code.includes('Trash2')) {
  code = code.replace('CheckSquare } from \'lucide-react\';', 'CheckSquare, Trash2, Edit2 } from \'lucide-react\';');
}

// Update LessonItem to have a delete button
if (!code.includes('deleteLessonMutation')) {
  const lessonUpdate = `
  const deleteLessonMutation = useMutation({
    mutationFn: () => coursesApi.deleteLesson(lesson._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapter-lessons'] });
    }
  });
  `;
  code = code.replace('const handleAddQuiz', lessonUpdate + '\n  const handleAddQuiz');
  
  const lessonButton = `
        <button onClick={() => { if(confirm('حذف شود؟')) deleteLessonMutation.mutate() }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>`;
  code = code.replace('</div>\n    </div>\n    {formType', lessonButton + '\n    </div>\n    {formType');
}

// Update ChapterItem to have a delete button
if (!code.includes('deleteChapterMutation')) {
  const chapterUpdate = `
  const deleteChapterMutation = useMutation({
    mutationFn: () => coursesApi.deleteChapter(chapter._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
    }
  });
  `;
  code = code.replace('const addLessonMutation', chapterUpdate + '\n  const addLessonMutation');

  const chapterButton = `
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); if(confirm('فصل و تمام دروس آن حذف شوند؟')) deleteChapterMutation.mutate() }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
            <Trash2 className="w-4 h-4" />
          </button>
          {isOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
        </div>`;
  code = code.replace('{isOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}', chapterButton);
}

fs.writeFileSync('frontend/src/app/(dashboard)/instructor/courses/[id]/edit/CurriculumBuilder.tsx', code);
