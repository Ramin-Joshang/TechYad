import { Testimonial } from '../api/home.api';
import { Quote } from 'lucide-react';
import { getImageUrl, handleImageError } from '@/lib/utils';

interface Props {
  testimonials: Testimonial[];
}

export function TestimonialsSection({ testimonials }: Props) {
  return (
    <section className="py-20 bg-blue-600 relative overflow-hidden">
      {/* Background Patterns */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-white opacity-5 rounded-full -ml-20 -mb-20"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">نظرات دانشجویان تک‌یاد</h2>
          <p className="text-blue-100">
            داستان موفقیت دانشجویان ما بهترین انگیزه برای شروع مسیر یادگیری شماست.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-3xl p-8 relative shadow-xl shadow-blue-900/20">
              <Quote className="absolute top-6 left-6 w-12 h-12 text-blue-50 opacity-50 rotate-180" />
              
              <p className="text-gray-700 leading-relaxed mb-8 relative z-10">
                "{testimonial.text}"
              </p>
              
              <div className="flex items-center gap-4">
                <img 
                  src={getImageUrl(testimonial.avatar, 'avatar', testimonial.author)} 
                  alt={testimonial.author} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-100"
                  onError={(e) => handleImageError(e, 'avatar', testimonial.author)}
                />
                <div>
                  <h4 className="font-bold text-gray-900">{testimonial.author}</h4>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
