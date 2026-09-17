import { Shield, Clock, Video, Award } from "lucide-react";

export function Advantages() {
  const items = [
    { icon: Shield, title: "تضمین کیفیت", desc: "بازگشت وجه در صورت عدم رضایت" },
    { icon: Video, title: "دسترسی مادام‌العمر", desc: "آپدیت رایگان دوره‌های خریداری شده" },
    { icon: Clock, title: "پشتیبانی ۲۴/۷", desc: "رفع اشکال توسط اساتید و منتورها" },
    { icon: Award, title: "مدرک معتبر", desc: "ارائه گواهی پایان دوره دوزبانه" },
  ];

  return (
    <section className="py-24 bg-[var(--neo-surface-2)] text-white relative border-b border-[var(--neo-border)]">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[var(--neo-primary)] via-transparent to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center text-center p-6 border border-transparent hover:border-[var(--neo-border)] rounded-2xl transition duration-300 group">
              <div className="w-16 h-16 border border-[var(--neo-border)] bg-[var(--neo-surface)] rounded-2xl flex items-center justify-center mb-6 group-hover:border-[var(--neo-secondary)] transition-colors">
                <item.icon className="w-8 h-8 text-[var(--neo-muted)] group-hover:text-[var(--neo-secondary)] transition-colors" />
              </div>
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-[var(--neo-muted)] text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
