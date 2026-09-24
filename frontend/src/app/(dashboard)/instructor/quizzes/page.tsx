'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { 
  CheckSquare, Plus, Search, Loader2, Clock, Award, Users, 
  Trash2, Edit, CheckCircle, XCircle, AlertCircle, HelpCircle, 
  ChevronDown, BookOpen, Eye, Check
} from 'lucide-react';

interface QuestionOption {
  text: string;
  isCorrect: boolean;
}

interface Question {
  text: string;
  type: 'single_choice' | 'multiple_choice' | 'true_false';
  score: number;
  options: QuestionOption[];
}

export default function InstructorQuizzesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [viewAttemptsQuizId, setViewAttemptsQuizId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    courseId: string;
    lessonId: string;
    title: string;
    description: string;
    duration: number;
    passingScore: number;
    questions: Question[];
  }>({
    courseId: '',
    lessonId: '',
    title: '',
    description: '',
    duration: 30,
    passingScore: 70,
    questions: [
      {
        text: '',
        type: 'single_choice',
        score: 5,
        options: [
          { text: '', isCorrect: true },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false }
        ]
      }
    ]
  });

  // Fetch Quizzes
  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ['instructor-quizzes'],
    queryFn: () => api.get('/instructor/quizzes').then(res => res.data?.data || [])
  });

  // Fetch Courses for dropdown
  const { data: coursesData } = useQuery({
    queryKey: ['instructor-courses-dropdown'],
    queryFn: () => api.get('/instructor/courses', { params: { limit: 100 } }).then(res => res.data?.data?.courses || [])
  });

  // Fetch attempts for a specific quiz
  const { data: attempts = [], isLoading: isLoadingAttempts } = useQuery({
    queryKey: ['quiz-attempts', viewAttemptsQuizId],
    queryFn: () => api.get(`/instructor/quizzes/${viewAttemptsQuizId}/attempts`).then(res => res.data?.data || []),
    enabled: !!viewAttemptsQuizId
  });

  // Create / Update Mutation
  const saveQuizMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (editingQuizId) {
        return api.patch(`/instructor/quizzes/${editingQuizId}`, data);
      } else {
        return api.post('/instructor/quizzes', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-quizzes'] });
      closeModal();
    }
  });

  // Delete Mutation
  const deleteQuizMutation = useMutation({
    mutationFn: (quizId: string) => api.delete(`/instructor/quizzes/${quizId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-quizzes'] });
    }
  });

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setEditingQuizId(null);
    setFormData({
      courseId: '',
      lessonId: '',
      title: '',
      description: '',
      duration: 30,
      passingScore: 70,
      questions: [
        {
          text: '',
          type: 'single_choice',
          score: 5,
          options: [
            { text: '', isCorrect: true },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
          ]
        }
      ]
    });
  };

  const openCreateModal = () => {
    setEditingQuizId(null);
    if (coursesData && coursesData.length > 0) {
      setFormData(prev => ({ ...prev, courseId: coursesData[0]._id }));
    }
    setIsCreateModalOpen(true);
  };

  const openEditModal = async (quiz: any) => {
    setEditingQuizId(quiz._id);
    try {
      const res = await api.get(`/instructor/quizzes/${quiz._id}`);
      const qData = res.data?.data;
      if (qData) {
        setFormData({
          courseId: qData.courseId?._id || qData.courseId || '',
          lessonId: qData.lessonId?._id || qData.lessonId || '',
          title: qData.title || '',
          description: qData.description || '',
          duration: qData.duration || 30,
          passingScore: qData.passingScore || 70,
          questions: qData.questions?.length > 0 ? qData.questions : [
            {
              text: '',
              type: 'single_choice',
              score: 5,
              options: [
                { text: '', isCorrect: true },
                { text: '', isCorrect: false }
              ]
            }
          ]
        });
        setIsCreateModalOpen(true);
      }
    } catch {
      alert('خطا در دریافت اطلاعات آزمون');
    }
  };

  // Question Helper Handlers
  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          text: '',
          type: 'single_choice',
          score: 5,
          options: [
            { text: '', isCorrect: true },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
          ]
        }
      ]
    }));
  };

  const removeQuestion = (qIndex: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, idx) => idx !== qIndex)
    }));
  };

  const updateQuestionField = (qIndex: number, field: string, value: any) => {
    setFormData(prev => {
      const newQuestions = [...prev.questions];
      newQuestions[qIndex] = { ...newQuestions[qIndex], [field]: value };
      return { ...prev, questions: newQuestions };
    });
  };

  const addOption = (qIndex: number) => {
    setFormData(prev => {
      const newQuestions = [...prev.questions];
      newQuestions[qIndex].options.push({ text: '', isCorrect: false });
      return { ...prev, questions: newQuestions };
    });
  };

  const removeOption = (qIndex: number, optIndex: number) => {
    setFormData(prev => {
      const newQuestions = [...prev.questions];
      newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, idx) => idx !== optIndex);
      return { ...prev, questions: newQuestions };
    });
  };

  const updateOptionText = (qIndex: number, optIndex: number, text: string) => {
    setFormData(prev => {
      const newQuestions = [...prev.questions];
      newQuestions[qIndex].options[optIndex].text = text;
      return { ...prev, questions: newQuestions };
    });
  };

  const setCorrectOption = (qIndex: number, optIndex: number) => {
    setFormData(prev => {
      const newQuestions = [...prev.questions];
      const q = newQuestions[qIndex];
      if (q.type === 'multiple_choice') {
        q.options[optIndex].isCorrect = !q.options[optIndex].isCorrect;
      } else {
        q.options = q.options.map((opt, idx) => ({
          ...opt,
          isCorrect: idx === optIndex
        }));
      }
      return { ...prev, questions: newQuestions };
    });
  };

  // Filtered list
  const filteredQuizzes = quizzes.filter((q: any) => {
    const matchesSearch = q.title?.toLowerCase().includes(search.toLowerCase()) || 
                          q.courseId?.title?.toLowerCase().includes(search.toLowerCase());
    const matchesCourse = selectedCourseFilter === 'all' || q.courseId?._id === selectedCourseFilter;
    return matchesSearch && matchesCourse;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--neo-text-main)] flex items-center gap-2">
            <CheckSquare className="w-7 h-7 text-[var(--neo-primary)]" />
            مدیریت آزمون‌ها و کوییزها
          </h1>
          <p className="text-[var(--neo-text-secondary)] mt-1">طراحی سوالات تستی و چندگزینه‌ای، تعیین نمره و مشاهده کارنامه دانشجویان</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-[var(--neo-primary)] hover:bg-[var(--neo-primary)] text-white px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-[var(--neo-primary)]/20 transition-all hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          طراحی آزمون جدید
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--neo-surface)] p-5 rounded-3xl border border-[var(--neo-border)] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-[var(--neo-primary)] rounded-2xl">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-[var(--neo-text-main)]">{quizzes.length}</div>
              <div className="text-xs font-semibold text-[var(--neo-text-secondary)]">کل آزمون‌های تعریف شده</div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--neo-surface)] p-5 rounded-3xl border border-[var(--neo-border)] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-[var(--neo-text-main)]">
                {quizzes.reduce((sum: number, q: any) => sum + (q.totalAttempts || 0), 0)}
              </div>
              <div className="text-xs font-semibold text-[var(--neo-text-secondary)]">مجموع شرکت‌کنندگان</div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--neo-surface)] p-5 rounded-3xl border border-[var(--neo-border)] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-[var(--neo-text-main)]">
                {quizzes.length > 0 
                  ? `${Math.round(quizzes.reduce((sum: number, q: any) => sum + (q.avgScore || 0), 0) / quizzes.length)}%` 
                  : '۰%'}
              </div>
              <div className="text-xs font-semibold text-[var(--neo-text-secondary)]">میانگین نمرات دانشجویان</div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--neo-surface)] p-5 rounded-3xl border border-[var(--neo-border)] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-[var(--neo-text-main)]">
                {quizzes.reduce((sum: number, q: any) => sum + (q.questionsCount || 0), 0)}
              </div>
              <div className="text-xs font-semibold text-[var(--neo-text-secondary)]">مجموع سوالات طراحی شده</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[var(--neo-surface)] p-4 rounded-3xl border border-[var(--neo-border)] shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-5 h-5 absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--neo-text-secondary)]" />
          <input 
            type="text"
            placeholder="جستجوی عنوان آزمون یا دوره..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-11 py-2.5 rounded-2xl bg-[var(--neo-surface-2)] border border-[var(--neo-border)] text-sm focus:outline-none focus:border-[var(--neo-primary)] transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-bold text-[var(--neo-text-secondary)] shrink-0">فیلتر دوره:</span>
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="w-full md:w-60 px-3 py-2 rounded-2xl bg-[var(--neo-surface-2)] border border-[var(--neo-border)] text-sm font-medium focus:outline-none focus:border-[var(--neo-primary)] transition-colors"
          >
            <option value="all">همه دوره‌ها</option>
            {coursesData?.map((c: any) => (
              <option key={c._id} value={c._id}>{c.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Quizzes Table */}
      <div className="bg-[var(--neo-surface)] rounded-3xl shadow-sm border border-[var(--neo-border)] overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center text-[var(--neo-primary)] gap-3">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-sm font-bold text-[var(--neo-text-secondary)]">در حال بارگذاری لیست آزمون‌ها...</span>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-[var(--neo-surface-2)] rounded-3xl flex items-center justify-center mb-4 text-[var(--neo-text-secondary)]">
              <CheckSquare className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-[var(--neo-text-main)] mb-1">هیچ آزمونی یافت نشد</h3>
            <p className="text-sm text-[var(--neo-text-secondary)] mb-6 max-w-sm">
              شما می‌توانید برای سنجش دانشجویان، آزمون‌های تستی و آنلاین تعریف کنید.
            </p>
            <button
              onClick={openCreateModal}
              className="bg-[var(--neo-primary)] hover:bg-[var(--neo-primary)] text-white px-6 py-2.5 rounded-2xl font-bold transition-all shadow-md"
            >
              طراحی اولین آزمون
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-[var(--neo-border)] bg-[var(--neo-surface-2)]/60">
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm">عنوان آزمون و دوره</th>
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm text-center">تعداد سوالات</th>
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm text-center">مدت زمان</th>
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm text-center">حد نصاب قبولی</th>
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm text-center">شرکت‌کنندگان</th>
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm text-center">میانگین نمره</th>
                  <th className="p-4 font-bold text-[var(--neo-text-secondary)] text-sm text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--neo-border)]">
                {filteredQuizzes.map((quiz: any) => (
                  <tr key={quiz._id} className="hover:bg-[var(--neo-surface-2)]/40 transition-colors">
                    <td className="p-4">
                      <div>
                        <div className="font-black text-[var(--neo-text-main)] text-base">{quiz.title}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-lg bg-[var(--neo-primary)]/10 text-[var(--neo-primary)] font-bold">
                            <BookOpen className="w-3 h-3" />
                            {quiz.courseId?.title || 'دوره نامشخص'}
                          </span>
                          {quiz.lessonId?.title && (
                            <span className="text-xs text-[var(--neo-text-secondary)]">
                              • درس: {quiz.lessonId.title}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-bold text-sm px-2.5 py-1 rounded-xl bg-[var(--neo-surface-2)] text-[var(--neo-text-main)]">
                        {quiz.questionsCount || 0} سوال
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center gap-1 text-xs font-bold text-[var(--neo-text-secondary)]">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        {quiz.duration || 30} دقیقه
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl">
                        {quiz.passingScore || 70}٪
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setViewAttemptsQuizId(quiz._id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--neo-surface-2)] hover:bg-[var(--neo-primary)]/10 hover:text-[var(--neo-primary)] rounded-xl text-xs font-bold transition-colors"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>{quiz.totalAttempts || 0} نفر</span>
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <div className="font-bold text-sm text-[var(--neo-text-main)]">
                        {quiz.totalAttempts > 0 ? `${quiz.avgScore}٪` : '-'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setViewAttemptsQuizId(quiz._id)}
                          title="مشاهده نتایج شرکت‌کنندگان"
                          className="p-2 text-[var(--neo-text-secondary)] hover:text-[var(--neo-primary)] hover:bg-[var(--neo-primary)]/10 rounded-xl transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(quiz)}
                          title="ویرایش آزمون و سوالات"
                          className="p-2 text-[var(--neo-text-secondary)] hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`آیا از حذف آزمون «${quiz.title}» مطمئن هستید؟`)) {
                              deleteQuizMutation.mutate(quiz._id);
                            }
                          }}
                          title="حذف آزمون"
                          className="p-2 text-[var(--neo-text-secondary)] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL WITH QUESTION BUILDER */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[var(--neo-surface)] w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl border border-[var(--neo-border)] overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-[var(--neo-border)] flex justify-between items-center bg-[var(--neo-surface-2)]/50">
              <div>
                <h3 className="text-xl font-black text-[var(--neo-text-main)]">
                  {editingQuizId ? 'ویرایش آزمون و سوالات' : 'طراحی آزمون جدید'}
                </h3>
                <p className="text-xs text-[var(--neo-text-secondary)] mt-1">مشخصات آزمون را تنظیم کرده و سوالات آن را ایجاد کنید.</p>
              </div>
              <button 
                onClick={closeModal}
                className="w-9 h-9 rounded-2xl bg-[var(--neo-surface)] border border-[var(--neo-border)] flex items-center justify-center text-[var(--neo-text-secondary)] hover:text-red-500 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* General Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--neo-text-secondary)] mb-1.5">
                    دوره آموزشی مربوطه *
                  </label>
                  <select
                    value={formData.courseId}
                    onChange={(e) => setFormData(prev => ({ ...prev, courseId: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-2xl bg-[var(--neo-surface-2)] border border-[var(--neo-border)] text-sm font-medium focus:outline-none focus:border-[var(--neo-primary)]"
                  >
                    <option value="">انتخاب دوره</option>
                    {coursesData?.map((c: any) => (
                      <option key={c._id} value={c._id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--neo-text-secondary)] mb-1.5">
                    عنوان آزمون *
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: آزمون جامع فصل دوم React"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-2xl bg-[var(--neo-surface-2)] border border-[var(--neo-border)] text-sm font-medium focus:outline-none focus:border-[var(--neo-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--neo-text-secondary)] mb-1.5">
                    مدت زمان آزمون (دقیقه)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 rounded-2xl bg-[var(--neo-surface-2)] border border-[var(--neo-border)] text-sm font-medium focus:outline-none focus:border-[var(--neo-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--neo-text-secondary)] mb-1.5">
                    حد نصاب قبولی (درصد)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.passingScore}
                    onChange={(e) => setFormData(prev => ({ ...prev, passingScore: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 rounded-2xl bg-[var(--neo-surface-2)] border border-[var(--neo-border)] text-sm font-medium focus:outline-none focus:border-[var(--neo-primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--neo-text-secondary)] mb-1.5">
                  توضیحات و راهنمای شرکت در آزمون (اختیاری)
                </label>
                <textarea
                  rows={2}
                  placeholder="نکات مهم قبل از شروع آزمون را برای دانشجویان بنویسید..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 rounded-2xl bg-[var(--neo-surface-2)] border border-[var(--neo-border)] text-sm font-medium focus:outline-none focus:border-[var(--neo-primary)]"
                />
              </div>

              {/* Questions Section */}
              <div className="pt-4 border-t border-[var(--neo-border)]">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="font-black text-base text-[var(--neo-text-main)] flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-[var(--neo-primary)]" />
                      سوالات آزمون ({formData.questions.length} سوال)
                    </h4>
                    <p className="text-xs text-[var(--neo-text-secondary)]">متن هر سوال و گزینه‌های آن را وارد کرده و پاسخ صحیح را علامت بزنید.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="px-4 py-2 bg-[var(--neo-primary)]/10 text-[var(--neo-primary)] hover:bg-[var(--neo-primary)] hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    افزودن سوال جدید
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.questions.map((question, qIdx) => (
                    <div key={qIdx} className="p-4 rounded-3xl bg-[var(--neo-surface-2)]/60 border border-[var(--neo-border)] relative group">
                      <div className="flex justify-between items-center mb-3">
                        <span className="px-3 py-1 rounded-xl bg-[var(--neo-surface)] text-xs font-black text-[var(--neo-primary)] border border-[var(--neo-border)]">
                          سوال {qIdx + 1}
                        </span>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-[var(--neo-text-secondary)]">نمره:</span>
                            <input
                              type="number"
                              min="1"
                              value={question.score}
                              onChange={(e) => updateQuestionField(qIdx, 'score', Number(e.target.value))}
                              className="w-16 px-2 py-1 rounded-xl bg-[var(--neo-surface)] border border-[var(--neo-border)] text-xs font-bold text-center"
                            />
                          </div>

                          <select
                            value={question.type}
                            onChange={(e) => updateQuestionField(qIdx, 'type', e.target.value)}
                            className="px-2.5 py-1 rounded-xl bg-[var(--neo-surface)] border border-[var(--neo-border)] text-xs font-bold"
                          >
                            <option value="single_choice">تک‌گزینه‌ای (یک جواب)</option>
                            <option value="multiple_choice">چندگزینه‌ای (چند جواب)</option>
                            <option value="true_false">صحیح / غلط</option>
                          </select>

                          {formData.questions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeQuestion(qIdx)}
                              className="p-1.5 text-[var(--neo-text-secondary)] hover:text-red-500 rounded-lg transition-colors"
                              title="حذف این سوال"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Question Text */}
                      <input
                        type="text"
                        placeholder="متن سوال را اینجا تایپ کنید..."
                        value={question.text}
                        onChange={(e) => updateQuestionField(qIdx, 'text', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-[var(--neo-surface)] border border-[var(--neo-border)] text-sm font-bold mb-3 focus:outline-none focus:border-[var(--neo-primary)]"
                      />

                      {/* Options */}
                      <div className="space-y-2 mr-2">
                        <div className="text-xs font-bold text-[var(--neo-text-secondary)] mb-1">
                          گزینه‌ها (روی دایره یا مربع تیک بزنید تا گزینه صحیح مشخص شود):
                        </div>

                        {question.options.map((option, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setCorrectOption(qIdx, optIdx)}
                              className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                                option.isCorrect 
                                  ? 'bg-emerald-500 text-white shadow-sm' 
                                  : 'bg-[var(--neo-surface)] border border-[var(--neo-border)] text-transparent hover:border-emerald-500'
                              }`}
                              title={option.isCorrect ? 'پاسخ صحیح' : 'علامت زدن به عنوان پاسخ صحیح'}
                            >
                              <Check className="w-4 h-4 stroke-[3]" />
                            </button>

                            <input
                              type="text"
                              placeholder={`گزینه ${optIdx + 1}`}
                              value={option.text}
                              onChange={(e) => updateOptionText(qIdx, optIdx, e.target.value)}
                              className={`flex-1 px-3 py-1.5 rounded-xl bg-[var(--neo-surface)] border text-xs font-medium focus:outline-none ${
                                option.isCorrect ? 'border-emerald-500 bg-emerald-50/20' : 'border-[var(--neo-border)]'
                              }`}
                            />

                            {question.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeOption(qIdx, optIdx)}
                                className="p-1 text-[var(--neo-text-secondary)] hover:text-red-500"
                                title="حذف گزینه"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}

                        {question.type !== 'true_false' && question.options.length < 6 && (
                          <button
                            type="button"
                            onClick={() => addOption(qIdx)}
                            className="text-xs font-bold text-[var(--neo-primary)] hover:underline mt-1 inline-flex items-center gap-1"
                          >
                            + افزودن گزینه دیگر
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-[var(--neo-border)] flex justify-between items-center bg-[var(--neo-surface-2)]/50">
              <button
                type="button"
                onClick={closeModal}
                className="px-5 py-2.5 rounded-2xl bg-[var(--neo-surface)] border border-[var(--neo-border)] text-xs font-bold text-[var(--neo-text-secondary)] hover:bg-[var(--neo-surface-2)] transition-colors"
              >
                انصراف
              </button>

              <button
                type="button"
                disabled={saveQuizMutation.isPending || !formData.title || !formData.courseId}
                onClick={() => saveQuizMutation.mutate(formData)}
                className="px-6 py-2.5 rounded-2xl bg-[var(--neo-primary)] hover:bg-[var(--neo-primary)] text-white text-xs font-bold shadow-lg shadow-[var(--neo-primary)]/20 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {saveQuizMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingQuizId ? 'ذخیره تغییرات آزمون' : 'ایجاد و ذخیره آزمون'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* VIEW ATTEMPTS MODAL */}
      {viewAttemptsQuizId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[var(--neo-surface)] w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl border border-[var(--neo-border)] overflow-hidden flex flex-col">
            
            <div className="p-6 border-b border-[var(--neo-border)] flex justify-between items-center bg-[var(--neo-surface-2)]/50">
              <div>
                <h3 className="text-lg font-black text-[var(--neo-text-main)] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[var(--neo-primary)]" />
                  کارنامه و نتایج شرکت‌کنندگان آزمون
                </h3>
                <p className="text-xs text-[var(--neo-text-secondary)] mt-1">مشاهده نمرات و وضعیت قبولی هر دانشجو در این آزمون</p>
              </div>
              <button 
                onClick={() => setViewAttemptsQuizId(null)}
                className="w-9 h-9 rounded-2xl bg-[var(--neo-surface)] border border-[var(--neo-border)] flex items-center justify-center text-[var(--neo-text-secondary)] hover:text-red-500 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {isLoadingAttempts ? (
                <div className="p-12 flex justify-center text-[var(--neo-primary)]">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : attempts.length === 0 ? (
                <div className="text-center py-12 text-[var(--neo-text-secondary)]">
                  هنوز هیچ دانشجویی در این آزمون شرکت نکرده است.
                </div>
              ) : (
                <div className="divide-y divide-[var(--neo-border)]">
                  {attempts.map((att: any) => (
                    <div key={att._id} className="py-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[var(--neo-primary)]/10 text-[var(--neo-primary)] flex items-center justify-center font-bold text-sm">
                          {att.user?.firstName?.[0] || 'د'}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-[var(--neo-text-main)]">
                            {att.user?.firstName} {att.user?.lastName}
                          </div>
                          <div className="text-xs text-[var(--neo-text-secondary)]">
                            {att.user?.email}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-left">
                          <div className="font-black text-sm text-[var(--neo-text-main)]">
                            {att.percentage}٪
                          </div>
                          <div className="text-xs text-[var(--neo-text-secondary)]">
                            نمره: {att.score} از {att.totalScore}
                          </div>
                        </div>

                        <span className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 ${
                          att.passed 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : 'bg-red-50 text-red-700'
                        }`}>
                          {att.passed ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {att.passed ? 'قبول' : 'مردود'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[var(--neo-border)] bg-[var(--neo-surface-2)]/50 text-left">
              <button
                onClick={() => setViewAttemptsQuizId(null)}
                className="px-5 py-2 rounded-2xl bg-[var(--neo-surface)] border border-[var(--neo-border)] text-xs font-bold text-[var(--neo-text-secondary)] hover:bg-[var(--neo-surface-2)]"
              >
                بستن
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
