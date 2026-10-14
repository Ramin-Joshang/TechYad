import { ClassCard } from '@/components/classes/ClassCard';
import { Video, MapPin } from 'lucide-react';

interface Props {
  onlineClasses: any[];
  inPersonClasses: any[];
}

export function ClassesSection({ onlineClasses = [], inPersonClasses = [] }: Props) {
  if ((!onlineClasses || onlineClasses.length === 0) && (!inPersonClasses || inPersonClasses.length === 0)) {
    return null;
  }

  return (
    <section className="py-20 bg-[var(--neo-bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-black text-gray-900 mb-4">کلاس‌های تعاملی و حضوری</h2>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            برای یادگیری عمیق‌تر، در کلاس‌های زنده آنلاین یا کارگاه‌های حضوری ما شرکت کنید. ظرفیت این کلاس‌ها محدود است.
          </p>
        </div>

        {/* Online Classes Grid */}
        {onlineClasses.length > 0 && (
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shadow-2xs">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">کلاس‌های آنلاین و زنده (Live)</h3>
                <p className="text-xs text-gray-500">ارتباط مستقیم با استاد، پرسش و پاسخ لحظه‌ای و حل تمرین</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {onlineClasses.map((cls: any) => (
                <ClassCard key={cls._id || cls.id} cls={cls} />
              ))}
            </div>
          </div>
        )}

        {/* In-Person Classes Grid */}
        {inPersonClasses.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shadow-2xs">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">کارگاه‌ها و کلاس‌های حضوری</h3>
                <p className="text-xs text-gray-500">یادگیری عملی، کار تیمی و منتورینگ در محیط فیزیکی</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {inPersonClasses.map((cls: any) => (
                <ClassCard key={cls._id || cls.id} cls={cls} />
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
