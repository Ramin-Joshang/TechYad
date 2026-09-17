const fs = require('fs');

let code = fs.readFileSync('frontend/src/components/layout/Navbar.tsx', 'utf8');

// Replace classes
code = code.replace(/bg-white border-b border-gray-100/g, "bg-[#080A12]/80 backdrop-blur-md border-b border-white/5");
code = code.replace(/text-gray-500 hover:text-blue-600/g, "text-[#9097AB] hover:text-[#28D7FF]");
code = code.replace(/text-gray-900/g, "text-[#F5F7FF]");
code = code.replace(/text-gray-600/g, "text-[#9097AB]");
code = code.replace(/bg-blue-600 text-white/g, "bg-[#7C5CFF] text-white");
code = code.replace(/text-blue-600 font-bold/g, "text-[#28D7FF] font-bold");
code = code.replace(/hover:text-blue-600/g, "hover:text-[#28D7FF]");
code = code.replace(/border-gray-100 hover:bg-gray-50/g, "border-white/10 hover:bg-white/5");
code = code.replace(/text-gray-700/g, "text-[#F5F7FF]");
code = code.replace(/bg-blue-100 text-blue-600/g, "bg-[#7C5CFF]/20 text-[#7C5CFF]");
code = code.replace(/bg-blue-50 text-blue-600 hover:bg-blue-100/g, "bg-transparent border border-[#28D7FF] text-[#28D7FF] hover:bg-[#28D7FF]/10");
code = code.replace(/bg-white z-50/g, "bg-[#10131F] z-50");
code = code.replace(/bg-gray-50\/50/g, "bg-white/5");
code = code.replace(/bg-blue-50 text-blue-600/g, "bg-white/5 text-[#28D7FF]");
code = code.replace(/hover:bg-gray-50/g, "hover:bg-white/5");
code = code.replace(/border-t border-gray-100/g, "border-t border-white/5");
code = code.replace(/border-b border-gray-100/g, "border-b border-white/5");
code = code.replace(/bg-gray-200/g, "bg-white/10");
code = code.replace(/hover:bg-red-50/g, "hover:bg-red-500/10");
code = code.replace(/T/g, "Node");
code = code.replace(/تک‌یاد/g, "NeoAcademia");
code = code.replace(/<span className="font-bold text-xl text-\[\#F5F7FF\] hidden sm:block">NeoAcademia<\/span>/g, '<span className="font-bold text-xl hidden sm:block font-en tracking-wider neo-gradient-text">NeoAcademia</span>');
code = code.replace(/<div className="w-8 h-8 bg-\[\#7C5CFF\] text-white rounded-lg flex items-center justify-center font-bold text-xl">\s*Node\s*<\/div>/g, '<div className="w-8 h-8 rounded-full border border-[#28D7FF] flex items-center justify-center relative overflow-hidden"><div className="w-2 h-2 bg-[#B8FF5A] rounded-full shadow-[0_0_8px_#B8FF5A]"></div></div>');

fs.writeFileSync('frontend/src/components/layout/Navbar.tsx', code);
