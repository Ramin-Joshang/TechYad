import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { learningApi } from '@/features/learning/api/learning.api';
import { MessageSquare, Send, Loader2, User } from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/auth.store';

export function LessonComments({ lessonId }: { lessonId: string }) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [text, setText] = useState('');

  const { data: commentsData, isLoading } = useQuery({
    queryKey: ['lessonComments', lessonId],
    queryFn: () => learningApi.getLessonComments(lessonId).then(res => res.data)
  });

  const addCommentMutation = useMutation({
    mutationFn: (data: { text: string }) => learningApi.addLessonComment(lessonId, data.text),
    onSuccess: () => {
      setText('');
      queryClient.invalidateQueries({ queryKey: ['lessonComments', lessonId] });
    }
  });

  const comments = commentsData || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addCommentMutation.mutate({ text });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* New Comment Form */}
      <div className="bg-gray-800/50 p-4 sm:p-6 rounded-2xl border border-gray-700/50">
        <div className="flex gap-4">
          <div className="w-10 h-10 bg-gray-700 rounded-full shrink-0 overflow-hidden">
            {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <User className="w-full h-full p-2 text-gray-400" />}
          </div>
          <form onSubmit={handleSubmit} className="flex-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="سوال یا نظر خود را درباره این جلسه بنویسید..."
              className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[100px] resize-y transition"
            ></textarea>
            <div className="flex justify-end mt-3">
              <button
                type="submit"
                disabled={!text.trim() || addCommentMutation.isPending}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {addCommentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                ثبت دیدگاه
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">هنوز دیدگاهی ثبت نشده است. اولین نفری باشید که نظر می‌دهد!</p>
          </div>
        ) : (
          comments.map((comment: any) => (
            <div key={comment._id} className="flex gap-4">
              <div className="w-10 h-10 bg-gray-800 rounded-full shrink-0 overflow-hidden border border-gray-700">
                {comment.userId?.avatar ? <img src={comment.userId.avatar} className="w-full h-full object-cover" /> : <User className="w-full h-full p-2 text-gray-500" />}
              </div>
              <div className="flex-1">
                <div className="bg-gray-800/80 border border-gray-700/50 p-4 rounded-2xl rounded-tr-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-gray-200">{comment.userId?.firstName} {comment.userId?.lastName}</span>
                    {comment.userId?.role === 'instructor' && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold">مدرس</span>
                    )}
                    <span className="text-xs text-gray-500 mr-auto">{new Date(comment.createdAt).toLocaleDateString('fa-IR')}</span>
                  </div>
                  <p className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">{comment.text}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
