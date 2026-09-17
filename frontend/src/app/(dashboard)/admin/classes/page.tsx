'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/features/admin/api/admin.api';
import { Loader2, Search, Video, Calendar, Users, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AdminClassesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '', slug: '', shortDescription: '', mode: 'online', startDate: '', price: 0, capacity: 50
  });

  const { data: classesData, isLoading } = useQuery({
    queryKey: ['adminClasses'],
    queryFn: () => adminApi.getClasses().then(res => res.data)
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => adminApi.createClass(data),
    onSuccess: () => {
      toast.success('کلاس با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: ['adminClasses'] });
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminApi.updateClass(editId!, data),
    onSuccess: () => {
      toast.success('کلاس با موفقیت ویرایش شد');
      queryClient.invalidateQueries({ queryKey: ['adminClasses'] });
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteClass(id),
    onSuccess: () => {
      toast.success('کلاس با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: ['adminClasses'] });
    }
  });

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setFormData({ title: '', slug: '', shortDescription: '', mode: 'online', startDate: '', price: 0, capacity: 50 });
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
      capacity: cls.capacity || cls.maxStudents || 50
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
      <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">{editId ? 'ویرایش کلاس' : 'ایجاد کلاس جدید'}</h2>
          <button onClick={resetForm} className="p-2 text-gray-400 hover:text-gray-900 rounded-xl bg-gray-50"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">عنوان کلاس</label>
              <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">شناسه (Slug)</label>
              <input required type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none dir-ltr text-left" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">توضیح کوتاه</label>
              <textarea value={formData.shortDescription} onChange={e => setFormData({...formData, shortDescription: e.target.value})} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">نوع برگزاری</label>
              <select value={formData.mode} onChange={e => setFormData({...formData, mode: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none">
                <option value="online">آنلاین</option>
                <option value="in_person">حضوری</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">تاریخ شروع</label>
              <input type="datetime-local" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">هزینه ثبت‌نام (تومان)</label>
              <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none dir-ltr text-left" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ظرفیت</label>
              <input type="number" value={formData.capacity} onChange={e => setFormData({...formData, capacity: Number(e.target.value)})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none dir-ltr text-left" />
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl"><Video className="w-6 h-6" /></div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">کلاس‌های زنده و حضوری</h1>
            <p className="text-gray-500 mt-1">مشاهده و مدیریت کلاس‌های ایجاد شده در پلتفرم</p>
          </div>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition">
          <Plus className="w-5 h-5" /> ایجاد کلاس جدید
        </button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="relative max-w-md">
          <Search className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="جستجوی کلاس..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
      </div>
      {isLoading ? (
        <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
      ) : filteredClasses.length === 0 ? (
        <div className="p-12 bg-white rounded-3xl border border-gray-100 text-center text-gray-500 font-medium">
          کلاسی برای نمایش وجود ندارد.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls: any) => (
            <div key={cls._id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm flex flex-col hover:shadow-md transition-shadow relative group">
              
              <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(cls)} className="p-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg shadow-sm" title="ویرایش">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => { if(window.confirm('حذف شود؟')) deleteMutation.mutate(cls._id); }} className="p-2 bg-white text-rose-600 hover:bg-rose-50 rounded-lg shadow-sm" title="حذف">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="aspect-video bg-gray-100 relative">
                <img src={cls.thumbnail || `https://picsum.photos/seed/${cls._id}/400/250`} alt={cls.title} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                  {cls.mode === 'online' ? 'آنلاین' : 'حضوری'}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">{cls.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{cls.shortDescription || 'توضیحاتی ثبت نشده است'}</p>
                
                <div className="mt-auto space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    <span className="font-medium dir-ltr text-right">
                      {cls.startDate ? new Date(cls.startDate).toLocaleString('fa-IR') : 'نامشخص'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-emerald-500" />
                    <span>ظرفیت: {cls.capacity || cls.maxStudents || 'نامحدود'} نفر</span>
                  </div>
                </div>
                
                <Link href={`/classes/${cls.slug || cls._id}`} className="w-full text-center py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition-colors">
                  مشاهده صفحه کلاس
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
