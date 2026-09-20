'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2, Search, Video, Calendar, Users, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function InstructorClassesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '', slug: '', shortDescription: '', mode: 'online', startDate: '', price: 0, maxStudents: 50
  });

  const { data: classesData, isLoading } = useQuery({
    queryKey: ['instructor-classes'],
    queryFn: () => api.get('/instructor/classes').then(res => res.data)
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/instructor/classes', data),
    onSuccess: () => {
      toast.success('کلاس با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: ['instructor-classes'] });
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.patch(`/instructor/classes/${editId}`, data),
    onSuccess: () => {
      toast.success('کلاس با موفقیت ویرایش شد');
      queryClient.invalidateQueries({ queryKey: ['instructor-classes'] });
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/instructor/classes/${id}`),
    onSuccess: () => {
      toast.success('کلاس با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: ['instructor-classes'] });
    }
  });

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setFormData({ title: '', slug: '', shortDescription: '', mode: 'online', startDate: '', price: 0, maxStudents: 50 });
  };

  const handleEdit = (cls: any) => {
    setEditId(cls._id);
    setFormData({
      title: cls.title,
      slug: cls.slug,
      shortDescription: cls.shortDescription || '',
      mode: cls.mode || 'online',
      startDate: cls.startDate ? cls.startDate.substring(0, 16) : '',
      price: cls.price || 0,
      maxStudents: cls.capacity || cls.maxStudents || 50
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) updateMutation.mutate(formData);
    else createMutation.mutate(formData);
  };

  const classes = classesData?.classes || [];
  const filteredClasses = classes.filter((c: any) => 
    c.title?.toLowerCase().includes(search.toLowerCase())
  );

  if (showForm) {
    return (
      <div className="max-w-3xl mx-auto bg-[var(--neo-surface)] p-6 md:p-8 rounded-3xl shadow-sm border border-[var(--neo-border)] animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[var(--neo-text-main)]">{editId ? 'ویرایش کلاس' : 'ایجاد کلاس جدید'}</h2>
          <button onClick={resetForm} className="p-2 text-[var(--neo-text-muted)] hover:text-[var(--neo-text-main)] rounded-xl bg-[var(--neo-surface-2)]"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[var(--neo-text-main)] mb-1.5">عنوان کلاس</label>
              <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-[var(--neo-border)] focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--neo-text-main)] mb-1.5">شناسه (Slug)</label>
              <input required type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-[var(--neo-border)] focus:ring-2 focus:ring-emerald-500 outline-none dir-ltr text-left" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--neo-text-main)] mb-1.5">توضیح کوتاه</label>
              <textarea value={formData.shortDescription} onChange={e => setFormData({...formData, shortDescription: e.target.value})} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-[var(--neo-border)] focus:ring-2 focus:ring-emerald-500 outline-none resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--neo-text-main)] mb-1.5">نوع برگزاری</label>
              <select value={formData.mode} onChange={e => setFormData({...formData, mode: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-[var(--neo-border)] focus:ring-2 focus:ring-emerald-500 outline-none">
                <option value="online">آنلاین</option>
                <option value="in_person">حضوری</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--neo-text-main)] mb-1.5">تاریخ شروع</label>
              <input type="datetime-local" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-[var(--neo-border)] focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--neo-text-main)] mb-1.5">هزینه ثبت‌نام (تومان)</label>
              <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full px-4 py-2.5 rounded-xl border border-[var(--neo-border)] focus:ring-2 focus:ring-emerald-500 outline-none dir-ltr text-left" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--neo-text-main)] mb-1.5">ظرفیت</label>
              <input type="number" value={formData.maxStudents} onChange={e => setFormData({...formData, maxStudents: Number(e.target.value)})} className="w-full px-4 py-2.5 rounded-xl border border-[var(--neo-border)] focus:ring-2 focus:ring-emerald-500 outline-none dir-ltr text-left" />
            </div>
          </div>
          <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-70">
            {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            ذخیره اطلاعات
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--neo-surface)] p-6 rounded-3xl shadow-sm border border-[var(--neo-border)]">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl"><Video className="w-6 h-6" /></div>
          <div>
            <h1 className="text-xl font-black text-[var(--neo-text-main)]">مدیریت کلاس‌ها</h1>
            <p className="text-[var(--neo-text-secondary)] mt-1 text-sm">برنامه‌ریزی و مدیریت کلاس‌های آنلاین و حضوری</p>
          </div>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition w-full sm:w-auto">
          <Plus className="w-5 h-5" /> ایجاد کلاس جدید
        </button>
      </div>
      {isLoading ? (
        <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
      ) : filteredClasses.length === 0 ? (
        <div className="p-12 bg-[var(--neo-surface)] rounded-3xl border border-[var(--neo-border)] text-center text-[var(--neo-text-secondary)] font-medium">
          شما هنوز کلاسی ایجاد نکرده‌اید.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls: any) => (
            <div key={cls._id} className="bg-[var(--neo-surface)] rounded-3xl overflow-hidden border border-[var(--neo-border)] shadow-sm flex flex-col hover:shadow-md transition-shadow relative group">
              
              <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(cls)} className="p-2 bg-[var(--neo-surface)] text-[var(--neo-primary)] hover:bg-[var(--neo-primary)]/10 rounded-lg shadow-sm" title="ویرایش">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => { if(window.confirm('حذف شود؟')) deleteMutation.mutate(cls._id); }} className="p-2 bg-[var(--neo-surface)] text-rose-600 hover:bg-rose-50 rounded-lg shadow-sm" title="حذف">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="aspect-video bg-[var(--neo-surface-2)] relative">
                <img src={cls.thumbnail || `https://picsum.photos/seed/${cls._id}/400/250`} alt={cls.title} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 bg-[var(--neo-surface)]/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                  {cls.mode === 'online' ? 'آنلاین' : 'حضوری'}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-[var(--neo-text-main)] mb-2 line-clamp-1">{cls.title}</h3>
                <p className="text-sm text-[var(--neo-text-secondary)] mb-4 line-clamp-2">{cls.shortDescription || 'توضیحاتی ثبت نشده است'}</p>
                
                <div className="mt-auto space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-[var(--neo-text-secondary)]">
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    <span className="font-medium dir-ltr text-right">
                      {cls.startDate ? new Date(cls.startDate).toLocaleString('fa-IR') : 'نامشخص'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[var(--neo-text-secondary)]">
                    <Users className="w-4 h-4 text-emerald-500" />
                    <span>ظرفیت: {cls.capacity || cls.maxStudents || 'نامحدود'} نفر</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-auto">
                  <Link href={`/classes/${cls.slug || cls._id}`} className="text-center py-2 bg-[var(--neo-surface-2)] hover:bg-[var(--neo-surface-2)] text-[var(--neo-text-main)] text-sm font-bold rounded-xl transition-colors">
                    مشاهده صفحه
                  </Link>
                  {cls.meetingLink ? (
                    <a href={cls.meetingLink} target="_blank" rel="noreferrer" className="text-center py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-bold rounded-xl transition-colors">
                      ورود به کلاس
                    </a>
                  ) : (
                    <button disabled className="text-center py-2 bg-[var(--neo-surface-2)] text-[var(--neo-text-muted)] text-sm font-bold rounded-xl">
                      حضوری
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
