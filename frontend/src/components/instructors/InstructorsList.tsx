'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Star, BookOpen, Users, Award, Search, Filter, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export function InstructorsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  
  const { data: instructors, isLoading } = useQuery({
    queryKey: ['instructors'],
    queryFn: () => api.get('/instructors').then((res: any) => res.data)
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white p-6 rounded-2xl border border-[var(--neo-border)] shadow-sm h-64"></div>
          ))}
        </div>
      </div>
    );
  }

  // Extract all unique specialties for the filter
  const allSpecialties = Array.from(new Set(instructors?.flatMap((inst: any) => inst.specialties || []) || []));

  const filteredInstructors = instructors?.filter((inst: any) => {
    const fullName = `${inst.userId?.firstName} ${inst.userId?.lastName}`.toLowerCase();
    const title = inst.title?.toLowerCase() || '';
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || title.includes(searchTerm.toLowerCase());
    const matchesSpecialty = specialtyFilter === 'all' || (inst.specialties && inst.specialties.includes(specialtyFilter));
    return matchesSearch && matchesSpecialty;
  }) || [];

  // Mock Sorting (top vs new)
  const topInstructors = [...filteredInstructors].sort((a: any, b: any) => {
    const ratingA = 4 + (((a.userId?.firstName.length || 0) % 10) / 10);
    const ratingB = 4 + (((b.userId?.firstName.length || 0) % 10) / 10);
    return ratingB - ratingA;
  });

  return (
    <div className="min-h-screen bg-[var(--neo-bg)] pb-20">
      {/* Hero Section */}
      <div className="bg-slate-900 py-20 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-purple-900/50 opacity-50 mix-blend-multiply"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">اساتید برتر</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            آموزش را از متخصصانی یاد بگیرید که تجربه دانشگاهی و تخصص حرفه‌ای در صنعت دارند.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-[var(--neo-border)] flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--neo-text-muted)] w-5 h-5" />
            <input
              type="text"
              placeholder="جستجوی نام، عنوان یا تخصص استاد..."
              className="w-full pl-4 pr-12 py-3 bg-[var(--neo-bg)] border border-[var(--neo-border)] rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="w-full md:w-64 flex-shrink-0 relative">
             <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--neo-text-muted)] w-5 h-5" />
             <select 
               className="w-full pl-4 pr-12 py-3 bg-[var(--neo-bg)] border border-[var(--neo-border)] rounded-xl text-[var(--neo-text-secondary)] outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
               value={specialtyFilter}
               onChange={e => setSpecialtyFilter(e.target.value)}
             >
               <option value="all">همه تخصص‌ها</option>
               {allSpecialties.map((spec: any, i) => (
                 <option key={i} value={spec}>{spec}</option>
               ))}
             </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {filteredInstructors.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-[var(--neo-border)] shadow-sm flex flex-col items-center">
            <Search className="w-10 h-10 text-gray-300 mb-4" />
            <p className="text-[var(--neo-text-main)] font-bold text-lg mb-1">استادی یافت نشد</p>
            <p className="text-[var(--neo-text-muted)] text-sm">با این فیلترها و کلمات جستجو نتیجه‌ای پیدا نشد.</p>
          </div>
        ) : (
          <>
            {/* Top Instructors Section */}
            {specialtyFilter === 'all' && searchTerm === '' && topInstructors.length >= 3 && (
              <div className="mb-16">
                 <h2 className="text-2xl font-bold text-[var(--neo-text-main)] mb-6 flex items-center gap-2">
                   <Award className="w-6 h-6 text-amber-500" />
                   اساتید برگزیده ماه
                 </h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {topInstructors.slice(0, 3).map((inst: any) => (
                      <InstructorCard key={inst._id} instructor={inst} featured />
                    ))}
                 </div>
              </div>
            )}
            
            {/* All Instructors */}
            <div>
               <h2 className="text-2xl font-bold text-[var(--neo-text-main)] mb-6 flex items-center gap-2">
                 <Users className="w-6 h-6 text-[var(--neo-primary)]" />
                 {searchTerm || specialtyFilter !== 'all' ? 'نتایج جستجو' : 'همه اساتید'}
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredInstructors.map((inst: any) => (
                    <InstructorCard key={inst._id} instructor={inst} />
                  ))}
               </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function InstructorCard({ instructor, featured = false }: { instructor: any, featured?: boolean }) {
  const { userId, title, avatar, specialties } = instructor;
  const fullName = `${userId?.firstName} ${userId?.lastName}`;
  const displayAvatar = avatar || `https://ui-avatars.com/api/?name=${userId?.firstName}+${userId?.lastName}&background=random`;
  
  // Consistent mock data
  const rating = instructor.rating || (4 + (((userId?.firstName.length || 0) % 10) / 10));
  const coursesCount = instructor.coursesCount || ((userId?.firstName.length || 5) + 2);
  const classesCount = instructor.classesCount || ((userId?.lastName.length || 3) + 1);
  const studentsCount = instructor.totalStudents || (coursesCount * 120 + classesCount * 15);

  return (
    <Link href={`/instructors/${userId?._id}`} className="block group h-full">
      <div className={`bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 relative overflow-hidden h-full flex flex-col ${featured ? 'border-2 border-amber-100' : 'border border-[var(--neo-border)]'}`}>
        {featured && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -translate-y-16 translate-x-16 z-0"></div>
        )}
        {!featured && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--neo-primary)]/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition duration-500 ease-out z-0"></div>
        )}
        
        <div className="relative z-10 flex gap-5 items-center mb-5">
          <div className="relative">
             <img src={displayAvatar} alt={fullName} className={`w-20 h-20 rounded-2xl object-cover shadow-md ${featured ? 'border-2 border-amber-200' : ''}`} />
             {featured && (
               <div className="absolute -top-2 -right-2 bg-amber-400 text-white rounded-full p-1 shadow-sm">
                 <Award className="w-4 h-4" />
               </div>
             )}
          </div>
          <div>
            <h3 className="font-bold text-lg text-[var(--neo-text-main)] group-hover:text-[var(--neo-primary)] transition">{fullName}</h3>
            <p className="text-sm text-[var(--neo-text-muted)] mt-1 line-clamp-1">{title}</p>
          </div>
        </div>

        {specialties && specialties.length > 0 && (
          <div className="relative z-10 mb-6 flex-grow">
            <div className="flex flex-wrap gap-1.5">
              {specialties.slice(0, 3).map((spec: string, i: number) => (
                <span key={i} className="text-xs font-medium text-blue-700 bg-[var(--neo-primary)]/5 px-2 py-1 rounded-md border border-blue-100">
                  {spec}
                </span>
              ))}
              {specialties.length > 3 && (
                <span className="text-xs font-medium text-[var(--neo-text-muted)] bg-[var(--neo-bg)] px-2 py-1 rounded-md border border-[var(--neo-border)]">
                  +{specialties.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="relative z-10 grid grid-cols-3 gap-2 pt-4 border-t border-gray-50 mt-auto text-center">
           <div className="flex flex-col items-center">
             <div className="flex items-center gap-1 text-amber-500 mb-1">
               <Star className="w-4 h-4 fill-current" />
               <span className="font-bold text-sm">{rating.toFixed(1)}</span>
             </div>
             <span className="text-xs text-[var(--neo-text-muted)]">امتیاز</span>
           </div>
           <div className="flex flex-col items-center border-r border-l border-[var(--neo-border)]">
             <div className="font-bold text-[var(--neo-text-secondary)] text-sm mb-1">{coursesCount}</div>
             <span className="text-xs text-[var(--neo-text-muted)]">دوره</span>
           </div>
           <div className="flex flex-col items-center">
             <div className="font-bold text-[var(--neo-text-secondary)] text-sm mb-1">{classesCount}</div>
             <span className="text-xs text-[var(--neo-text-muted)]">کلاس</span>
           </div>
        </div>
      </div>
    </Link>
  );
}
