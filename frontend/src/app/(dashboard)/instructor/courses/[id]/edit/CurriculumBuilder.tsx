'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesApi } from '@/features/courses/api/courses.api';
import { learningApi } from '@/features/learning/api/learning.api';
import { MediaUploader } from '@/components/common/MediaUploader';
import { 
  Loader2, Plus, ChevronDown, ChevronUp, Video, FileText, 
  CheckSquare, Trash2, Edit2, Play, Eye, Clock, CheckCircle2, Save, X
} from 'lucide-react';
import toast from 'react-hot-toast';

interface LessonItemProps {
  lesson: any;
  chapterId: string;
}

const LessonItem = ({ lesson, chapterId }: LessonItemProps) => {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formType, setFormType] = useState<'none' | 'assignment' | 'quiz'>('none');
  
  const [formData, setFormData] = useState({ title: '', description: '', points: 100 });
  const [quizForm, setQuizForm] = useState({ title: '', description: '', timeLimit: 30, passMark: 70 });
  const [editLessonData, setEditLessonData] = useState({
    title: lesson.title || '',
    videoUrl: lesson.video?.externalId || lesson.videoUrl || '',
    duration: lesson.video?.duration || lesson.duration || 10,
    isFreePreview: lesson.isFree || lesson.isFreePreview || false,
    order: lesson.order || 1
  });
  
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const updateLessonMutation = useMutation({
    mutationFn: (data: any) => coursesApi.updateLesson(lesson._id, data),
    onSuccess: () => {
      toast.success('درس با موفقیت بروزرسانی شد');
      queryClient.invalidateQueries({ queryKey: ['chapter-lessons', chapterId] });
      setIsEditing(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ویرایش درس');
    }
  });

  const deleteLessonMutation = useMutation({
    mutationFn: () => coursesApi.deleteLesson(lesson._id),
    onSuccess: () => {
      toast.success('درس با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: ['chapter-lessons', chapterId] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در حذف درس');
    }
  });

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await learningApi.createAssignment(lesson._id, formData);
      toast.success('تکلیف با موفقیت ایجاد شد');
      setFormType('none');
      setFormData({ title: '', description: '', points: 100 });
    } catch (e: any) {
      toast.error('خطا در ایجاد تکلیف');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await learningApi.createQuiz(lesson._id, quizForm);
      toast.success('آزمون با موفقیت ایجاد شد');
      setFormType('none');
      setQuizForm({ title: '', description: '', timeLimit: 30, passMark: 70 });
    } catch (e: any) {
      toast.error('خطا در ایجاد آزمون');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateLessonMutation.mutate(editLessonData);
  };

  return (
    <div id={`lesson-${lesson._id}`} className="border border-[var(--neo-border)] bg-[var(--neo-surface)] rounded-2xl p-4 mb-3 shadow-sm transition-all hover:border-[var(--neo-primary)]/40">
      {isEditing ? (
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-[var(--neo-border)]">
            <h4 className="font-bold text-sm text-[var(--neo-text-main)] flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-[var(--neo-primary)]" />
              ویرایش درس: {lesson.title}
            </h4>
            <button 
              type="button" 
              onClick={() => setIsEditing(false)} 
              className="p-1.5 text-[var(--neo-text-muted)] hover:text-[var(--neo-text-main)] rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">عنوان درس *</label>
            <input 
              required 
              value={editLessonData.title} 
              onChange={e => setEditLessonData({...editLessonData, title: e.target.value})}
              className="w-full px-3.5 py-2 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl text-sm focus:ring-2 focus:ring-[var(--neo-primary)] outline-none"
            />
          </div>

          <div>
            <MediaUploader
              label="ویدیو یا پیش‌نمایش ویدیو درس"
              value={editLessonData.videoUrl}
              onChange={(url) => setEditLessonData({...editLessonData, videoUrl: url})}
              accept="video/*"
              helpText="می‌توانید فایل ویدیویی آپلود کنید یا لینک مستقیم قرار دهید"
              previewType="video"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--neo-text-main)] cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={editLessonData.isFreePreview} 
                  onChange={e => setEditLessonData({...editLessonData, isFreePreview: e.target.checked})} 
                  className="rounded text-[var(--neo-primary)] focus:ring-[var(--neo-primary)] w-4 h-4" 
                />
                پیش‌نمایش رایگان (بدون خرید قابل مشاهده باشد)
              </label>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[var(--neo-text-main)]">مدت زمان (دقیقه):</span>
              <input 
                type="number" 
                min="1" 
                value={editLessonData.duration} 
                onChange={e => setEditLessonData({...editLessonData, duration: Number(e.target.value)})} 
                className="w-24 px-3 py-1.5 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl text-sm outline-none" 
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t border-[var(--neo-border)]">
            <button 
              type="button" 
              onClick={() => setIsEditing(false)} 
              className="px-4 py-2 text-xs font-bold text-[var(--neo-text-secondary)] bg-[var(--neo-surface-2)] hover:bg-[var(--neo-border)] rounded-xl transition"
            >
              انصراف
            </button>
            <button 
              type="submit" 
              disabled={updateLessonMutation.isPending} 
              className="px-5 py-2 text-xs font-bold text-white bg-[var(--neo-primary)] hover:opacity-90 rounded-xl flex items-center gap-2 transition"
            >
              {updateLessonMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>} 
              ذخیره تغییرات
            </button>
          </div>
        </form>
      ) : (
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[var(--neo-surface-2)] text-[var(--neo-primary)] rounded-xl">
                <Video className="w-4 h-4"/>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[var(--neo-text-main)] text-sm">{lesson.title}</span>
                  {(lesson.isFree || lesson.isFreePreview) && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      پیش‌نمایش رایگان
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-[var(--neo-text-muted)] mt-1">
                  {(lesson.duration || lesson.video?.duration) && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {lesson.video?.duration || lesson.duration} دقیقه
                    </span>
                  )}
                  {(lesson.videoUrl || lesson.video?.externalId) && (
                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> ویدیو متصل است
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <div className="relative">
                <button 
                  id={`lesson-${lesson._id}-add-content`}
                  onClick={() => setShowAddMenu(!showAddMenu)}
                  className="text-xs bg-[var(--neo-surface-2)] hover:bg-[var(--neo-border)] text-[var(--neo-text-main)] px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> آزمون / تکلیف
                </button>
                
                {showAddMenu && (
                  <div className="absolute left-0 mt-2 w-48 bg-[var(--neo-surface)] border border-[var(--neo-border)] shadow-xl rounded-2xl py-2 z-20">
                    <button 
                      onClick={() => { setFormType('assignment'); setShowAddMenu(false); }}
                      className="w-full text-right px-4 py-2 hover:bg-[var(--neo-surface-2)] text-xs font-bold flex items-center gap-2 text-[var(--neo-text-main)]"
                    >
                      <FileText className="w-4 h-4 text-amber-500" /> افزودن تکلیف
                    </button>
                    <button 
                      onClick={() => { setFormType('quiz'); setShowAddMenu(false); }}
                      className="w-full text-right px-4 py-2 hover:bg-[var(--neo-surface-2)] text-xs font-bold flex items-center gap-2 text-[var(--neo-text-main)]"
                    >
                      <CheckSquare className="w-4 h-4 text-emerald-500" /> افزودن آزمون
                    </button>
                  </div>
                )}
              </div>

              <button 
                id={`lesson-${lesson._id}-edit-btn`}
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-[var(--neo-primary)] hover:bg-[var(--neo-primary)]/10 rounded-lg transition" 
                title="ویرایش درس"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <button 
                id={`lesson-${lesson._id}-delete-btn`}
                onClick={() => { if (confirm('آیا از حذف این درس اطمینان دارید؟')) deleteLessonMutation.mutate(); }}
                disabled={deleteLessonMutation.isPending}
                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition" 
                title="حذف درس"
              >
                {deleteLessonMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin text-rose-500" /> : <Trash2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {formType === 'assignment' && (
        <form onSubmit={handleAddAssignment} className="mt-4 p-4 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-2xl space-y-3">
          <h4 className="font-bold text-[var(--neo-text-main)] text-xs flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-500" />
            ایجاد تکلیف جدید برای این درس
          </h4>
          <input 
            required 
            placeholder="عنوان تکلیف" 
            value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value})}
            className="w-full px-3 py-2 bg-[var(--neo-surface)] border border-[var(--neo-border)] rounded-xl text-xs outline-none"
          />
          <textarea 
            placeholder="توضیحات و راهنمای حل تکلیف" 
            rows={2}
            value={formData.description} 
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full px-3 py-2 bg-[var(--neo-surface)] border border-[var(--neo-border)] rounded-xl text-xs outline-none resize-none"
          />
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setFormType('none')} className="px-3 py-1.5 text-xs text-[var(--neo-text-secondary)] bg-[var(--neo-surface)] rounded-xl">انصراف</button>
            <button type="submit" disabled={loading} className="px-4 py-1.5 text-xs text-white bg-[var(--neo-primary)] rounded-xl font-bold flex items-center gap-1">
              {loading && <Loader2 className="w-3 h-3 animate-spin"/>} ثبت تکلیف
            </button>
          </div>
        </form>
      )}

      {formType === 'quiz' && (
        <form onSubmit={handleAddQuiz} className="mt-4 p-4 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-2xl space-y-3">
          <h4 className="font-bold text-[var(--neo-text-main)] text-xs flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-500" />
            ایجاد آزمون جدید برای این درس
          </h4>
          <input 
            required 
            placeholder="عنوان آزمون" 
            value={quizForm.title} 
            onChange={e => setQuizForm({...quizForm, title: e.target.value})}
            className="w-full px-3 py-2 bg-[var(--neo-surface)] border border-[var(--neo-border)] rounded-xl text-xs outline-none"
          />
          <textarea 
            placeholder="توضیحات آزمون" 
            rows={2}
            value={quizForm.description} 
            onChange={e => setQuizForm({...quizForm, description: e.target.value})}
            className="w-full px-3 py-2 bg-[var(--neo-surface)] border border-[var(--neo-border)] rounded-xl text-xs outline-none resize-none"
          />
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setFormType('none')} className="px-3 py-1.5 text-xs text-[var(--neo-text-secondary)] bg-[var(--neo-surface)] rounded-xl">انصراف</button>
            <button type="submit" disabled={loading} className="px-4 py-1.5 text-xs text-white bg-emerald-600 rounded-xl font-bold flex items-center gap-1">
              {loading && <Loader2 className="w-3 h-3 animate-spin"/>} ثبت آزمون
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

const ChapterItem = ({ chapter, courseId }: { chapter: any; courseId: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [isEditingChapter, setIsEditingChapter] = useState(false);
  const [chapterTitle, setChapterTitle] = useState(chapter.title || '');
  
  const [lessonData, setLessonData] = useState({ 
    title: '', 
    videoUrl: '', 
    duration: 10, 
    isFreePreview: false,
    order: 1 
  });

  const queryClient = useQueryClient();
  
  const { data: lessons, isLoading } = useQuery({
    queryKey: ['chapter-lessons', chapter._id],
    queryFn: () => coursesApi.getChapterLessons(chapter._id).then(res => res.data),
    enabled: isOpen
  });

  const updateChapterMutation = useMutation({
    mutationFn: (data: any) => coursesApi.updateChapter(chapter._id, data),
    onSuccess: () => {
      toast.success('عنوان فصل با موفقیت ویرایش شد');
      queryClient.invalidateQueries({ queryKey: ['chapters', courseId] });
      setIsEditingChapter(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ویرایش فصل');
    }
  });

  const deleteChapterMutation = useMutation({
    mutationFn: () => coursesApi.deleteChapter(chapter._id),
    onSuccess: () => {
      toast.success('فصل با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: ['chapters', courseId] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در حذف فصل');
    }
  });
  
  const addLessonMutation = useMutation({
    mutationFn: (data: any) => {
      const payload = {
        ...data,
        order: (lessons?.length || 0) + 1,
        duration: Number(data.duration) || 10
      };
      return coursesApi.createLesson(chapter._id, payload);
    },
    onSuccess: () => {
      toast.success('درس با موفقیت اضافه شد');
      queryClient.invalidateQueries({ queryKey: ['chapter-lessons', chapter._id] });
      setShowAddLesson(false);
      setLessonData({ title: '', videoUrl: '', duration: 10, isFreePreview: false, order: 1 });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ایجاد درس');
    }
  });

  const handleCreateLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonData.title.trim()) {
      toast.error('عنوان درس الزامی است');
      return;
    }
    addLessonMutation.mutate(lessonData);
  };

  return (
    <div id={`chapter-${chapter._id}`} className="border border-[var(--neo-border)] rounded-2xl overflow-hidden mb-4 shadow-sm bg-[var(--neo-surface)]">
      <div 
        className="bg-[var(--neo-surface-2)]/60 p-4 flex justify-between items-center cursor-pointer hover:bg-[var(--neo-surface-2)] transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isEditingChapter ? (
          <div className="flex-1 flex items-center gap-2 mr-2" onClick={e => e.stopPropagation()}>
            <input 
              type="text" 
              value={chapterTitle} 
              onChange={e => setChapterTitle(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-[var(--neo-surface)] border border-[var(--neo-border)] rounded-xl text-sm font-bold outline-none"
            />
            <button 
              onClick={() => updateChapterMutation.mutate({ title: chapterTitle })}
              disabled={updateChapterMutation.isPending}
              className="px-3 py-1.5 bg-[var(--neo-primary)] text-white text-xs font-bold rounded-xl"
            >
              {updateChapterMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'ذخیره'}
            </button>
            <button 
              onClick={() => setIsEditingChapter(false)}
              className="px-2 py-1.5 text-xs text-[var(--neo-text-muted)] hover:text-[var(--neo-text-main)]"
            >
              لغو
            </button>
          </div>
        ) : (
          <div className="font-bold text-[var(--neo-text-main)] flex items-center gap-2">
            <span>{chapter.title}</span>
            <span className="text-xs text-[var(--neo-text-muted)] font-normal">
              ({chapter.lessonsCount || lessons?.length || 0} درس)
            </span>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          {!isEditingChapter && (
            <button 
              onClick={(e) => { e.stopPropagation(); setIsEditingChapter(true); }} 
              className="p-2 text-[var(--neo-text-secondary)] hover:text-[var(--neo-primary)] hover:bg-[var(--neo-surface)] rounded-xl transition"
              title="ویرایش نام فصل"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}

          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              if (confirm('فصل و تمام دروس درون آن حذف شوند؟')) deleteChapterMutation.mutate(); 
            }} 
            disabled={deleteChapterMutation.isPending}
            className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition"
            title="حذف فصل"
          >
            {deleteChapterMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin text-rose-500" /> : <Trash2 className="w-4 h-4" />}
          </button>

          <div className="p-1 text-[var(--neo-text-secondary)]">
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>
      
      {isOpen && (
        <div className="p-4 bg-[var(--neo-surface-2)]/20">
          {isLoading ? (
            <div className="flex justify-center p-6"><Loader2 className="w-6 h-6 animate-spin text-[var(--neo-primary)]" /></div>
          ) : lessons?.length === 0 ? (
            <div className="text-center p-6 mb-4 text-sm text-[var(--neo-text-secondary)] bg-[var(--neo-surface)] rounded-2xl border border-dashed border-[var(--neo-border)]">
              هنوز درسی در این فصل ایجاد نشده است.
            </div>
          ) : (
            <div className="mb-4">
              {lessons?.map((lesson: any) => (
                <LessonItem key={lesson._id} lesson={lesson} chapterId={chapter._id} />
              ))}
            </div>
          )}

          {!showAddLesson ? (
            <button 
              id={`chapter-${chapter._id}-add-lesson-btn`}
              onClick={() => setShowAddLesson(true)}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-[var(--neo-border)] text-[var(--neo-text-secondary)] hover:border-[var(--neo-primary)] hover:text-[var(--neo-primary)] hover:bg-[var(--neo-surface)] font-bold text-sm transition-all flex justify-center items-center gap-2"
            >
              <Plus className="w-4 h-4" /> ایجاد جلسه یا درس جدید
            </button>
          ) : (
            <form onSubmit={handleCreateLesson} className="p-5 bg-[var(--neo-surface)] border border-[var(--neo-border)] rounded-2xl shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-[var(--neo-border)]">
                <h4 className="font-black text-sm text-[var(--neo-text-main)] flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[var(--neo-primary)]" />
                  ایجاد جلسه / درس جدید در این فصل
                </h4>
                <button type="button" onClick={() => setShowAddLesson(false)} className="p-1 text-[var(--neo-text-muted)] hover:text-[var(--neo-text-main)]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--neo-text-main)] mb-1">عنوان درس / جلسه *</label>
                <input 
                  required 
                  placeholder="مثال: مقدمه و نصب ابزارهای مورد نیاز" 
                  value={lessonData.title} 
                  onChange={e => setLessonData({...lessonData, title: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl text-sm focus:ring-2 focus:ring-[var(--neo-primary)] outline-none"
                />
              </div>

              <div>
                <MediaUploader
                  label="ویدیو یا پیش‌نمایش جلسه (آپلود یا لینک)"
                  value={lessonData.videoUrl}
                  onChange={(url) => setLessonData({...lessonData, videoUrl: url})}
                  accept="video/*"
                  helpText="می‌توانید فایل ویدیویی آپلود کنید تا بلافاصله پیش‌نمایش شود یا لینک مستقیم وارد کنید"
                  previewType="video"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--neo-text-main)] cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={lessonData.isFreePreview} 
                    onChange={e => setLessonData({...lessonData, isFreePreview: e.target.checked})} 
                    className="rounded text-[var(--neo-primary)] focus:ring-[var(--neo-primary)] w-4 h-4" 
                  />
                  پیش‌نمایش رایگان (بدون ثبت‌نام هم قابل دیدن باشد)
                </label>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[var(--neo-text-main)]">مدت زمان (دقیقه):</span>
                  <input 
                    type="number" 
                    min="1" 
                    value={lessonData.duration} 
                    onChange={e => setLessonData({...lessonData, duration: Number(e.target.value)})} 
                    className="w-24 px-3 py-1.5 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-xl text-sm outline-none" 
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-[var(--neo-border)]">
                <button 
                  type="button" 
                  onClick={() => setShowAddLesson(false)} 
                  className="px-4 py-2 text-xs text-[var(--neo-text-secondary)] bg-[var(--neo-surface-2)] hover:bg-[var(--neo-border)] rounded-xl font-bold transition"
                >
                  انصراف
                </button>
                <button 
                  type="submit" 
                  disabled={addLessonMutation.isPending} 
                  className="px-6 py-2 text-xs text-white bg-[var(--neo-primary)] hover:opacity-90 rounded-xl font-bold flex items-center gap-2 transition"
                >
                  {addLessonMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : <Plus className="w-4 h-4"/>} 
                  ایجاد درس
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
    mutationFn: (title: string) => {
      const order = (chapters?.length || 0) + 1;
      return coursesApi.createChapter(courseId, { title, order });
    },
    onSuccess: () => {
      toast.success('فصل با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: ['chapters', courseId] });
      setChapterTitle('');
      setShowAddChapter(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ایجاد فصل');
    }
  });

  const handleAddChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterTitle.trim()) {
      toast.error('عنوان فصل الزامی است');
      return;
    }
    addChapterMutation.mutate(chapterTitle.trim());
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-black text-[var(--neo-text-main)]">سرفصل‌ها و جلسات دوره</h3>
          <p className="text-xs text-[var(--neo-text-secondary)] mt-0.5">دروس و جلسات و ویدیوهای پیش‌نمایش را سازماندهی کنید</p>
        </div>
        {!showAddChapter && (
          <button 
            id="add-chapter-top-btn"
            onClick={() => setShowAddChapter(true)}
            className="px-4 py-2 bg-[var(--neo-primary)] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition hover:opacity-90"
          >
            <Plus className="w-4 h-4" /> فصل جدید
          </button>
        )}
      </div>

      {showAddChapter && (
        <form onSubmit={handleAddChapter} className="p-4 bg-[var(--neo-surface-2)] border border-[var(--neo-border)] rounded-2xl space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-xs text-[var(--neo-text-main)]">ایجاد سرفصل جدید</h4>
            <button type="button" onClick={() => setShowAddChapter(false)} className="text-[var(--neo-text-muted)] hover:text-[var(--neo-text-main)]">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2">
            <input 
              required
              placeholder="عنوان فصل (مثال: فصل اول: مبانی و مقدمات)"
              value={chapterTitle}
              onChange={e => setChapterTitle(e.target.value)}
              className="flex-1 px-4 py-2 bg-[var(--neo-surface)] border border-[var(--neo-border)] rounded-xl text-sm focus:ring-2 focus:ring-[var(--neo-primary)] outline-none"
            />
            <button 
              type="submit" 
              disabled={addChapterMutation.isPending}
              className="px-5 py-2 bg-[var(--neo-primary)] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition disabled:opacity-50"
            >
              {addChapterMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              ذخیره فصل
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--neo-primary)]" /></div>
      ) : chapters?.length === 0 ? (
        <div className="text-center p-8 bg-[var(--neo-surface-2)]/50 rounded-2xl border border-dashed border-[var(--neo-border)]">
          <p className="text-sm font-bold text-[var(--neo-text-secondary)]">هنوز فصلی برای این دوره تعریف نشده است.</p>
          <p className="text-xs text-[var(--neo-text-muted)] mt-1">با زدن دکمه «فصل جدید» اولین سرفصل را ایجاد کنید.</p>
        </div>
      ) : (
        <div>
          {chapters?.map((chapter: any) => (
            <ChapterItem key={chapter._id} chapter={chapter} courseId={courseId} />
          ))}
        </div>
      )}
    </div>
  );
};
