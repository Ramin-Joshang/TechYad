const fs = require('fs');
let code = fs.readFileSync('frontend/src/app/(dashboard)/layout.tsx', 'utf8');

// 1. Add new icons and state
code = code.replace(
  'Briefcase\n} from \'lucide-react\';',
  'Briefcase, ChevronRight, ChevronLeft\n} from \'lucide-react\';'
);
code = code.replace(
  'const [mobileMenuOpen, setMobileMenuOpen] = useState(false);',
  'const [mobileMenuOpen, setMobileMenuOpen] = useState(false);\n  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);\n  const [showNotifications, setShowNotifications] = useState(false);'
);

// 2. Update Aside wrapper
code = code.replace(
  'w-64 bg-white border-l border-gray-200 \n          flex flex-col transform transition-transform duration-300 ease-in-out',
  '${isSidebarCollapsed ? \'w-20\' : \'w-64\'} bg-white border-l border-gray-200 flex flex-col transform transition-all duration-300 ease-in-out'
);

// 3. Update Sidebar Header
code = code.replace(
  /<div className="p-6 border-b border-gray-100 flex items-center justify-between">.*?<\/div>/s,
  `<div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <Link href="/" className="text-2xl font-black text-blue-600 tracking-tight" onClick={closeMenu}>
              {isSidebarCollapsed ? 'TY' : <>Tech<span className="text-gray-900">Yad</span></>}
            </Link>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="hidden lg:block text-gray-400 hover:text-gray-900 p-1">
                {isSidebarCollapsed ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>
              <button onClick={closeMenu} className="lg:hidden text-gray-500 hover:text-gray-900 p-1">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>`
);

// 4. Update Profile in Sidebar
code = code.replace(
  /<div className="p-5 border-b border-gray-100 flex items-center gap-4 bg-gray-50\/50">.*?<\/div>\s*<\/div>\s*<\/div>/s,
  `<div className={\`p-5 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50 \${isSidebarCollapsed ? 'justify-center' : ''}\`}>
            <div className={\`\${isSidebarCollapsed ? 'w-10 h-10 rounded-xl text-lg' : 'w-12 h-12 rounded-2xl text-xl'} bg-blue-100 text-blue-600 flex items-center justify-center font-bold overflow-hidden shadow-inner shrink-0\`}>
              {user?.avatar ? (
                <img src={user.avatar} alt={user.firstName} className="w-full h-full object-cover" />
              ) : (
                user?.firstName?.charAt(0) || 'U'
              )}
            </div>
            {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 truncate">{user?.firstName} {user?.lastName}</div>
                <div className="text-xs font-medium text-blue-600 capitalize bg-blue-50 inline-block px-2 py-0.5 rounded-full mt-1">
                  {user?.role === 'super-admin' || user?.role === 'admin' ? 'مدیریت' : user?.role === 'instructor' ? 'استاد' : 'دانشجو'}
                </div>
              </div>
            )}
          </div>`
);

// 5. Update Nav Links
code = code.replace(
  /className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 \${/s,
  'title={isSidebarCollapsed ? link.name : undefined}\n                  className={`flex items-center ${isSidebarCollapsed ? \'justify-center px-0\' : \'gap-3 px-4\'} py-3 rounded-xl font-medium transition-all duration-200 ${'
);
code = code.replace(
  /\{link\.name\}/s,
  '{!isSidebarCollapsed && link.name}'
);

// 6. Update Logout Button
code = code.replace(
  /className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-right"/s,
  'title={isSidebarCollapsed ? \'خروج\' : undefined}\n              className={`flex items-center ${isSidebarCollapsed ? \'justify-center px-0\' : \'gap-3 px-4\'} py-3 w-full rounded-xl font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors`}'
);
code = code.replace(
  /خروج از حساب/s,
  '{!isSidebarCollapsed && \'خروج از حساب\'}'
);

// 7. Replace Mobile Header with custom Dashboard Header
code = code.replace(
  /<header className="bg-white\/80 backdrop-blur-md border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:hidden sticky top-0 z-30">.*?<\/header>/s,
  `<header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sticky top-0 z-30 shadow-sm">
            <div className="flex items-center gap-4">
              <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg lg:hidden">
                <Menu className="w-6 h-6" />
              </button>
              <div className="hidden lg:block">
                <h2 className="font-bold text-gray-800 text-lg">پنل کاربری {user?.role === 'super-admin' || user?.role === 'admin' ? 'مدیریت' : user?.role === 'instructor' ? 'اساتید' : 'دانشجویان'}</h2>
              </div>
            </div>
            
            <div className="flex items-center gap-3 relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative transition"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
              
              {showNotifications && (
                <div className="absolute top-12 left-0 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                    <h3 className="font-bold text-sm text-gray-900">اعلان‌های اخیر</h3>
                    <Link href={\`/\${user?.role === 'student' ? 'student' : user?.role === 'instructor' ? 'instructor' : 'admin'}/notifications\`} onClick={() => setShowNotifications(false)} className="text-xs font-bold text-blue-600 hover:text-blue-700">مشاهده همه</Link>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    <div className="p-8 text-center text-sm text-gray-500">
                      برای مشاهده اعلان‌ها به صفحه اختصاصی مراجعه کنید
                    </div>
                  </div>
                </div>
              )}

              <Link href="/profile" className="flex items-center gap-2 p-1.5 pr-3 rounded-full border border-gray-100 hover:bg-gray-50 transition cursor-pointer">
                <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.firstName}</span>
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.firstName} className="w-full h-full object-cover" />
                  ) : (
                    user?.firstName?.charAt(0) || 'U'
                  )}
                </div>
              </Link>
            </div>
          </header>`
);

fs.writeFileSync('frontend/src/app/(dashboard)/layout.tsx', code);
