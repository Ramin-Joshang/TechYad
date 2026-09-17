const fs = require('fs');
const path = require('path');

const write = (file, content) => {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
};

write('frontend/src/app/globals.css', `@import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
@import "tailwindcss";

:root {
  --neo-bg: #F7F5FF;
  --neo-surface: #FFFFFF;
  --neo-surface-2: #F0EDFA;
  --neo-primary: #6D4AFF;
  --neo-secondary: #19B8D8;
  --neo-accent: #B7D94C;
  
  --neo-text-main: #171522;
  --neo-text-secondary: #5F5A6E;
  --neo-text-muted: #898497;
  
  --neo-border: #E6E1F0;
  
  --neo-success: #38A169;
  --neo-warning: #D69E2E;
  --neo-error: #E05252;
  
  --background: var(--neo-bg);
  --foreground: var(--neo-text-main);
}

@theme inline {
  --color-neo-bg: var(--neo-bg);
  --color-neo-surface: var(--neo-surface);
  --color-neo-surface-2: var(--neo-surface-2);
  --color-neo-primary: var(--neo-primary);
  --color-neo-secondary: var(--neo-secondary);
  --color-neo-accent: var(--neo-accent);
  --color-neo-text-main: var(--neo-text-main);
  --color-neo-text-secondary: var(--neo-text-secondary);
  --color-neo-text-muted: var(--neo-text-muted);
  --color-neo-border: var(--neo-border);
  --color-neo-success: var(--neo-success);
  --color-neo-warning: var(--neo-warning);
  --color-neo-error: var(--neo-error);
}

body {
  background-color: var(--neo-bg);
  color: var(--neo-text-main);
  font-family: 'Vazirmatn', sans-serif;
}

.font-en {
  font-family: 'Inter', sans-serif;
}

.neo-gradient-text {
  background: linear-gradient(to right, var(--neo-primary), var(--neo-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.neo-gradient-bg {
  background: linear-gradient(to right, var(--neo-primary), var(--neo-secondary));
}

.neo-card {
  background: var(--neo-surface);
  border: 1px solid var(--neo-border);
  box-shadow: 0 4px 20px -2px rgba(109, 74, 255, 0.04);
  transition: all 0.3s ease;
  border-radius: 16px;
}
.neo-card:hover {
  transform: translateY(-3px);
  border-color: rgba(109, 74, 255, 0.3);
  box-shadow: 0 8px 30px -4px rgba(109, 74, 255, 0.12);
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: var(--neo-bg);
}
::-webkit-scrollbar-thumb {
  background: var(--neo-border);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--neo-text-muted);
}
`);

write('frontend/src/components/layout/Navbar.tsx', `'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { LogOut, User, Search, ShoppingCart, Menu, X, LayoutDashboard } from 'lucide-react';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const NAV_LINKS = [
    { name: 'دوره‌ها', href: '/courses' },
    { name: 'کلاس‌ها', href: '/classes' },
    { name: 'اساتید', href: '/instructors' },
    { name: 'وبلاگ', href: '/blog' },
    { name: 'درباره ما', href: '/about' },
    { name: 'تماس با ما', href: '/contact' },
  ];

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/student') || pathname?.startsWith('/instructor') || pathname?.startsWith('/profile')) {
    return null;
  }

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-[var(--neo-border)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4 md:gap-8">
            <button 
              className="md:hidden text-[var(--neo-text-muted)] hover:text-[var(--neo-primary)] transition"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-[var(--neo-primary)] flex items-center justify-center relative overflow-hidden">
                 <div className="w-2 h-2 bg-[var(--neo-secondary)] rounded-full"></div>
              </div>
              <span className="font-bold text-xl text-[var(--neo-text-main)] hidden sm:block tracking-tight">تک‌یاد</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[var(--neo-text-secondary)]">
              {NAV_LINKS.map(link => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className={\`transition \${pathname === link.href ? 'text-[var(--neo-primary)] font-bold' : 'hover:text-[var(--neo-primary)]'}\`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/search" className="text-[var(--neo-text-muted)] hover:text-[var(--neo-primary)] transition ml-1 sm:ml-2">
              <Search className="w-5 h-5" />
            </Link>
            
            <Link href="/cart" className="text-[var(--neo-text-muted)] hover:text-[var(--neo-primary)] transition relative">
              <ShoppingCart className="w-5 h-5" />
            </Link>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-px h-6 bg-[var(--neo-border)] mx-1 hidden sm:block"></div>
                <Link href={user.role === 'student' ? '/student' : user.role === 'instructor' ? '/instructor' : '/admin'} className="flex items-center gap-2 p-1.5 pr-3 rounded-full border border-[var(--neo-border)] hover:bg-[var(--neo-surface-2)] transition cursor-pointer">
                  <span className="text-sm font-medium text-[var(--neo-text-main)] hidden sm:block">{user.firstName}</span>
                  <div className="w-8 h-8 rounded-full bg-[var(--neo-surface-2)] text-[var(--neo-primary)] flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.firstName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link href="/login" className="text-sm font-medium text-[var(--neo-text-secondary)] hover:text-[var(--neo-primary)] transition">
                  ورود
                </Link>
                <Link href="/register" className="text-sm font-medium px-4 py-2 bg-[var(--neo-primary)] text-white rounded-xl hover:bg-opacity-90 transition shadow-sm">
                  ثبت‌نام
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-sm" 
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="fixed top-0 right-0 h-full w-64 bg-white z-50 shadow-2xl md:hidden flex flex-col transform transition-transform duration-300 ease-in-out">
            <div className="p-4 border-b border-[var(--neo-border)] flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="w-8 h-8 rounded-full border-2 border-[var(--neo-primary)] flex items-center justify-center relative overflow-hidden">
                   <div className="w-2 h-2 bg-[var(--neo-secondary)] rounded-full"></div>
                </div>
                <span className="font-bold text-xl text-[var(--neo-text-main)] tracking-tight">تک‌یاد</span>
              </Link>
              <button 
                className="p-2 text-[var(--neo-text-muted)] hover:text-[var(--neo-error)] transition rounded-full hover:bg-[var(--neo-surface-2)]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {isAuthenticated && user && (
              <div className="p-4 border-b border-[var(--neo-border)] bg-[var(--neo-surface-2)]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-white text-[var(--neo-primary)] flex items-center justify-center font-bold text-lg overflow-hidden shrink-0 border border-[var(--neo-border)]">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.firstName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-[var(--neo-text-main)]">{user.firstName} {user.lastName}</div>
                    <div className="text-xs text-[var(--neo-text-secondary)]">{user.email}</div>
                  </div>
                </div>
                <Link 
                  href={user.role === 'student' ? '/student' : user.role === 'instructor' ? '/instructor' : '/admin'} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-[var(--neo-primary)] text-white rounded-xl text-sm font-bold shadow-sm"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  پنل کاربری
                </Link>
              </div>
            )}

            <div className="flex-1 overflow-y-auto py-4">
              <nav className="flex flex-col px-3 space-y-1">
                {NAV_LINKS.map(link => (
                  <Link 
                    key={link.href} 
                    href={link.href} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={\`block px-4 py-3 rounded-xl text-sm font-bold transition \${
                      pathname === link.href ? 'bg-[var(--neo-primary)]/10 text-[var(--neo-primary)]' : 'text-[var(--neo-text-secondary)] hover:bg-[var(--neo-surface-2)] hover:text-[var(--neo-primary)]'
                    }\`}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>
            
            {isAuthenticated && user && (
              <div className="p-4 border-t border-[var(--neo-border)]">
                <button 
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }} 
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[var(--neo-error)] hover:bg-red-50 rounded-xl transition font-bold text-sm"
                >
                  <LogOut className="w-5 h-5" />
                  خروج
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </header>
  );
}
`);

write('frontend/src/components/home/Hero.tsx', `import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-[var(--neo-bg)] border-b border-[var(--neo-border)] pt-16">
      {/* Knowledge Network Background (Light CSS based) */}
      <div className="absolute inset-0 z-0 opacity-60 pointer-events-none">
         <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-light" width="100" height="100" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="var(--neo-border)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-light)" />
            
            {/* Glowing nodes */}
            <circle cx="20%" cy="30%" r="5" fill="var(--neo-primary)" className="animate-pulse" />
            <circle cx="75%" cy="60%" r="4" fill="var(--neo-secondary)" className="animate-pulse" style={{ animationDelay: '1s' }} />
            <circle cx="85%" cy="20%" r="6" fill="var(--neo-accent)" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
            
            <line x1="20%" y1="30%" x2="75%" y2="60%" stroke="var(--neo-primary)" strokeWidth="1" strokeOpacity="0.2" />
            <line x1="75%" y1="60%" x2="85%" y2="20%" stroke="var(--neo-secondary)" strokeWidth="1" strokeOpacity="0.2" />
         </svg>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[var(--neo-primary)]/10 to-[var(--neo-secondary)]/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          <div className="text-right max-w-2xl">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-[var(--neo-border)] bg-white/80 backdrop-blur-md mb-8 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--neo-primary)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--neo-primary)]"></span>
              </span>
              <span className="text-sm font-medium text-[var(--neo-text-main)]">
                 پلتفرم یکپارچه آموزش آکادمیک و تخصصی
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-[var(--neo-text-main)] mb-6 leading-[1.15]">
              یادگیری برای<br/>
              آینده‌ای که <span className="neo-gradient-text">می‌سازی.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-[var(--neo-text-secondary)] mb-10 leading-relaxed font-medium">
              دروس دانشگاهی، آموزش‌های تخصصی و کلاس‌های حضوری؛ با اساتیدی که واقعاً می‌دانند چه چیزی را باید آموزش دهند. مسیر یادگیری خودت را پیدا کن.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/courses" className="inline-flex justify-center items-center gap-2 px-8 py-4 bg-[var(--neo-primary)] text-white hover:bg-opacity-90 rounded-xl font-bold transition shadow-lg shadow-[var(--neo-primary)]/25 text-lg">
                شروع یادگیری
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <Link href="/courses?free=true" className="inline-flex justify-center items-center gap-2 px-8 py-4 bg-white text-[var(--neo-text-main)] border border-[var(--neo-border)] hover:border-[var(--neo-primary)] hover:text-[var(--neo-primary)] rounded-xl font-bold transition text-lg shadow-sm">
                دوره‌های رایگان
              </Link>
            </div>
          </div>
          
          <div className="hidden lg:block relative h-[600px] w-full">
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-[400px] h-[400px]">
                   <div className="absolute top-0 right-10 px-5 py-2 bg-white border border-[var(--neo-border)] rounded-full text-sm font-en text-[var(--neo-secondary)] font-semibold shadow-sm animate-bounce" style={{ animationDuration: '4s' }}>AI Models</div>
                   <div className="absolute bottom-10 left-0 px-5 py-2 bg-white border border-[var(--neo-border)] rounded-full text-sm font-en text-[var(--neo-primary)] font-semibold shadow-sm animate-bounce" style={{ animationDuration: '5s' }}>Calculus</div>
                   <div className="absolute top-1/2 left-10 px-5 py-2 bg-white border border-[var(--neo-border)] rounded-full text-sm font-en text-[var(--neo-success)] font-semibold shadow-sm animate-bounce" style={{ animationDuration: '4.5s' }}>Python</div>
                   <div className="absolute bottom-1/3 right-0 px-5 py-2 bg-white border border-[var(--neo-border)] rounded-full text-sm font-en text-[var(--neo-warning)] font-semibold shadow-sm animate-bounce" style={{ animationDuration: '6s' }}>Mechanics</div>
                   <div className="absolute top-1/4 left-1/4 px-5 py-2 bg-white border border-[var(--neo-border)] rounded-full text-sm font-en text-[#FF6B6B] font-semibold shadow-sm animate-bounce" style={{ animationDuration: '3.5s' }}>MATLAB</div>
                   
                   {/* Center node */}
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-[var(--neo-border)] bg-white flex items-center justify-center shadow-xl shadow-[var(--neo-primary)]/10 z-20">
                     <span className="font-black tracking-widest text-lg neo-gradient-text text-center">شبکه<br/>دانش</span>
                   </div>
                   
                   {/* Connection lines */}
                   <svg className="absolute inset-0 w-full h-full -z-10 opacity-40">
                     <line x1="50%" y1="50%" x2="10%" y2="20%" stroke="var(--neo-primary)" strokeWidth="1.5" strokeDasharray="4 4" />
                     <line x1="50%" y1="50%" x2="90%" y2="80%" stroke="var(--neo-secondary)" strokeWidth="1.5" strokeDasharray="4 4" />
                     <line x1="50%" y1="50%" x2="20%" y2="80%" stroke="var(--neo-primary)" strokeWidth="1.5" strokeDasharray="4 4" />
                     <line x1="50%" y1="50%" x2="80%" y2="20%" stroke="var(--neo-secondary)" strokeWidth="1.5" strokeDasharray="4 4" />
                   </svg>
                </div>
             </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
`);

write('frontend/src/components/home/Categories.tsx', `import Link from "next/link";
import { Hexagon } from "lucide-react";

export function Categories({ data = [] }: { data: any[] }) {
  if (!data?.length) return null;
  
  return (
    <section className="py-24 bg-[var(--neo-surface-2)] relative border-b border-[var(--neo-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-px bg-[var(--neo-primary)]"></span>
              <span className="text-[var(--neo-primary)] font-bold tracking-widest text-sm uppercase">مسیرهای یادگیری</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[var(--neo-text-main)]">گسترش مرزهای دانش</h2>
          </div>
          <Link href="/courses" className="text-[var(--neo-text-secondary)] hover:text-[var(--neo-primary)] transition font-medium flex items-center gap-2 pb-1 border-b border-transparent hover:border-[var(--neo-primary)]">
            مشاهده همه دسته‌بندی‌ها
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.map((cat: any, index: number) => (
            <Link key={cat._id} href={\`/courses?category=\${cat.slug}\`} className="group relative overflow-hidden bg-white p-8 rounded-[20px] border border-[var(--neo-border)] hover:border-[var(--neo-primary)]/30 transition-all duration-300 flex flex-col hover:-translate-y-1 shadow-sm hover:shadow-lg hover:shadow-[var(--neo-primary)]/5">
              
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-2xl border border-[var(--neo-border)] bg-[var(--neo-bg)] text-[var(--neo-primary)] flex items-center justify-center group-hover:bg-[var(--neo-primary)] group-hover:text-white transition-colors duration-300">
                  <Hexagon className="w-7 h-7" />
                </div>
                <span className="text-[var(--neo-border)] font-en text-4xl font-black opacity-50 group-hover:text-[var(--neo-primary)]/10 transition-colors">
                  {(index + 1).toString().padStart(2, '0')}
                </span>
              </div>
              
              <h3 className="font-bold text-[var(--neo-text-main)] mb-2 text-xl relative z-10">{cat.name}</h3>
              <p className="text-sm text-[var(--neo-text-secondary)] line-clamp-2 relative z-10">{cat.description || "آشنایی با مفاهیم و تکنولوژی‌های روز"}</p>
              
              <div className="mt-6 pt-4 border-t border-[var(--neo-border)] flex items-center justify-between text-sm text-[var(--neo-text-secondary)] group-hover:text-[var(--neo-primary)] transition-colors relative z-10 font-medium">
                <span>شروع مسیر</span>
                <span>←</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
`);

write('frontend/src/components/home/CourseList.tsx', `import Link from "next/link";
import { Clock, Users, PlayCircle, Star } from "lucide-react";

export function CourseList({ title, data = [], sectionName = "Explore" }: { title: string, data: any[], sectionName?: string }) {
  if (!data?.length) return null;
  
  return (
    <section className="py-20 bg-[var(--neo-bg)] border-b border-[var(--neo-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
             <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-px bg-[var(--neo-primary)]"></span>
              <span className="text-[var(--neo-primary)] font-bold tracking-widest text-sm uppercase">{sectionName}</span>
            </div>
            <h2 className="text-3xl font-black text-[var(--neo-text-main)]">{title}</h2>
          </div>
          <Link href="/courses" className="text-[var(--neo-text-secondary)] hover:text-[var(--neo-primary)] transition font-medium flex items-center gap-2 pb-1 border-b border-transparent hover:border-[var(--neo-primary)]">
            مشاهده همه
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.map((course: any) => (
            <Link key={course._id} href={\`/courses/\${course.slug}\`} className="neo-card group flex flex-col overflow-hidden relative bg-white">
              <div className="relative aspect-[16/10] overflow-hidden bg-[var(--neo-surface-2)]">
                <img src={course.coverImage || course.thumbnail || \`https://picsum.photos/seed/\${course.slug}/400/250\`} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out" />
                
                {/* Overlays */}
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                  {course.price === 0 && (
                    <div className="bg-[var(--neo-accent)] text-[var(--neo-text-main)] text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      رایگان
                    </div>
                  )}
                  {course.type === 'in-person' && (
                     <div className="bg-[var(--neo-surface)]/90 backdrop-blur text-[var(--neo-text-main)] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--neo-primary)] animate-pulse"></span> حضوری
                    </div>
                  )}
                  {course.type === 'online-class' && (
                     <div className="bg-[var(--neo-surface)]/90 backdrop-blur text-[var(--neo-error)] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--neo-error)] animate-pulse"></span> زنده (Live)
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-3">
                   <div className="text-[var(--neo-text-muted)] text-xs font-medium bg-[var(--neo-surface-2)] px-2 py-1 rounded">
                      {course.category?.name || 'عمومی'}
                   </div>
                   <div className="flex items-center gap-1 text-[var(--neo-warning)] font-en text-xs font-bold">
                     <Star className="w-3.5 h-3.5 fill-current" />
                     {course.averageRating ? course.averageRating.toFixed(1) : "4.9"}
                   </div>
                </div>
                
                <h3 className="font-bold text-[var(--neo-text-main)] mb-2 line-clamp-2 leading-relaxed group-hover:text-[var(--neo-primary)] transition-colors">{course.title}</h3>
                
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full bg-[var(--neo-surface-2)] flex items-center justify-center text-[var(--neo-primary)] overflow-hidden">
                    {course.instructor?.avatar || course.instructors?.[0]?.avatar ? (
                      <img src={course.instructor?.avatar || course.instructors?.[0]?.avatar} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <Users className="w-3 h-3" />
                    )}
                  </div>
                  <span className="text-sm text-[var(--neo-text-secondary)] font-medium">
                    {course.instructor?.name || course.instructor || (course.instructors?.[0]?.firstName ? \`\${course.instructors[0].firstName} \${course.instructors[0].lastName}\` : 'استاد مدعو')}
                  </span>
                </div>
                
                <div className="mt-auto pt-4 border-t border-[var(--neo-border)] flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-[var(--neo-text-muted)]">
                    <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> {typeof course.duration === 'string' ? course.duration : course.totalDuration ? Math.round(course.totalDuration / 60) + ' ساعت' : '0 ساعت'}</div>
                    <div className="flex items-center gap-1"><PlayCircle className="w-3.5 h-3.5"/> {course.totalLessons || 0} جلسه</div>
                  </div>
                  <div className="font-bold text-[var(--neo-primary)]">
                    {course.price === 0 ? "رایگان" : \`\${course.price.toLocaleString()} تومان\`}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
`);

write('frontend/src/components/home/InstructorGrid.tsx', `import Link from "next/link";
import { Star, User, GraduationCap } from "lucide-react";

export function InstructorGrid({ data = [] }: { data: any[] }) {
  if (!data?.length) return null;
  
  return (
    <section className="py-24 bg-white border-b border-[var(--neo-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-px bg-[var(--neo-primary)]"></span>
              <span className="text-[var(--neo-primary)] font-bold tracking-widest text-sm uppercase">اساتید برتر</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[var(--neo-text-main)]">تجربه یادگیری از بهترین‌ها</h2>
          </div>
          <Link href="/instructors" className="text-[var(--neo-text-secondary)] hover:text-[var(--neo-primary)] transition font-medium flex items-center gap-2 pb-1 border-b border-transparent hover:border-[var(--neo-primary)]">
            مشاهده همه اساتید
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.map((inst: any) => (
            <Link key={inst._id} href={\`/instructors/\${inst.userId?._id}\`} className="group bg-[var(--neo-bg)] rounded-[20px] border border-[var(--neo-border)] overflow-hidden hover:border-[var(--neo-primary)]/30 transition-all duration-300 relative neo-card">
              <div className="aspect-square relative overflow-hidden bg-[var(--neo-surface-2)] m-4 rounded-[16px]">
                {inst.userId?.avatar ? (
                  <img src={inst.userId.avatar} alt={\`\${inst.userId.firstName} \${inst.userId.lastName}\`} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[var(--neo-text-muted)]">
                    <User className="w-16 h-16 mb-2 opacity-50" />
                  </div>
                )}
              </div>
              
              <div className="p-5 text-center">
                <h3 className="font-bold text-[var(--neo-text-main)] mb-1 text-lg group-hover:text-[var(--neo-primary)] transition-colors">{inst.userId?.firstName} {inst.userId?.lastName}</h3>
                <div className="flex items-center justify-center gap-1 text-[var(--neo-text-secondary)] text-sm mb-3">
                   <GraduationCap className="w-4 h-4" />
                   <span>{inst.title || 'مدرس ارشد'}</span>
                </div>
                
                <div className="flex flex-wrap items-center justify-center gap-2">
                   {inst.expertise?.slice(0,2).map((exp: string, idx: number) => (
                      <span key={idx} className="text-xs px-2.5 py-1 rounded-full border border-[var(--neo-border)] bg-white text-[var(--neo-text-secondary)]">
                        {exp}
                      </span>
                   ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
`);

write('frontend/src/components/home/Advantages.tsx', `import { Shield, Clock, Video, Award } from "lucide-react";

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
`);

write('frontend/src/components/home/Testimonials.tsx', `import { Star, Quote } from "lucide-react";

export function Testimonials({ data = [] }: { data: any[] }) {
  if (!data?.length) return null;
  
  return (
    <section className="py-24 bg-white border-b border-[var(--neo-border)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex justify-center items-center gap-2 mb-3">
             <span className="w-8 h-px bg-[var(--neo-primary)]"></span>
             <span className="text-[var(--neo-primary)] font-bold tracking-widest text-sm uppercase">داستان‌های موفقیت</span>
             <span className="w-8 h-px bg-[var(--neo-primary)]"></span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-[var(--neo-text-main)]">نظرات دانشجویان تک‌یاد</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.slice(0, 3).map((item: any, idx: number) => (
            <div key={item._id || idx} className="bg-[var(--neo-surface)] border border-[var(--neo-border)] p-8 rounded-[20px] relative neo-card">
              <Quote className="absolute top-6 left-6 w-12 h-12 text-[var(--neo-primary)] opacity-10" />
              
              <div className="flex items-center gap-1 mb-6 text-[var(--neo-warning)]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={\`w-5 h-5 \${i < (item.rating || 5) ? 'fill-current' : 'text-gray-200'}\`} />
                ))}
              </div>
              
              <p className="text-[var(--neo-text-main)] mb-8 leading-relaxed font-medium">"{item.comment}"</p>
              
              <div className="flex items-center gap-4 mt-auto pt-6 border-t border-[var(--neo-border)]">
                <div className="w-12 h-12 rounded-full border border-[var(--neo-border)] overflow-hidden bg-[var(--neo-surface-2)] text-[var(--neo-primary)]">
                  {item.user?.avatar ? (
                    <img src={item.user.avatar} alt={item.user.firstName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-sm">
                      {item.user?.firstName?.charAt(0) || 'D'}
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-bold text-[var(--neo-text-main)]">{item.user?.firstName} {item.user?.lastName}</div>
                  <div className="text-xs text-[var(--neo-text-secondary)] mt-1">{item.course?.title || 'دانشجوی تک‌یاد'}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`);

write('frontend/src/components/home/LatestArticles.tsx', `import Link from "next/link";
import { ArrowLeft, Calendar, FileText } from "lucide-react";

export function LatestArticles({ data = [] }: { data: any[] }) {
  if (!data?.length) return null;
  
  return (
    <section className="py-24 bg-[var(--neo-bg)] border-b border-[var(--neo-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
             <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-px bg-[var(--neo-primary)]"></span>
              <span className="text-[var(--neo-primary)] font-bold tracking-widest text-sm uppercase">دانشنامه</span>
            </div>
            <h2 className="text-3xl font-black text-[var(--neo-text-main)]">آخرین مقالات آموزشی</h2>
          </div>
          <Link href="/blog" className="text-[var(--neo-text-secondary)] hover:text-[var(--neo-primary)] transition font-medium flex items-center gap-2 pb-1 border-b border-transparent hover:border-[var(--neo-primary)]">
            مشاهده همه مقالات
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.slice(0, 3).map((article: any) => (
            <Link key={article._id} href={\`/blog/\${article.slug}\`} className="group flex flex-col bg-white rounded-[20px] border border-[var(--neo-border)] overflow-hidden hover:border-[var(--neo-primary)]/50 transition duration-300 neo-card">
              <div className="aspect-video relative overflow-hidden bg-[var(--neo-surface-2)]">
                {article.coverImage ? (
                  <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--neo-text-muted)]">
                    <FileText className="w-12 h-12 opacity-20" />
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-[var(--neo-primary)] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                  {article.category?.name || 'آموزشی'}
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-2 text-xs text-[var(--neo-text-muted)] mb-3">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(article.createdAt || Date.now()).toLocaleDateString('fa-IR')}
                </div>
                
                <h3 className="font-bold text-[var(--neo-text-main)] mb-3 text-lg line-clamp-2 group-hover:text-[var(--neo-primary)] transition-colors">{article.title}</h3>
                <p className="text-sm text-[var(--neo-text-secondary)] line-clamp-2 mb-6 leading-relaxed">{article.excerpt || "در این مقاله به بررسی این موضوع جذاب می‌پردازیم..."}</p>
                
                <div className="mt-auto pt-4 border-t border-[var(--neo-border)] flex items-center justify-between text-[var(--neo-primary)] text-sm font-bold">
                  <span>مطالعه مقاله</span>
                  <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
`);

write('frontend/src/components/home/CTA.tsx', `import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function CTA() {
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
          مسیر رشد شما از همینجا <span className="text-[var(--neo-primary)]">شروع</span> می‌شود
        </h2>
        <p className="text-xl text-[var(--neo-text-secondary)] mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
          همین حالا به جمع هزاران دانشجوی تک‌یاد بپیوندید و با یادگیری مهارت‌های جدید، آینده شغلی خود را تضمین کنید.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/register" className="inline-flex justify-center items-center gap-2 px-10 py-4 bg-[var(--neo-primary)] text-white hover:bg-opacity-90 rounded-xl font-bold transition-all shadow-lg shadow-[var(--neo-primary)]/30 text-lg">
            ثبت‌نام و شروع
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
`);

write('frontend/src/components/layout/Footer.tsx', `import Link from 'next/link';
import { Mail, Phone, MapPin, Camera, MessageCircle, Briefcase } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-[var(--neo-border)] pt-20 pb-10 text-[var(--neo-text-secondary)] relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
         <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="footer-grid-light" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="var(--neo-primary)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#footer-grid-light)" />
         </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full border-2 border-[var(--neo-primary)] flex items-center justify-center relative overflow-hidden">
                 <div className="w-2 h-2 bg-[var(--neo-secondary)] rounded-full"></div>
              </div>
              <span className="font-bold text-2xl text-[var(--neo-text-main)] tracking-tight">تک‌یاد</span>
            </Link>
            <p className="mb-6 leading-relaxed text-sm font-medium">
              پلتفرمی برای یادگیری عمیق، مهارت‌افزایی و آینده‌سازی. دوره‌های حضوری و آنلاین با رویکردی متفاوت و حرفه‌ای.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full border border-[var(--neo-border)] bg-[var(--neo-bg)] flex items-center justify-center hover:bg-[var(--neo-primary)] hover:text-white hover:border-[var(--neo-primary)] transition-colors">
                <Camera className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-[var(--neo-border)] bg-[var(--neo-bg)] flex items-center justify-center hover:bg-[var(--neo-secondary)] hover:text-white hover:border-[var(--neo-secondary)] transition-colors">
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-[var(--neo-border)] bg-[var(--neo-bg)] flex items-center justify-center hover:bg-[var(--neo-primary)] hover:text-white hover:border-[var(--neo-primary)] transition-colors">
                <Briefcase className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-[var(--neo-text-main)] font-bold mb-6 font-en tracking-widest text-sm uppercase">اکتشاف</h3>
            <ul className="space-y-3 font-medium">
              <li><Link href="/courses" className="hover:text-[var(--neo-primary)] transition">همه دوره‌ها</Link></li>
              <li><Link href="/classes" className="hover:text-[var(--neo-primary)] transition">کلاس‌های زنده</Link></li>
              <li><Link href="/instructors" className="hover:text-[var(--neo-primary)] transition">اساتید برتر</Link></li>
              <li><Link href="/blog" className="hover:text-[var(--neo-primary)] transition">وبلاگ</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-[var(--neo-text-main)] font-bold mb-6 font-en tracking-widest text-sm uppercase">پشتیبانی</h3>
            <ul className="space-y-3 font-medium">
              <li><Link href="/faq" className="hover:text-[var(--neo-primary)] transition">سوالات متداول</Link></li>
              <li><Link href="/rules" className="hover:text-[var(--neo-primary)] transition">قوانین و مقررات</Link></li>
              <li><Link href="/privacy" className="hover:text-[var(--neo-primary)] transition">حریم خصوصی</Link></li>
              <li><Link href="/contact" className="hover:text-[var(--neo-primary)] transition">تماس با ما</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-[var(--neo-text-main)] font-bold mb-6 font-en tracking-widest text-sm uppercase">ارتباط</h3>
            <ul className="space-y-4 font-medium">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[var(--neo-primary)] mt-0.5 shrink-0" />
                <span className="text-sm">تهران، خیابان آزادی، دانشگاه صنعتی شریف، مرکز نوآوری</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[var(--neo-secondary)] shrink-0" />
                <span className="font-en text-sm">021 - 91234567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[var(--neo-accent)] shrink-0" />
                <span className="font-en text-sm">hello@techyad.edu</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-[var(--neo-border)] flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-en font-medium">
          <p>© {new Date().getFullYear()} TechYad. All rights reserved.</p>
          <div className="flex gap-4">
             <span className="text-[var(--neo-primary)]">Learn.</span>
             <span className="text-[var(--neo-secondary)]">Build.</span>
             <span className="text-[var(--neo-accent)] text-black">Grow.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
`);

write('frontend/src/components/home/Intro.tsx', `import { BookOpen, Users, Award, MonitorPlay, Sparkles } from "lucide-react";

export function Intro() {
  const stats = [
    { icon: BookOpen, value: "۵۰۰+", label: "دوره آموزشی" },
    { icon: Users, value: "۵۰K+", label: "دانشجو فعال" },
    { icon: Award, value: "۲۰۰+", label: "استاد مجرب" },
    { icon: MonitorPlay, value: "۱۰K+", label: "ساعت آموزش" },
  ];

  return (
    <section className="py-24 bg-white border-b border-[var(--neo-border)] overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-[var(--neo-secondary)]" />
              <span className="text-[var(--neo-secondary)] font-bold tracking-widest text-sm uppercase">درباره پلتفرم</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-black text-[var(--neo-text-main)] mb-6 leading-tight">
              تجربه یادگیری <br/>
              <span className="text-[var(--neo-primary)]">بهتر و متفاوت‌تر</span>
            </h2>
            
            <p className="text-lg text-[var(--neo-text-secondary)] mb-10 leading-relaxed font-medium">
              تک‌یاد با هدف ارتقای سطح دانش و مهارت‌های تخصصی، پلتفرمی یکپارچه برای یادگیری فراهم کرده است. ما با بهره‌گیری از برترین اساتید ایران، دوره‌هایی متناسب با نیاز بازار کار طراحی کرده‌ایم تا مسیر رشد شما را هموارتر کنیم.
            </p>
            
            <div className="grid grid-cols-2 gap-8">
              {stats.map((stat, idx) => (
                <div key={idx} className="flex flex-col border-r border-[var(--neo-border)] pr-4 last:border-0">
                  <div className="flex items-center gap-3 mb-3">
                    <stat.icon className="w-5 h-5 text-[var(--neo-primary)]" />
                    <span className="text-3xl font-black text-[var(--neo-text-main)]">{stat.value}</span>
                  </div>
                  <span className="text-[var(--neo-text-muted)] font-bold text-sm">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--neo-primary)]/10 to-[var(--neo-secondary)]/10 blur-3xl rounded-full -z-10"></div>
            
            {/* Minimalist image container */}
            <div className="aspect-[4/3] rounded-[24px] overflow-hidden bg-[var(--neo-surface-2)] border border-[var(--neo-border)] relative group shadow-xl shadow-[var(--neo-primary)]/5">
              <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop" alt="دانشجویان در حال یادگیری" className="w-full h-full object-cover transition duration-700 group-hover:scale-105" />
              
              <div className="absolute bottom-6 right-6 z-20 flex gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-[var(--neo-primary)] shadow-sm"></div>
                 <div className="w-2.5 h-2.5 rounded-full bg-[var(--neo-secondary)] shadow-sm"></div>
                 <div className="w-2.5 h-2.5 rounded-full bg-[var(--neo-accent)] shadow-sm"></div>
              </div>
            </div>
            
            <div className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl shadow-[var(--neo-primary)]/10 border border-[var(--neo-border)]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[var(--neo-bg)] text-[var(--neo-primary)] rounded-full flex items-center justify-center border border-[var(--neo-border)]">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-[var(--neo-text-main)] tracking-tight text-sm">مدرک معتبر و بین‌المللی</p>
                  <p className="text-xs text-[var(--neo-text-muted)] mt-1 font-medium">مورد تایید وزارت علوم</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
`);

write('frontend/src/components/home/HomeDataView.tsx', `'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Hero } from './Hero';
import { Intro } from './Intro';
import { Categories } from './Categories';
import { CourseList } from './CourseList';
import { InstructorGrid } from './InstructorGrid';
import { Advantages } from './Advantages';
import { Testimonials } from './Testimonials';
import { LatestArticles } from './LatestArticles';
import { CTA } from './CTA';

export function HomeDataView() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['homeData'],
    queryFn: () => api.get('/home').then(res => res.data),
  });

  const d = data || {};

  return (
    <div className="min-h-screen flex flex-col bg-[var(--neo-bg)]">
      <Hero />
      <Intro />
      
      {isLoading ? (
        <div className="py-32 flex flex-col items-center justify-center gap-4 bg-[var(--neo-surface-2)]">
          <div className="w-10 h-10 border-4 border-[var(--neo-primary)] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[var(--neo-text-muted)] font-bold text-sm">در حال دریافت اطلاعات...</p>
        </div>
      ) : error ? (
        <div className="py-32 flex items-center justify-center text-[var(--neo-error)] font-bold bg-[var(--neo-surface-2)]">خطا در برقراری ارتباط با سرور.</div>
      ) : (
        <>
          <Categories data={d.categories} />
          <CourseList title="دوره‌های پرطرفدار" sectionName="محبوب‌ترین‌ها" data={d.popularCourses} />
          <CourseList title="جدیدترین دوره‌ها" sectionName="تازه منتشر شده" data={d.newCourses} />
          <CourseList title="دوره‌های رایگان" sectionName="شروع بدون هزینه" data={d.freeCourses} />
          <InstructorGrid data={d.topInstructors} />
          <CourseList title="کلاس‌های زنده (Live)" sectionName="ارتباط مستقیم" data={d.onlineClasses} />
          <CourseList title="کلاس‌های حضوری" sectionName="یادگیری فیزیکی" data={d.inPersonClasses} />
        </>
      )}

      <Advantages />
      
      {!isLoading && !error && (
        <>
          <Testimonials data={d.testimonials} />
          <LatestArticles data={d.blogPosts || d.latestArticles} />
        </>
      )}
      
      <CTA />
    </div>
  );
}
`);
