import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesApi } from '@/features/courses/api/courses.api';
import { learningApi } from '@/features/learning/api/learning.api';
import { Loader2, Plus, ChevronDown, ChevronUp, Video, FileText, CheckSquare } from 'lucide-react';

const LessonItem = ({ lesson }: { lesson: any }) => {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [formType, setFormType] = useState<'none'|'assignment'|'quiz'>('none');
  const [formData, setFormData] = useState({ title: '', description: '', points: 100 });
  const [quizForm, setQuizForm] = useState({ title: '', description: '', timeLimit: 30, passMark: 70 });
  
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await learningApi.createAssignment(lesson._id, formData);
      alert('تکلیف با موفقیت ایجاد شد');
      setFormType('none');
    } catch (e) {
      alert('خطا در ایجاد تکلیف');
    }
    setLoading(false);
  };

  const handleAddQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await learningApi.createQuiz(lesson._id, quizForm);
      alert('آزمون با موفقیت ایجاد شد');
      setFormType('none');
    } catch (e) {
      alert('خطا در ایجاد آزمون');
    }
    setLoading(false);
  };

  return (
    <div className="border border-gray-100 bg-white rounded-xl p-4 mb-2 flex flex-col">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-50 rounded-lg"><Video className="w-4 h-4 text-gray-500"/></div>
          <span className="font-medium text-gray-800 text-sm">{lesson.title}</span>
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-bold transition-colors"
          >
            + افزودن محتوا
          </button>
          
          {showAddMenu && (
            <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-xl py-2 z-10">
              <button 
                onClick={() => { setFormType('assignment'); setShowAddMenu(false); }}
                className="w-full text-right px-4 py-2 hover:bg-gray-50 text-sm font-medium flex items-center gap-2 text-gray-700"
              >
                <FileText className="w-4 h-4" /> تکلیف
              </button>
              <button 
                onClick={() => { setFormType('quiz'); setShowAddMenu(false); }}
                className="w-full text-right px-4 py-2 hover:bg-gray-50 text-sm font-medium flex items-center gap-2 text-gray-700"
              >
                <CheckSquare className="w-4 h-4" /> آزمون
              </button>
            </div>
          )}
        </div>
      </div>

      {formType === 'assignment' && (
        <form onSubmit={handleAddAssignment} className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-4">
          <h4 className="font-bold text-gray-900 text-sm">ایجاد تکلیف جدید</h4>
          <input 
            required placeholder="عنوان تکلیف" 
            value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
          <textarea 
            placeholder="توضیحات تکلیف" rows={2}
            value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setFormType('none')} className="px-4 py-2 text-sm text-gray-600 bg-gray-200 rounded-lg">انصراف</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg flex items-center gap-2">
              {loading && <Loader2 className="w-3 h-3 animate-spin"/>} ذخیره
            </button>
          </div>
        </form>
      )}

      {formType === 'quiz' && (
        <form onSubmit={handleAddQuiz} className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-4">
          <h4 className="font-bold text-gray-900 text-sm">ایجاد آزمون جدید</h4>
          <input 
            required placeholder="عنوان آزمون" 
            value={quizForm.title} onChange={e => setQuizForm({...quizForm, title: e.target.value})}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
          <textarea 
            placeholder="توضیحات" rows={2}
            value={quizForm.description} onChange={e => setQuizForm({...quizForm, description: e.target.value})}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setFormType('none')} className="px-4 py-2 text-sm text-gray-600 bg-gray-200 rounded-lg">انصراف</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg flex items-center gap-2">
              {loading && <Loader2 className="w-3 h-3 animate-spin"/>} ذخیره
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

const ChapterItem = ({ chapter }: { chapter: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: lessons, isLoading } = useQuery({
    queryKey: ['chapter-lessons', chapter._id],
    queryFn: () => coursesApi.getChapterLessons(chapter._id).then(res => res.data),
    enabled: isOpen
  });

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden mb-4 shadow-sm bg-white">
      <div 
        className="bg-gray-50 p-4 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="font-bold text-gray-900">{chapter.title}</div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
      </div>
      
      {isOpen && (
        <div className="p-4 bg-gray-50/30">
          {isLoading ? (
            <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
          ) : lessons?.length === 0 ? (
            <div className="text-center p-4 text-sm text-gray-500 bg-gray-100 rounded-xl border border-dashed border-gray-300">
              درسی در این فصل وجود ندارد.
            </div>
          ) : (
            <div>
              {lessons?.map((lesson: any) => (
                <LessonItem key={lesson._id} lesson={lesson} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const CurriculumBuilder = ({ courseId }: { courseId: string }) => {
  const { data: chapters, isLoading } = useQuery({
    queryKey: ['chapters', courseId],
    queryFn: () => coursesApi.getCourseChapters(courseId).then(res => res.data)
  });

  if (isLoading) return <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-2">
      {chapters?.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-500 font-medium">هنوز هیچ سرفصلی ایجاد نشده است.</p>
        </div>
      ) : (
        chapters?.map((chapter: any) => (
          <ChapterItem key={chapter._id} chapter={chapter} />
        ))
      )}
    </div>
  );
};
