'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2, MessageSquare, Reply, User } from 'lucide-react';

export default function InstructorCommentsPage() {
  const queryClient = useQueryClient();
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const { data: comments, isLoading } = useQuery({
    queryKey: ['instructor-comments'],
    queryFn: () => api.get('/instructor/comments').then(res => res.data)
  });

  const replyMutation = useMutation({
    mutationFn: (data: { lessonId: string, parentId: string, text: string }) => 
      api.post(`/lessons/${data.lessonId}/comments`, { parentId: data.parentId, text: data.text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-comments'] });
      setReplyId(null);
      setReplyText('');
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[var(--neo-text-main)]">نظرات دانشجویان</h1>
        <p className="text-[var(--neo-text-secondary)] mt-1">مدیریت و پاسخ‌دهی به پرسش‌ها و نظرات دانشجویان در دروس</p>
      </div>

      <div className="bg-[var(--neo-surface)] rounded-3xl shadow-sm border border-[var(--neo-border)] overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center text-[var(--neo-primary)]"><Loader2 className="w-8 h-8 animate-spin" /></div>
        ) : !comments?.length ? (
          <div className="p-12 text-center text-[var(--neo-text-secondary)] font-medium">هیچ نظری یافت نشد.</div>
        ) : (
          <div className="divide-y divide-[var(--neo-border)]">
            {comments.map((comment: any) => (
              <div key={comment._id} className="p-6 hover:bg-[var(--neo-surface-2)]/50 transition-colors">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-[var(--neo-primary)] flex items-center justify-center font-bold overflow-hidden shrink-0">
                    {comment.userId?.avatar ? (
                      <img src={comment.userId.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      comment.userId?.firstName?.charAt(0) || <User className="w-6 h-6"/>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-[var(--neo-text-main)]">
                          {comment.userId?.firstName} {comment.userId?.lastName}
                        </h4>
                        <div className="text-xs text-[var(--neo-text-secondary)] mt-1">
                          در درس: <span className="font-medium text-[var(--neo-text-main)]">{comment.lessonId?.title || 'نامشخص'}</span>
                        </div>
                      </div>
                      <span className="text-xs text-[var(--neo-text-muted)]">
                        {new Date(comment.createdAt).toLocaleDateString('fa-IR')}
                      </span>
                    </div>
                    
                    <p className="text-[var(--neo-text-main)] mt-3 bg-[var(--neo-surface-2)] p-4 rounded-2xl border border-[var(--neo-border)]">
                      {comment.text}
                    </p>
                    
                    <div className="mt-4">
                      {replyId === comment._id ? (
                        <div className="animate-in fade-in slide-in-from-top-2">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="w-full px-4 py-3 bg-[var(--neo-surface)] border border-[var(--neo-primary)]/30 rounded-xl focus:ring-2 focus:ring-[var(--neo-primary)] focus:border-transparent outline-none transition-all resize-none mb-3"
                            rows={3}
                            placeholder="پاسخ خود را بنویسید..."
                          ></textarea>
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => setReplyId(null)}
                              className="px-4 py-2 bg-[var(--neo-surface-2)] hover:bg-[var(--neo-border)] text-[var(--neo-text-main)] font-bold rounded-lg transition-colors text-sm"
                            >
                              انصراف
                            </button>
                            <button 
                              onClick={() => replyMutation.mutate({ lessonId: comment.lessonId?._id, parentId: comment._id, text: replyText })}
                              disabled={!replyText.trim() || replyMutation.isPending}
                              className="px-4 py-2 bg-[var(--neo-primary)] hover:bg-[var(--neo-primary)] text-white font-bold rounded-lg shadow-md disabled:opacity-50 transition-colors flex items-center gap-2 text-sm"
                            >
                              {replyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : <Reply className="w-4 h-4"/>}
                              ثبت پاسخ
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setReplyId(comment._id)}
                          className="flex items-center gap-2 text-sm font-bold text-[var(--neo-primary)] hover:text-[var(--neo-primary)] transition-colors"
                        >
                          <Reply className="w-4 h-4" />
                          پاسخ دادن
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
