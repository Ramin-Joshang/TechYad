'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentsApi } from '@/features/learning/api/assignments.api';
import { FileText, Loader2, ArrowRight, Download, UploadCloud, CheckCircle2, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { mediaApi } from '@/features/media/api/media.api';

export default function AssignmentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const queryClient = useQueryClient();
  
  const [answerText, setAnswerText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [fileId, setFileId] = useState<string | null>(null);
  
  const { data: detailData, isLoading, isError } = useQuery({
    queryKey: ['myAssignmentDetail', id],
    queryFn: () => assignmentsApi.getAssignmentDetails(id).then(res => res.data),
    retry: 1
  });

  const submitMutation = useMutation({
    mutationFn: (data: { answerText?: string, files?: string[] }) => assignmentsApi.submitAssignment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAssignmentDetail', id] });
      queryClient.invalidateQueries({ queryKey: ['myAssignments'] });
      queryClient.invalidateQueries({ queryKey: ['studentDashboard'] });
    }
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setUploading(true);
      const res = await mediaApi.uploadFile(file);
      setFileId(res.data._id);
    } catch (err) {
      console.error('File upload failed', err);
      alert('خطا در آپلود فایل');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerText.trim() && !fileId) {
      alert('لطفاً متن پاسخ را وارد کنید یا فایلی آپلود نمایید.');
      return;
    }
    submitMutation.mutate({
      answerText: answerText.trim(),
      files: fileId ? [fileId] : []
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
        <p className="text-gray-500">در حال بارگذاری جزئیات تکلیف...</p>
      </div>
    );
  }

  if (isError || !detailData) {
    return (
      <div className="bg-white rounded-3xl p-16 text-center border border-red-100 shadow-sm flex flex-col items-center justify-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">تکلیف یافت نشد</h3>
        <button onClick={() => router.back()} className="mt-4 px-6 py-2 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition">
          بازگشت
        </button>
      </div>
    );
  }

  const { assignment, submission } = detailData;
  const isLate = assignment.deadline && new Date() > new Date(assignment.deadline) && !submission;

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div>
        <Link href="/student/assignments" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition mb-6">
          <ArrowRight className="w-4 h-4" />
          بازگشت به تکالیف
        </Link>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">{assignment.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
              <span>دوره: <span className="text-gray-700">{assignment.courseId?.title}</span></span>
              <span>•</span>
              <span>جلسه: <span className="text-gray-700">{assignment.lessonId?.title}</span></span>
            </div>
          </div>
          
          <div className="bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm text-center min-w-[120px]">
            <div className="text-xs text-gray-500 mb-1">نمره کل</div>
            <div className="text-xl font-black text-amber-600">{assignment.maxScore}</div>
          </div>
        </div>
      </div>

      {isLate && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center gap-3">
          <Clock className="w-6 h-6 shrink-0" />
          <div>
            <h4 className="font-bold">مهلت ارسال گذشته است</h4>
            <p className="text-sm">متاسفانه مهلت ارسال این تکلیف به پایان رسیده است.</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-8">
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">توضیحات تکلیف</h2>
          <div className="prose prose-sm md:prose-base max-w-none text-gray-700 whitespace-pre-wrap">
            {assignment.description}
          </div>
        </div>

        {assignment.attachments?.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">فایل‌های ضمیمه</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {assignment.attachments.map((file: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText className="w-5 h-5 text-gray-400 shrink-0" />
                    <span className="font-medium text-sm text-gray-700 truncate">{file.name || 'فایل پیوست'}</span>
                  </div>
                  <a href={file.url || '#'} className="p-2 hover:bg-gray-200 rounded-lg transition text-gray-500 hover:text-gray-900">
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {assignment.deadline && (
          <div className="bg-amber-50 text-amber-800 p-4 rounded-xl text-sm flex items-center justify-between font-medium">
            <span>مهلت ارسال:</span>
            <span>{new Date(assignment.deadline).toLocaleString('fa-IR')}</span>
          </div>
        )}
      </div>

      {/* Submission Section */}
      {submission ? (
        <div className="bg-gray-900 rounded-3xl p-6 md:p-8 shadow-sm text-white">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-6">
            <h2 className="text-xl font-bold">وضعیت ارسال شما</h2>
            <div className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 ${
              submission.status === 'graded' ? 'bg-emerald-500/20 text-emerald-400' :
              submission.status === 'reviewing' ? 'bg-purple-500/20 text-purple-400' :
              'bg-blue-500/20 text-blue-400'
            }`}>
              {submission.status === 'graded' ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              {submission.status === 'graded' ? 'تصحیح شده' : submission.status === 'reviewing' ? 'در حال بررسی' : 'ارسال شده'}
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-gray-400 mb-2">متن پاسخ:</h3>
              <div className="bg-gray-800 p-4 rounded-xl text-gray-300 text-sm whitespace-pre-wrap border border-gray-700">
                {submission.answerText || 'متنی وارد نشده است.'}
              </div>
            </div>

            {submission.files?.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-400 mb-2">فایل‌های ارسال شده:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {submission.files.map((file: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-800 border border-gray-700 rounded-xl">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FileText className="w-5 h-5 text-gray-500 shrink-0" />
                        <span className="font-medium text-sm text-gray-300 truncate">{file.name || 'فایل آپلود شده'}</span>
                      </div>
                      <a href={file.url || '#'} className="p-2 hover:bg-gray-700 rounded-lg transition text-gray-400 hover:text-white">
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {submission.status === 'graded' && (
              <div className="mt-8 bg-emerald-900/30 border border-emerald-800 p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  نتیجه بررسی استاد
                </h3>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="bg-emerald-950 p-4 rounded-xl text-center min-w-[120px] shrink-0 border border-emerald-900">
                    <div className="text-xs text-emerald-500 mb-1">نمره شما</div>
                    <div className="text-3xl font-black text-emerald-400">{submission.score} <span className="text-sm font-normal text-emerald-600">/ {assignment.maxScore}</span></div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-emerald-500 mb-2">بازخورد:</div>
                    <p className="text-emerald-100 text-sm leading-relaxed whitespace-pre-wrap">
                      {submission.feedback || 'استاد بازخوردی برای این تکلیف ثبت نکرده است.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : !isLate ? (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">ارسال پاسخ</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">متن پاسخ (اختیاری اگر فایل آپلود می‌کنید)</label>
              <textarea 
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                rows={6}
                className="w-full border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all resize-y"
                placeholder="توضیحات یا پاسخ خود را اینجا بنویسید..."
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">آپلود فایل (اختیاری)</label>
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:bg-gray-50 transition-colors">
                {uploading ? (
                  <div className="flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-2" />
                    <span className="text-sm text-gray-500 font-medium">در حال آپلود...</span>
                  </div>
                ) : fileId ? (
                  <div className="flex flex-col items-center justify-center text-emerald-600">
                    <CheckCircle className="w-8 h-8 mb-2" />
                    <span className="text-sm font-bold">فایل با موفقیت ضمیمه شد</span>
                    <button type="button" onClick={() => setFileId(null)} className="mt-2 text-xs text-red-500 hover:underline">حذف فایل</button>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium mb-2">فایل خود را اینجا رها کنید یا کلیک کنید</p>
                    <p className="text-xs text-gray-400 mb-4">PDF, DOC, ZIP (حداکثر 20MB)</p>
                    <input 
                      type="file" 
                      id="file-upload" 
                      className="hidden" 
                      onChange={handleFileUpload}
                    />
                    <label htmlFor="file-upload" className="inline-block px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg cursor-pointer hover:bg-gray-200 transition">
                      انتخاب فایل
                    </label>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button 
                type="submit" 
                disabled={submitMutation.isPending || (!answerText.trim() && !fileId)}
                className="px-8 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
              >
                {submitMutation.isPending && <Loader2 className="w-5 h-5 animate-spin" />}
                ثبت نهایی تکلیف
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
