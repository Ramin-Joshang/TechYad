'use client';

import Link from 'next/link';
import { Search, Home, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="relative mb-8">
          <h1 className="text-9xl font-black text-gray-200">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white p-4 rounded-full shadow-lg text-blue-600">
              <Search className="w-10 h-10" />
            </div>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-4">صفحه مورد نظر یافت نشد</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          متاسفانه صفحه‌ای که به دنبال آن هستید وجود ندارد یا آدرس آن تغییر کرده است.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition">
            <Home className="w-5 h-5" />
            صفحه اصلی
          </Link>
          <button onClick={() => router.back()} className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition">
            <ArrowRight className="w-5 h-5" />
            بازگشت
          </button>
        </div>
      </div>
    </div>
  );
}
