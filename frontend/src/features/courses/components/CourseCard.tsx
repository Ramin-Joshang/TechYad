import Link from 'next/link';
import { Course } from '../api/courses.api';
import { User, Clock, Star, PlayCircle } from 'lucide-react';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const isFree = course.price === 0;

  return (
    <Link href={`/courses/${course.slug}`} className="group flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Thumbnail Placeholder */}
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <PlayCircle className="w-12 h-12" />
          </div>
        )}
        
        {/* Category Badge */}
        {course.categoryId && (
          <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-full">
            {course.categoryId.name}
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 text-lg line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors">
          {course.title}
        </h3>

        <div className="mt-auto">
          {/* Instructors */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex -space-x-2 -space-x-reverse">
              {course.instructors?.slice(0, 2).map((instructor, i) => (
                <div key={instructor._id} className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-xs font-bold text-blue-600 z-10 overflow-hidden shadow-2xs">
                  {instructor.personnelPhoto || instructor.avatar ? (
                    <img src={instructor.personnelPhoto || instructor.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    `${instructor.firstName.charAt(0)}${instructor.lastName.charAt(0)}`
                  )}
                </div>
              ))}
            </div>
            <span className="text-sm text-gray-500">
              {course.instructors?.map(i => `${i.firstName} ${i.lastName}`).join('، ')}
            </span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-gray-500 text-sm">
              <Clock className="w-4 h-4" />
              <span>--</span>
            </div>
            
            <div className="font-bold text-lg">
              {isFree ? (
                <span className="text-green-600">رایگان</span>
              ) : (
                <span className="text-blue-600">{course.price.toLocaleString()} <span className="text-sm font-normal text-gray-500">تومان</span></span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
