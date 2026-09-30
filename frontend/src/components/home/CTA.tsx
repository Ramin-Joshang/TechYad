'use client';

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { superAdminApi } from "@/features/admin/api/super-admin.api";
import { ArrowLeft } from "lucide-react";

export function CTA() {
  const { data: publicSettings } = useQuery({
    queryKey: ['publicSettings'],
    queryFn: () => superAdminApi.getPublicSettings().then(res => res.data),
    staleTime: 1000 * 60 * 5,
  });

  const ctaTitle = publicSettings?.ctaTitle || "مسیر رشد شما از همینجا شروع می‌شود";
  const ctaSubtitle = publicSettings?.ctaSubtitle || "همین حالا به جمع هزاران دانشجوی تک‌یاد بپیوندید و با یادگیری مهارت‌های جدید، آینده شغلی خود را تضمین کنید.";
  const ctaButtonText = publicSettings?.ctaButtonText || "ثبت‌نام و شروع";
  const ctaButtonLink = publicSettings?.ctaButtonLink || "/register";

  return (
    <section className="py-32 bg-[var(--neo-surface)] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--neo-primary)]/5 to-transparent pointer-events-none"></div>
      
      {/* Knowledge Nodes Decorative */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl opacity-30 pointer-events-none">
         <svg width="100%" height="400" xmlns="http://www.w3.org/2000/svg">
            <line x1="20%" y1="20%" x2="50%" y2="50%" stroke="var(--neo-secondary)" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="50%" y1="50%" x2="80%" y2="80%" stroke="var(--neo-primary)" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="20%" cy="20%" r="4" fill="var(--neo-secondary)" />
            <circle cx="50%" cy="50%" r="6" fill="var(--neo-accent)" />
            <circle cx="80%" cy="80%" r="4" fill="var(--neo-primary)" />
         </svg>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h2 className="text-4xl md:text-5xl font-black text-[var(--neo-text-main)] mb-8 tracking-tight">
          {ctaTitle}
        </h2>
        <p className="text-xl text-[var(--neo-text-secondary)] mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
          {ctaSubtitle}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href={ctaButtonLink} className="inline-flex justify-center items-center gap-2 px-10 py-4 bg-[var(--neo-primary)] text-white hover:bg-opacity-90 rounded-xl font-bold transition-all shadow-lg shadow-[var(--neo-primary)]/30 text-lg">
            {ctaButtonText}
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Link href="/courses" className="inline-flex justify-center items-center gap-2 px-10 py-4 bg-[var(--neo-surface-2)] text-[var(--neo-text-main)] hover:bg-[var(--neo-border)] rounded-xl font-bold transition-all text-lg">
            مشاهده دوره‌ها
          </Link>
        </div>
      </div>
    </section>
  );
}
