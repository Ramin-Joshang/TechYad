'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsApi, CommentItem } from '../api/comments.api';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { 
  MessageSquare, Star, Reply, Send, CheckCircle2, 
  Clock, ShieldCheck, GraduationCap, User, Loader2,
  AlertCircle, ChevronDown, ChevronUp, Sparkles, LogIn
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface CommentsSectionProps {
  courseId?: string;
  courseSlug?: string;
  classId?: string;
  classSlug?: string;
  isInstructor?: boolean;
}

export function CommentsSection({
  courseId,
  courseSlug,
  classId,
  classSlug,
  isInstructor = false
}: CommentsSectionProps) {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const [content, setContent] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [page, setPage] = useState(1);

  const queryKey = ['comments', courseId || courseSlug || classId || classSlug, page];

  const { data: resData, isLoading } = useQuery({
    queryKey,
    queryFn: () => commentsApi.getApprovedComments({
      courseId,
      courseSlug,
      classId,
      classSlug,
      page,
      limit: 10
    }).then(res => res.data),
    staleTime: 1000 * 30, // 30s cache
  });

  const comments: CommentItem[] = resData?.comments || [];
  const stats = resData?.stats || { averageRating: 5, totalReviews: 0, totalComments: 0 };
  const totalPages = resData?.totalPages || 1;

  // Add Comment Mutation
  const addCommentMutation = useMutation({
    mutationFn: (data: { content: string; rating?: number; parentId?: string }) => 
      commentsApi.addComment({
        courseId,
        classId,
        content: data.content,
        rating: data.rating,
        parentId: data.parentId
      }),
    onSuccess: (res) => {
      toast.success(res.message || 'دیدگاه شما با موفقیت ثبت شد و پس از بررسی منتشر خواهد شد');
      setContent('');
      setRating(5);
      setReplyingToId(null);
      setReplyContent('');
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ثبت دیدگاه. لطفاً دوباره تلاش کنید');
    }
  });

  // Instructor Reply Mutation
  const instructorReplyMutation = useMutation({
    mutationFn: (data: { commentId: string; content: string }) => 
      commentsApi.replyAsInstructor(data.commentId, data.content),
    onSuccess: (res) => {
      toast.success(res.message || 'پاسخ مدرس با موفقیت منتشر گردید');
      setReplyingToId(null);
      setReplyContent('');
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'خطا در ارسال پاسخ');
    }
  });

  const handleMainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('لطفاً متن نظر خود را بنویسید');
      return;
    }
    addCommentMutation.mutate({
      content: content.trim(),
      rating: courseId || courseSlug ? rating : undefined
    });
  };

  const handleReplySubmit = (parentId: string) => {
    if (!replyContent.trim()) {
      toast.error('متن پاسخ نمی‌تواند خالی باشد');
      return;
    }

    if (isInstructor) {
      instructorReplyMutation.mutate({
        commentId: parentId,
        content: replyContent.trim()
      });
    } else {
      addCommentMutation.mutate({
        content: replyContent.trim(),
        parentId
      });
    }
  };

  const getRatingLabel = (score: number) => {
    switch (score) {
      case 5: return 'عالی و کاربردی';
      case 4: return 'خیلی خوب';
      case 3: return 'متوسط و خوب';
      case 2: return 'نیاز به بهبود';
      case 1: return 'ضعیف';
      default: return '';
    }
  };

  return (
    <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[var(--neo-border)] shadow-xs space-y-8 animate-in fade-in">
      
      {/* Header and Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-indigo-600" />
            دیدگاه‌ها و پرسش‌وپاسخ دانشجویان
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            نظرات، تجربیات یادگیری دانشجویان و پاسخ‌های رسمی استاد این بخش
          </p>
        </div>

        {/* Rating Score Card */}
        {(courseId || courseSlug) && (
          <div className="flex items-center gap-3 bg-amber-50/80 border border-amber-200/80 px-4 py-2.5 rounded-2xl">
            <div className="text-center">
              <div className="text-2xl font-black text-amber-600 font-mono leading-none">
                {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '۵.۰'}
              </div>
              <span className="text-[10px] text-amber-700/80 font-bold">از ۵ ستاره</span>
            </div>
            <div className="w-px h-8 bg-amber-200" />
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`w-3.5 h-3.5 ${star <= Math.round(stats.averageRating) ? 'fill-amber-400 text-amber-400' : 'text-amber-200'}`} 
                  />
                ))}
              </div>
              <div className="text-[11px] text-slate-600 font-mono">
                {stats.totalReviews} امتیاز ثبت شده
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Comment Creation Box */}
      <div className="bg-slate-50/70 rounded-3xl p-5 sm:p-6 border border-slate-200/80 space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          ارسال نظر یا پرسش جدید
        </h3>

        {!isAuthenticated ? (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <LogIn className="w-5 h-5" />
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              برای ثبت دیدگاه، پرسش از مدرس یا امتیازدهی ابتدا وارد حساب کاربری خود شوید.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-xs"
            >
              <span>ورود به حساب کاربری</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleMainSubmit} className="space-y-4">
            {/* Interactive Rating (only for courses) */}
            {(courseId || courseSlug) && (
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold text-slate-700">امتیاز شما به این دوره:</span>
                <div className="flex items-center gap-1.5" dir="ltr">
                  {[1, 2, 3, 4, 5].map((s) => {
                    const active = (hoverRating || rating) >= s;
                    return (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setRating(s)}
                        onMouseEnter={() => setHoverRating(s)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 text-slate-300 hover:scale-110 transition cursor-pointer"
                        title={getRatingLabel(s)}
                      >
                        <Star className={`w-5 h-5 transition-colors ${
                          active ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                        }`} />
                      </button>
                    );
                  })}
                </div>
                <span className="text-xs font-bold text-amber-600">
                  {getRatingLabel(hoverRating || rating)}
                </span>
              </div>
            )}

            {/* Comment Textarea */}
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="پرسش خود را بنویسید یا نظر و تجربه‌تان از یادگیری این مبحث را با استاد و سایر دانشجویان به اشتراک بگذارید..."
                rows={4}
                maxLength={2000}
                className="w-full p-4 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition leading-relaxed resize-none"
              />
              <div className="text-[11px] text-slate-400 font-mono text-left px-2">
                {content.length}/2000
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-1">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>دیدگاه شما پس از بررسی توسط تیم نظارت در سایت منتشر خواهد شد.</span>
              </div>

              <button
                type="submit"
                disabled={addCommentMutation.isPending || !content.trim()}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition shadow-xs disabled:opacity-50 cursor-pointer self-end sm:self-auto"
              >
                {addCommentMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>ارسال دیدگاه</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
            <span className="text-xs text-slate-400">در حال دریافت دیدگاه‌ها...</span>
          </div>
        ) : comments.length === 0 ? (
          <div className="py-12 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 space-y-2">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-sm text-slate-700">اولین نفری باشید که نظر خود را ثبت می‌کند!</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              هنوز دیدگاهی برای این بخش ثبت نشده است. دیدگاه یا پرسش شما می‌تواند به سایر دوستان کمک کند.
            </p>
          </div>
        ) : (
          comments.map((comment) => {
            const author = comment.userId;
            const authorName = author 
              ? `${author.firstName || ''} ${author.lastName || ''}`.trim() || 'دانشجو' 
              : 'کاربر';
            const isReplying = replyingToId === comment._id;

            return (
              <div 
                key={comment._id} 
                className="p-5 sm:p-6 rounded-3xl bg-slate-50/60 border border-slate-200/80 space-y-4 hover:border-slate-300 transition"
              >
                {/* Author Info & Rating */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=4f46e5&color=fff`}
                      alt={authorName}
                      className="w-10 h-10 rounded-2xl object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{authorName}</span>
                        {author?.role === 'instructor' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
                            <GraduationCap className="w-3 h-3" />
                            مدرس
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                        {new Date(comment.createdAt).toLocaleDateString('fa-IR')}
                      </span>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  {comment.rating && (
                    <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-slate-200">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`w-3 h-3 ${star <= (comment.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Comment Content */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </p>

                {/* Actions: Reply button */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => {
                      if (!isAuthenticated) {
                        toast.error('برای ارسال پاسخ لطفاً وارد حساب خود شوید');
                        return;
                      }
                      setReplyingToId(isReplying ? null : comment._id);
                      setReplyContent('');
                    }}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      isReplying 
                        ? 'bg-slate-200 text-slate-800' 
                        : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    <Reply className="w-3.5 h-3.5" />
                    <span>{isReplying ? 'انصراف' : 'پاسخ'}</span>
                  </button>
                </div>

                {/* Inline Reply Form */}
                {isReplying && (
                  <div className="p-4 bg-white rounded-2xl border border-indigo-200 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Reply className="w-3.5 h-3.5 text-indigo-600" />
                        پاسخ به {authorName}:
                      </span>
                      {isInstructor && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <GraduationCap className="w-3 h-3" />
                          ارسال به عنوان مدرس رسمی دوره
                        </span>
                      )}
                    </div>
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="متن پاسخ خود را بنویسید..."
                      rows={3}
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setReplyingToId(null)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                      >
                        انصراف
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReplySubmit(comment._id)}
                        disabled={addCommentMutation.isPending || instructorReplyMutation.isPending || !replyContent.trim()}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 cursor-pointer shadow-xs"
                      >
                        {addCommentMutation.isPending || instructorReplyMutation.isPending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span>ارسال پاسخ</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Nested Replies List */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mr-4 sm:mr-8 space-y-3 pt-3 border-r-2 border-indigo-200 pr-3 sm:pr-4">
                    {comment.replies.map((reply) => {
                      const replyAuthor = reply.userId;
                      const replyName = replyAuthor 
                        ? `${replyAuthor.firstName || ''} ${replyAuthor.lastName || ''}`.trim() || 'کاربر' 
                        : 'کاربر';
                      const isTeacher = reply.isTeacherReply || replyAuthor?.role === 'instructor';

                      return (
                        <div 
                          key={reply._id}
                          className={`p-4 rounded-2xl transition ${
                            isTeacher 
                              ? 'bg-emerald-50/60 border border-emerald-200 shadow-2xs' 
                              : 'bg-white border border-slate-200'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={replyAuthor?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(replyName)}&background=${isTeacher ? '059669' : '4f46e5'}&color=fff`}
                                alt={replyName}
                                className={`w-8 h-8 rounded-xl object-cover shrink-0 ${
                                  isTeacher ? 'border-2 border-emerald-300' : 'border border-slate-200'
                                }`}
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 text-xs sm:text-sm">
                                    {replyName}
                                  </span>
                                  {isTeacher && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1 shadow-2xs">
                                      <GraduationCap className="w-3 h-3" />
                                      مدرس دوره
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                                  {new Date(reply.createdAt).toLocaleDateString('fa-IR')}
                                </span>
                              </div>
                            </div>
                          </div>

                          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {reply.content}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-4 border-t border-slate-100 text-xs text-slate-500 font-medium">
          <span>صفحه {page} از {totalPages}</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition font-bold cursor-pointer"
            >
              صفحه قبلی
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition font-bold cursor-pointer"
            >
              صفحه بعدی
            </button>
          </div>
        </div>
      )}

    </section>
  );
}
