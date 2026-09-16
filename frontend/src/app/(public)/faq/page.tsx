'use client';

import { useState } from 'react';
import { Search, ChevronDown, MessageSquare, PhoneCall, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { generalApi } from '@/features/general/api/general.api';

const FAQ_CATEGORIES = [
  { id: 'all', label: 'همه سوالات' },
  { id: 'register', label: 'ثبت‌نام' },
  { id: 'courses', label: 'دوره‌ها' },
  { id: 'payment', label: 'پرداخت' },
  { id: 'online', label: 'کلاس‌های آنلاین' },
  { id: 'offline', label: 'کلاس‌های حضوری' },
  { id: 'support', label: 'پشتیبانی' }
];

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openItem, setOpenItem] = useState<string | null>(null);

  const { data: faqs, isLoading } = useQuery({
    queryKey: ['faqs'],
    queryFn: async () => {
      const res = await generalApi.getFaqs();
      return res.data?.data || res.data; // Mongoose models have _id
    }
  });

  const toggleItem = (id: string) => {
    setOpenItem(openItem === id ? null : id);
  };

  const filteredFaqs = (faqs || []).filter((faq: any) => {
    const matchesSearch = faq.question?.includes(searchTerm) || faq.answer?.includes(searchTerm);
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="bg-gray-50 min-h-screen pb-20">
      {/* Hero Section */}
      <div className="bg-slate-900 pt-24 pb-32 text-center text-white px-4">
        <h1 className="text-3xl md:text-5xl font-bold mb-6">سوالات متداول</h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-10">
          پاسخ پرتکرارترین سوالات دانشجویان تک‌یاد را در اینجا بخوانید.
        </p>
        
        {/* Search */}
        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
          <input 
            type="text" 
            placeholder="سوال خود را جستجو کنید..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white text-gray-900 rounded-2xl pl-6 pr-14 py-4 text-lg focus:outline-none focus:ring-4 focus:ring-blue-500/50 shadow-xl"
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Categories */}
          <div className="flex overflow-x-auto border-b border-gray-100 p-2 hide-scrollbar">
            {FAQ_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`whitespace-nowrap px-6 py-4 font-bold text-sm transition-colors border-b-2 ${
                  activeCategory === cat.id 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* FAQ List */}
          <div className="p-6 md:p-10">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
              </div>
            ) : filteredFaqs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                نتیجه‌ای برای جستجوی شما یافت نشد.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFaqs.map((faq: any) => (
                  <div 
                    key={faq._id} 
                    className={`border rounded-2xl transition-all duration-300 overflow-hidden ${
                      openItem === faq._id ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200 bg-white hover:border-blue-200'
                    }`}
                  >
                    <button 
                      onClick={() => toggleItem(faq._id)}
                      className="w-full flex items-center justify-between p-5 text-right focus:outline-none"
                    >
                      <span className={`font-bold pr-2 ${openItem === faq._id ? 'text-blue-700' : 'text-gray-800'}`}>
                        {faq.question}
                      </span>
                      <ChevronDown className={`w-5 h-5 transition-transform duration-300 shrink-0 ${openItem === faq._id ? 'rotate-180 text-blue-600' : 'text-gray-400'}`} />
                    </button>
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        openItem === faq._id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="p-5 pt-0 text-gray-600 leading-relaxed border-t border-transparent">
                        <div className="pl-6 border-r-2 border-blue-200 pr-4 mt-2">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Support CTA */}
      <div className="max-w-4xl mx-auto px-4 mt-16 text-center">
        <div className="bg-blue-600 rounded-3xl p-8 sm:p-12 text-white shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/texture/800/400')] opacity-10 mix-blend-overlay"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-4">جواب سؤال خود را پیدا نکردید؟</h2>
            <p className="text-blue-100 mb-8 max-w-lg leading-relaxed">
              تیم پشتیبانی تک‌یاد آماده پاسخگویی به تمامی سوالات شماست. با ما تماس بگیرید یا تیکت ارسال کنید.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/contact" className="bg-white text-blue-600 font-bold px-8 py-3 rounded-xl hover:bg-gray-50 transition shadow-md flex items-center justify-center gap-2">
                <PhoneCall className="w-5 h-5" /> تماس با پشتیبانی
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
