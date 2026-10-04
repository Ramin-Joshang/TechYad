import Link from 'next/link';
import { Course } from '../api/home.api';
import { Star, Clock, Users, BookOpen } from 'lucide-react';

interface Props {
  title: string;
  description: string;
  courses: Course[];
  viewAllLink: string;
}

export function CourseGrid({ title, description, courses, viewAllLink }: Props) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12 text-right">
          <div className="max-w-2xl text-right">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4 text-right">{title}</h2>
            <p className="text-sm sm:text-base text-gray-600 text-right">{description}</p>
          </div>
          <Link 
            href={viewAllLink}
            className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700 transition text-sm self-start sm:self-auto shrink-0"
          >
            <span>مشاهده همه</span>
            <svg className="w-4 h-4 mr-1.5 rotate-180" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-shadow group flex flex-col h-full">
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={course.coverImage} 
                  alt={course.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-gray-900">
                  {course.level}
                </div>
              </div>
              
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex items-center text-yellow-500 text-sm font-bold">
                    <Star className="w-4 h-4 fill-current mr-1" />
                    {course.rating}
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="flex items-center text-gray-500 text-sm">
                    <Users className="w-4 h-4 mr-1" />
                    {course.studentsCount.toLocaleString('fa-IR')} دانشجو
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                  <Link href={`/courses/${course.slug}`}>
                    {course.title}
                  </Link>
                </h3>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 ml-1" />
                    {course.duration}
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={course.instructorAvatar} alt={course.instructor} className="w-8 h-8 rounded-full object-cover" />
                    <span className="text-sm font-medium text-gray-700">{course.instructor}</span>
                  </div>
                  
                  <div className="text-left flex flex-col items-end">
                    {course.originalPrice ? (
                      <span className="text-xs text-gray-400 line-through">
                        {course.originalPrice.toLocaleString('fa-IR')}
                      </span>
                    ) : null}
                    <span className={`font-bold ${course.price === 0 ? 'text-green-600' : 'text-blue-600'}`}>
                      {course.price === 0 ? 'رایگان' : `${course.price.toLocaleString('fa-IR')} تومان`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
