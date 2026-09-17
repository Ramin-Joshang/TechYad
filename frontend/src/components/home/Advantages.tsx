import { Shield, Clock, Video, Award } from "lucide-react";

export function Advantages() {
  const items = [
    { icon: Shield, title: "تضمین کیفیت", desc: "بازگشت وجه در صورت عدم رضایت" },
    { icon: Video, title: "دسترسی مادام‌العمر", desc: "آپدیت رایگان دوره‌های خریداری شده" },
    { icon: Clock, title: "پشتیبانی ۲۴/۷", desc: "رفع اشکال توسط اساتید و منتورها" },
    { icon: Award, title: "مدرک معتبر", desc: "ارائه گواهی پایان دوره دوزبانه" },
  ];

  return (
    <section className="py-24 bg-[var(--neo-primary)] text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
      
      {/* Node decorations */}
      <div className="absolute top-10 right-10 w-32 h-32 border border-white/20 rounded-full"></div>
      <div className="absolute -bottom-10 -left-10 w-64 h-64 border border-white/10 rounded-full"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center text-center p-6 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl transition duration-300 group backdrop-blur-sm">
              <div className="w-16 h-16 bg-white text-[var(--neo-primary)] rounded-2xl flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 transition-transform">
                <item.icon className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-xl mb-2 text-white">{item.title}</h3>
              <p className="text-white/80 text-sm font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
