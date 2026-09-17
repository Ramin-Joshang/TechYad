'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quizzesApi } from '@/features/learning/api/quizzes.api';
import { Target, Loader2, ArrowRight, Clock, AlertTriangle, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { use, useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const id = (useParams().id as string) as string;
  const queryClient = useQueryClient();
  
  const [attemptStatus, setAttemptStatus] = useState<'intro' | 'active' | 'result'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const { data: quizData, isLoading, isError } = useQuery({
    queryKey: ['myQuizDetail', id],
    queryFn: () => quizzesApi.getQuiz(id).then(res => res.data),
    retry: 1
  });

  const { data: resultData, refetch: refetchResult } = useQuery({
    queryKey: ['myQuizResult', id],
    queryFn: () => quizzesApi.getQuizResult(id).then(res => res.data),
    enabled: attemptStatus === 'result',
    retry: false
  });

  const startMutation = useMutation({
    mutationFn: () => quizzesApi.startQuiz(id),
    onSuccess: () => {
      setAttemptStatus('active');
      if (quiz?.duration) {
        setTimeLeft(quiz.duration * 60);
      }
    }
  });

  const submitMutation = useMutation({
    mutationFn: (formattedAnswers: any) => quizzesApi.submitQuiz(id, formattedAnswers),
    onSuccess: () => {
      setAttemptStatus('result');
      refetchResult();
      queryClient.invalidateQueries({ queryKey: ['myQuizzes'] });
    }
  });

  const quiz = quizData;

  useEffect(() => {
    // If the attempt is already completed, go straight to result
    if (quizData && attemptStatus === 'intro') {
      quizzesApi.getQuizResult(id).then(() => {
        setAttemptStatus('result');
      }).catch(() => {
        // No result found, stay on intro
      });
    }
  }, [quizData]);

  // Timer Effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (attemptStatus === 'active' && timeLeft !== null && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev && prev <= 1) {
            handleFinalSubmit(); // Auto submit
            return 0;
          }
          return prev ? prev - 1 : 0;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [attemptStatus, timeLeft]);

  const handleFinalSubmit = () => {
    if (!quiz) return;
    const formattedAnswers = Object.entries(answers).map(([questionId, selectedOptionIds]) => ({
      questionId,
      selectedOptionIds
    }));
    submitMutation.mutate(formattedAnswers);
  };

  const confirmSubmit = () => {
    const totalAnswered = Object.keys(answers).length;
    const totalQuestions = quiz?.questions?.length || 0;
    const unanswered = totalQuestions - totalAnswered;
    
    if (unanswered > 0) {
      if (window.confirm(`${unanswered} سوال بدون پاسخ باقی مانده است. آیا از پایان آزمون اطمینان دارید؟`)) {
        handleFinalSubmit();
      }
    } else {
      handleFinalSubmit();
    }
  };

  const handleOptionSelect = (questionId: string, optionId: string, isMultiple: boolean) => {
    setAnswers(prev => {
      if (isMultiple) {
        const current = prev[questionId] || [];
        if (current.includes(optionId)) {
          return { ...prev, [questionId]: current.filter(id => id !== optionId) };
        } else {
          return { ...prev, [questionId]: [...current, optionId] };
        }
      } else {
        return { ...prev, [questionId]: [optionId] };
      }
    });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-rose-500 animate-spin mb-4" />
        <p className="text-gray-500">در حال آماده‌سازی آزمون...</p>
      </div>
    );
  }

  if (isError || !quiz) {
    return (
      <div className="bg-white rounded-3xl p-16 text-center border border-red-100 shadow-sm flex flex-col items-center justify-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">آزمون یافت نشد</h3>
        <button onClick={() => router.push('/student/quizzes')} className="mt-4 px-6 py-2 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 transition">
          بازگشت
        </button>
      </div>
    );
  }

  // --- INTRO SCREEN ---
  if (attemptStatus === 'intro') {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <Link href="/student/quizzes" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition mb-6">
          <ArrowRight className="w-4 h-4" />
          بازگشت به لیست آزمون‌ها
        </Link>
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 text-center">
          <div className="w-20 h-20 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Target className="w-10 h-10 text-rose-500" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">{quiz.title}</h1>
          <p className="text-gray-500 mb-8 max-w-lg mx-auto">{quiz.description || 'آماده‌اید مهارت‌های خود را محک بزنید؟'}</p>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="bg-gray-50 px-6 py-4 rounded-2xl border border-gray-100 min-w-[140px]">
              <div className="text-sm font-bold text-gray-500 mb-1">تعداد سوال</div>
              <div className="text-xl font-black text-gray-900">{quiz.questions?.length} سوال</div>
            </div>
            <div className="bg-gray-50 px-6 py-4 rounded-2xl border border-gray-100 min-w-[140px]">
              <div className="text-sm font-bold text-gray-500 mb-1">زمان آزمون</div>
              <div className="text-xl font-black text-gray-900">{quiz.duration ? `${quiz.duration} دقیقه` : 'نامحدود'}</div>
            </div>
            <div className="bg-gray-50 px-6 py-4 rounded-2xl border border-gray-100 min-w-[140px]">
              <div className="text-sm font-bold text-gray-500 mb-1">حداقل نمره قبولی</div>
              <div className="text-xl font-black text-emerald-600">{quiz.passingScore || 0}٪</div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm flex items-start gap-3 text-right max-w-lg mx-auto mb-8">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="font-medium">توجه: پس از کلیک بر روی شروع آزمون، زمان محاسبه خواهد شد و امکان متوقف کردن آن وجود ندارد. در صورت خروج قبل از اتمام، نمره شما ثبت نخواهد شد.</p>
          </div>

          <button 
            onClick={() => startMutation.mutate()}
            disabled={startMutation.isPending}
            className="px-10 py-4 bg-rose-500 text-white font-bold rounded-2xl hover:bg-rose-600 transition shadow-lg shadow-rose-500/30 flex items-center gap-2 mx-auto disabled:opacity-70"
          >
            {startMutation.isPending && <Loader2 className="w-5 h-5 animate-spin" />}
            شروع آزمون
          </button>
        </div>
      </div>
    );
  }

  // --- RESULT SCREEN ---
  if (attemptStatus === 'result' && resultData) {
    const isPassed = resultData.percentage >= (quiz.passingScore || 0);
    return (
      <div className="max-w-3xl mx-auto py-8">
        <Link href="/student/quizzes" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition mb-6">
          <ArrowRight className="w-4 h-4" />
          بازگشت به لیست آزمون‌ها
        </Link>
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 text-center relative overflow-hidden">
          <div className={`absolute top-0 inset-x-0 h-2 ${isPassed ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
          
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${isPassed ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
            {isPassed ? <CheckCircle2 className="w-12 h-12" /> : <AlertTriangle className="w-12 h-12" />}
          </div>
          
          <h1 className="text-3xl font-black text-gray-900 mb-2">نتیجه آزمون</h1>
          <h2 className={`text-xl font-bold mb-8 ${isPassed ? 'text-emerald-600' : 'text-red-600'}`}>
            {isPassed ? 'تبریک! شما در آزمون قبول شدید.' : 'متاسفانه نمره قبولی را کسب نکردید.'}
          </h2>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="bg-gray-50 px-6 py-4 rounded-2xl border border-gray-100 w-full sm:w-auto min-w-[160px]">
              <div className="text-sm font-bold text-gray-500 mb-1">نمره شما</div>
              <div className="text-3xl font-black text-gray-900">{resultData.score} <span className="text-lg text-gray-400 font-normal">/ {resultData.totalScore}</span></div>
            </div>
            <div className="bg-gray-50 px-6 py-4 rounded-2xl border border-gray-100 w-full sm:w-auto min-w-[160px]">
              <div className="text-sm font-bold text-gray-500 mb-1">درصد موفقیت</div>
              <div className={`text-3xl font-black ${isPassed ? 'text-emerald-600' : 'text-red-600'}`}>{resultData.percentage}٪</div>
            </div>
          </div>
          
          {!isPassed && (
            <p className="text-gray-500 text-sm">حداقل درصد قبولی در این آزمون <strong className="text-gray-900">{quiz.passingScore}٪</strong> می‌باشد.</p>
          )}
        </div>
      </div>
    );
  }

  // --- ACTIVE QUIZ SCREEN ---
  const questions = quiz.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const isMultiple = currentQuestion?.type === 'multiple_choice';

  return (
    <div className="max-w-5xl mx-auto min-h-[calc(100vh-120px)] flex flex-col md:flex-row gap-6 relative">
      
      {/* Sidebar Navigator */}
      <div className="w-full md:w-64 shrink-0 flex flex-col gap-4">
        {/* Timer */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center flex items-center justify-center gap-3">
          <Clock className={`w-5 h-5 ${timeLeft !== null && timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-gray-400'}`} />
          <span className={`text-2xl font-black tracking-wider ${timeLeft !== null && timeLeft < 300 ? 'text-red-600' : 'text-gray-900'}`}>
            {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
          </span>
        </div>
        
        {/* Question Navigator */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex-1">
          <h3 className="font-bold text-gray-900 mb-4 text-sm">وضعیت سوالات</h3>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q: any, i: number) => {
              const isAnswered = answers[q._id] && answers[q._id].length > 0;
              const isActive = i === currentQuestionIndex;
              return (
                <button
                  key={q._id}
                  onClick={() => setCurrentQuestionIndex(i)}
                  className={`w-10 h-10 rounded-xl font-bold text-sm transition-colors flex items-center justify-center border-2 ${
                    isActive ? 'border-rose-500 bg-rose-50 text-rose-700' :
                    isAnswered ? 'border-emerald-500 bg-emerald-500 text-white' :
                    'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        <button 
          onClick={confirmSubmit}
          disabled={submitMutation.isPending}
          className="w-full py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition shadow-sm disabled:opacity-50 flex justify-center items-center gap-2"
        >
          {submitMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          پایان آزمون
        </button>
      </div>

      {/* Main Question Area */}
      <div className="flex-1 bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100 flex flex-col h-full">
        {currentQuestion && (
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
              <span className="text-sm font-bold text-gray-400">سوال {currentQuestionIndex + 1} از {questions.length}</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold">{currentQuestion.score} نمره</span>
            </div>
            
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-8 leading-relaxed">
              {currentQuestion.text}
            </h2>
            
            {isMultiple && <p className="text-sm text-amber-600 font-bold mb-4">شما می‌توانید بیش از یک گزینه انتخاب کنید.</p>}

            <div className="space-y-3">
              {currentQuestion.options.map((option: any) => {
                const isSelected = (answers[currentQuestion._id] || []).includes(option._id);
                return (
                  <label 
                    key={option._id}
                    className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected ? 'border-rose-500 bg-rose-50/50' : 'border-gray-100 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-6 h-6 shrink-0 flex items-center justify-center border-2 bg-white transition-colors ${
                      isMultiple ? 'rounded-md' : 'rounded-full'
                    } ${
                      isSelected ? 'border-rose-500 text-rose-500' : 'border-gray-300 text-transparent'
                    }`}>
                      {isSelected && (
                        <div className={`bg-rose-500 ${isMultiple ? 'w-3 h-3 rounded-sm' : 'w-3 h-3 rounded-full'}`}></div>
                      )}
                    </div>
                    <input 
                      type={isMultiple ? "checkbox" : "radio"}
                      name={`question_${currentQuestion._id}`}
                      className="hidden"
                      checked={isSelected}
                      onChange={() => handleOptionSelect(currentQuestion._id, option._id, isMultiple)}
                    />
                    <span className="font-medium text-gray-700 leading-relaxed text-sm md:text-base">{option.text}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-12 pt-6 border-t border-gray-100 shrink-0">
          <button 
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition"
          >
            <ChevronRight className="w-5 h-5" /> قبلی
          </button>
          
          {currentQuestionIndex < questions.length - 1 ? (
            <button 
              onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
            >
              بعدی <ChevronLeft className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={confirmSubmit}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold bg-gray-900 text-white hover:bg-black transition shadow-lg shadow-black/10"
            >
              ثبت نهایی آزمون
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
