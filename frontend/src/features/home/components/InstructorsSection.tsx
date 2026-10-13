import { Instructor } from '../api/home.api';
import { Star, Users, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { getImageUrl, handleImageError } from '@/lib/utils';

interface Props {
  instructors: Instructor[];
}

export function InstructorsSection({ instructors }: Props) {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">اساتید برتر تک‌یاد</h2>
          <p className="text-gray-600">
            یادگیری از بهترین‌ها؛ اساتید ما از متخصصین برجسته صنعت هستند که تجربه عملی خود را به شما منتقل می‌کنند.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {instructors.map((instructor) => (
            <div key={instructor.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition text-center group">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <img 
                  src={getImageUrl(instructor.avatar, 'avatar', instructor.name)} 
                  onError={(e) => handleImageError(e, 'avatar', instructor.name)}
                  alt={instructor.name} 
                  className="w-full h-full object-cover rounded-full border-4 border-white shadow-md group-hover:scale-105 transition-transform"
                />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  {instructor.rating}
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-1">{instructor.name}</h3>
              <p className="text-sm text-blue-600 font-medium mb-4">{instructor.specialty}</p>
              
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mb-6">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{instructor.students.toLocaleString('fa-IR')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <PlayCircle className="w-4 h-4" />
                  <span>{instructor.courses.toLocaleString('fa-IR')} دوره</span>
                </div>
              </div>
              
              <Link 
                href={`/instructors/${encodeURIComponent(instructor.slug || instructor.id)}`}
                className="block w-full py-2 bg-gray-50 text-gray-700 font-medium rounded-xl group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors"
              >
                مشاهده پروفایل
              </Link>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Link href="/instructors" className="inline-flex items-center justify-center px-6 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition">
            مشاهده همه اساتید
          </Link>
        </div>
      </div>
    </section>
  );
}
