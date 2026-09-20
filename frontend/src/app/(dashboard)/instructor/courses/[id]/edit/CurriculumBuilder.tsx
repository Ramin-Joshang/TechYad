import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesApi } from '@/features/courses/api/courses.api';
import { learningApi } from '@/features/learning/api/learning.api';
import { Loader2, Plus, ChevronDown, ChevronUp, Video, FileText, CheckSquare, Trash2, Edit2 } from 'lucide-react';

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

  
  const deleteLessonMutation = useMutation({
    mutationFn: () => coursesApi.deleteLesson(lesson._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapter-lessons'] });
    }
  });
  
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
    <div className="border border-[var(--neo-border)] bg-[var(--neo-surface)] rounded-xl p-4 mb-2 flex flex-col">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[var(--neo-surface-2)] rounded-lg"><Video className="w-4 h-4 text-[var(--neo-text-secondary)]"/></div>
          <span className="font-medium text-[var(--neo-text-main)] text-sm">{lesson.title}</span>
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="text-xs bg-[var(--neo-surface-2)] hover:bg-[var(--neo-border)] text-[var(--neo-text-main)] px-3 py-1.5 rounded-lg font-bold transition-colors"
          >
            + افزودن محتوا
          </button>
          
          {showAddMenu && (
            <div className="absolute left-0 mt-2 w-48 bg-[var(--neo-surface)] border border-[var(--neo-border)] shadow-xl rounded-xl py-2 z-10">
              <button 
                onClick={() => { setFormType('assignment'); setShowAddMenu(false); }}
                className="w-full text-right px-4 py-2 hover:bg-[var(--neo-surface-2)] text-sm font-medium flex items-center gap-2 text-[var(--neo-text-main)]"
              >
                <FileText className="w-4 h-4" /> تکلیف
              </button>
              <button 
                onClick={() => { setFormType('quiz'); setShowAddMenu(false); }}
                className="w-full text-right px-4 py-2 hover:bg-[var(--neo-surface-2)] text-sm font-medium flex items-center gap-2 text-[var(--neo-text-main)]"
              >
                <CheckSquare className="w-4 h-4" /> آزمون
              </button>
            </div>
          )}
        </div>
      </div>

      {formType === 'assignment' && (
        <form onSubmit={handleAddAssignment} className="mt-4 p-4 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl space-y-4">
          <h4 className="font-bold text-[var(--neo-text-main)] text-sm">ایجاد تکلیف جدید</h4>
          <input 
            required placeholder="عنوان تکلیف" 
            value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
            className="w-full px-3 py-2 border border-[var(--neo-border)] rounded-lg text-sm"
          />
          <textarea 
            placeholder="توضیحات تکلیف" rows={2}
            value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full px-3 py-2 border border-[var(--neo-border)] rounded-lg text-sm"
          />
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setFormType('none')} className="px-4 py-2 text-sm text-[var(--neo-text-secondary)] bg-[var(--neo-border)] rounded-lg">انصراف</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm text-white bg-[var(--neo-primary)] rounded-lg flex items-center gap-2">
              {loading && <Loader2 className="w-3 h-3 animate-spin"/>} ذخیره
            </button>
          </div>
        </form>
      )}

      {formType === 'quiz' && (
        <form onSubmit={handleAddQuiz} className="mt-4 p-4 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl space-y-4">
          <h4 className="font-bold text-[var(--neo-text-main)] text-sm">ایجاد آزمون جدید</h4>
          <input 
            required placeholder="عنوان آزمون" 
            value={quizForm.title} onChange={e => setQuizForm({...quizForm, title: e.target.value})}
            className="w-full px-3 py-2 border border-[var(--neo-border)] rounded-lg text-sm"
          />
          <textarea 
            placeholder="توضیحات" rows={2}
            value={quizForm.description} onChange={e => setQuizForm({...quizForm, description: e.target.value})}
            className="w-full px-3 py-2 border border-[var(--neo-border)] rounded-lg text-sm"
          />
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setFormType('none')} className="px-4 py-2 text-sm text-[var(--neo-text-secondary)] bg-[var(--neo-border)] rounded-lg">انصراف</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm text-white bg-[var(--neo-primary)] rounded-lg flex items-center gap-2">
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
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [lessonData, setLessonData] = useState({ title: '', videoUrl: '', duration: 10, isFreePreview: false });
  const queryClient = useQueryClient();
  
  const { data: lessons, isLoading } = useQuery({
    queryKey: ['chapter-lessons', chapter._id],
    queryFn: () => coursesApi.getChapterLessons(chapter._id).then(res => res.data),
    enabled: isOpen
  });

  
  const deleteChapterMutation = useMutation({
    mutationFn: () => coursesApi.deleteChapter(chapter._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
    }
  });
  
  const addLessonMutation = useMutation({
    mutationFn: (data: any) => coursesApi.createLesson(chapter._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapter-lessons', chapter._id] });
      setShowAddLesson(false);
      setLessonData({ title: '', videoUrl: '', duration: 10, isFreePreview: false });
    }
  });

  return (
    <div className="border border-[var(--neo-border)] rounded-2xl overflow-hidden mb-4 shadow-sm bg-[var(--neo-surface)]">
      <div 
        className="bg-[var(--neo-surface-2)] p-4 flex justify-between items-center cursor-pointer hover:bg-[var(--neo-surface-2)] transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="font-bold text-[var(--neo-text-main)]">{chapter.title}</div>
        
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); if(confirm('فصل و تمام دروس آن حذف شوند؟')) deleteChapterMutation.mutate() }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
            <Trash2 className="w-4 h-4" />
          </button>
          {isOpen ? <ChevronUp className="w-5 h-5 text-[var(--neo-text-secondary)]" /> : <ChevronDown className="w-5 h-5 text-[var(--neo-text-secondary)]" />}
        </div>
      </div>
      
      {isOpen && (
        <div className="p-4 bg-[var(--neo-surface-2)]/30">
          {isLoading ? (
            <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-[var(--neo-text-muted)]" /></div>
          ) : lessons?.length === 0 ? (
            <div className="text-center p-4 mb-4 text-sm text-[var(--neo-text-secondary)] bg-[var(--neo-surface-2)] rounded-xl border border-dashed border-[var(--neo-border)]">
              درسی در این فصل وجود ندارد.
            </div>
          ) : (
            <div className="mb-4">
              {lessons?.map((lesson: any) => (
                <LessonItem key={lesson._id} lesson={lesson} />
              ))}
            </div>
          )}

          {!showAddLesson ? (
            <button 
              onClick={() => setShowAddLesson(true)}
              className="w-full py-2.5 rounded-xl border-2 border-dashed border-[var(--neo-border)] text-[var(--neo-text-secondary)] hover:border-[var(--neo-border)] hover:bg-[var(--neo-surface-2)] font-bold text-sm transition-all flex justify-center items-center gap-2"
            >
              <Plus className="w-4 h-4" /> درس جدید
            </button>
          ) : (
            <form onSubmit={e => { e.preventDefault(); addLessonMutation.mutate(lessonData); }} className="p-4 bg-[var(--neo-surface)] border border-[var(--neo-border)] rounded-xl shadow-sm space-y-4">
              <h4 className="font-bold text-sm text-[var(--neo-text-main)]">ایجاد درس جدید</h4>
              <input 
                required placeholder="عنوان درس" 
                value={lessonData.title} onChange={e => setLessonData({...lessonData, title: e.target.value})}
                className="w-full px-3 py-2 border border-[var(--neo-border)] rounded-lg text-sm"
              />
              <input 
                placeholder="لینک ویدیو (اختیاری)" 
                value={lessonData.videoUrl} onChange={e => setLessonData({...lessonData, videoUrl: e.target.value})}
                className="w-full px-3 py-2 border border-[var(--neo-border)] rounded-lg text-sm text-left dir-ltr"
              />
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--neo-text-main)]">
                  <input type="checkbox" checked={lessonData.isFreePreview} onChange={e => setLessonData({...lessonData, isFreePreview: e.target.checked})} className="rounded text-[var(--neo-primary)] focus:ring-[var(--neo-primary)]" />
                  پیش‌نمایش رایگان
                </label>
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-sm font-medium text-[var(--neo-text-main)]">مدت (دقیقه):</span>
                  <input type="number" min="1" value={lessonData.duration} onChange={e => setLessonData({...lessonData, duration: Number(e.target.value)})} className="w-20 px-2 py-1 border border-[var(--neo-border)] rounded-lg text-sm" />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setShowAddLesson(false)} className="px-4 py-2 text-sm text-[var(--neo-text-secondary)] bg-[var(--neo-surface-2)] hover:bg-[var(--neo-border)] rounded-lg font-bold">انصراف</button>
                <button type="submit" disabled={addLessonMutation.isPending} className="px-4 py-2 text-sm text-white bg-[var(--neo-primary)] hover:bg-[var(--neo-primary)] rounded-lg font-bold flex items-center gap-2">
                  {addLessonMutation.isPending && <Loader2 className="w-3 h-3 animate-spin"/>} ذخیره
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export const CurriculumBuilder = ({ courseId }: { courseId: string }) => {
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [chapterTitle, setChapterTitle] = useState('');
  const queryClient = useQueryClient();

  const { data: chapters, isLoading } = useQuery({
    queryKey: ['chapters', courseId],
    queryFn: () => coursesApi.getCourseChapters(courseId).then(res => res.data)
  });

  const addChapterMutation = useMutation({
    mutationFn: (title: string) => coursesApi.createChapter(courseId, { title, order: chapters?.length || 0 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapters', courseId] });
      setShowAddChapter(false);
      setChapterTitle('');
    }
  });

  return (
    <div className="bg-[var(--neo-surface)] rounded-3xl p-6 md:p-8 shadow-sm border border-[var(--neo-border)]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-[var(--neo-text-main)]">سرفصل‌های دوره</h2>
        <button 
          onClick={() => setShowAddChapter(true)}
          className="px-4 py-2 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-sm text-sm flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> فصل جدید
        </button>
      </div>

      {showAddChapter && (
        <form onSubmit={e => { e.preventDefault(); addChapterMutation.mutate(chapterTitle); }} className="mb-6 p-4 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-2xl flex items-center gap-3">
          <input 
            required autoFocus
            placeholder="عنوان فصل جدید..."
            value={chapterTitle} onChange={e => setChapterTitle(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--neo-border)] focus:ring-2 focus:ring-[var(--neo-primary)] outline-none"
          />
          <button type="submit" disabled={addChapterMutation.isPending || !chapterTitle} className="px-6 py-2.5 bg-[var(--neo-primary)] text-white font-bold rounded-xl shadow-md disabled:opacity-50">
            {addChapterMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'ذخیره'}
          </button>
          <button type="button" onClick={() => setShowAddChapter(false)} className="px-4 py-2.5 text-[var(--neo-text-secondary)] hover:bg-[var(--neo-border)] rounded-xl font-bold">
            لغو
          </button>
        </form>
      )}

      {isLoading ? (
        <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--neo-text-muted)]" /></div>
      ) : chapters?.length === 0 ? (
        <div className="text-center py-12 bg-[var(--neo-surface-2)] rounded-2xl border border-dashed border-[var(--neo-border)]">
          <p className="text-[var(--neo-text-secondary)] font-medium">هنوز هیچ سرفصلی ایجاد نشده است.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {chapters?.map((chapter: any) => (
            <ChapterItem key={chapter._id} chapter={chapter} />
          ))}
        </div>
      )}
    </div>
  );
};
