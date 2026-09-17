const fs = require('fs');

let code = fs.readFileSync('frontend/src/app/(dashboard)/layout.tsx', 'utf8');

code = code.replace(/bg-gray-50\/50/g, "bg-[var(--neo-bg)]");
code = code.replace(/bg-gray-50/g, "bg-[var(--neo-bg)]");
code = code.replace(/bg-gray-900\/50/g, "bg-black/80");
code = code.replace(/bg-white/g, "bg-[var(--neo-surface)]");
code = code.replace(/border-gray-200/g, "border-[var(--neo-border)]");
code = code.replace(/border-gray-100/g, "border-[var(--neo-border)]");
code = code.replace(/text-gray-900/g, "text-white");
code = code.replace(/text-gray-800/g, "text-white");
code = code.replace(/text-gray-700/g, "text-[var(--neo-text)]");
code = code.replace(/text-gray-600/g, "text-[var(--neo-muted)]");
code = code.replace(/text-gray-500/g, "text-[var(--neo-muted)]");
code = code.replace(/text-gray-400/g, "text-[var(--neo-muted)]/70");
code = code.replace(/hover:text-gray-900/g, "hover:text-white");
code = code.replace(/hover:bg-gray-100/g, "hover:bg-[var(--neo-surface-2)]");
code = code.replace(/hover:bg-gray-50/g, "hover:bg-[var(--neo-surface-2)]/50");
code = code.replace(/text-blue-600/g, "text-[var(--neo-secondary)]");
code = code.replace(/bg-blue-600 text-white/g, "bg-[var(--neo-primary)] text-white");
code = code.replace(/bg-blue-100/g, "bg-[var(--neo-primary)]/20");
code = code.replace(/bg-blue-50/g, "bg-[var(--neo-primary)]/10");
code = code.replace(/shadow-blue-600\/20/g, "shadow-[var(--neo-primary)]/20");
code = code.replace(/bg-red-50/g, "bg-red-500/10");

// Update logo
code = code.replace(
  /<Link href="\/" className="text-2xl font-black text-\[var\(--neo-secondary\)\] tracking-tight" onClick=\{closeMenu\}>\s*\{isSidebarCollapsed \? 'TY' : <>Tech<span className="text-white">Yad<\/span><\/>\}\s*<\/Link>/g,
  `<Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
              <div className="w-8 h-8 rounded-full border border-[var(--neo-secondary)] flex items-center justify-center relative overflow-hidden shrink-0">
                 <div className="w-2 h-2 bg-[var(--neo-accent)] rounded-full shadow-[0_0_8px_#B8FF5A]"></div>
              </div>
              {!isSidebarCollapsed && <span className="font-bold text-xl text-white font-en tracking-wider neo-gradient-text">NeoAcademia</span>}
            </Link>`
);

// Fallback for logo replace in case exact regex didn't match:
code = code.replace(
  /\{isSidebarCollapsed \? 'TY' : <>Tech<span className="text-white">Yad<\/span><\/>\}/g,
  `{isSidebarCollapsed ? <div className="w-8 h-8 rounded-full border border-[var(--neo-secondary)] flex items-center justify-center relative"><div className="w-2 h-2 bg-[var(--neo-accent)] rounded-full shadow-[0_0_8px_#B8FF5A]"></div></div> : <span className="font-bold text-xl text-white font-en tracking-wider neo-gradient-text">NeoAcademia</span>}`
);


fs.writeFileSync('frontend/src/app/(dashboard)/layout.tsx', code);
