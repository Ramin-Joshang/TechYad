const fs = require('fs');

let code = fs.readFileSync('frontend/src/app/(dashboard)/layout.tsx', 'utf8');

// Replace dark colors with light ones
code = code.replace(/text-white/g, "text-[var(--neo-text-main)]");
code = code.replace(/bg-black\/80/g, "bg-gray-900/50"); // For overlay, dark is ok but maybe lighter
code = code.replace(/text-\[var\(--neo-text\)\]/g, "text-[var(--neo-text-main)]");
code = code.replace(/text-white/g, "text-[var(--neo-text-main)]"); // Any leftovers

code = code.replace(
  /<span className="font-bold text-xl text-\[var\(--neo-text-main\)\] font-en tracking-wider neo-gradient-text">NeoAcademia<\/span>/g,
  '<span className="font-bold text-xl text-[var(--neo-text-main)] tracking-tight">تک‌یاد</span>'
);

code = code.replace(
  /<div className="w-8 h-8 rounded-full border border-\[var\(--neo-secondary\)\] flex items-center justify-center relative overflow-hidden shrink-0">\s*<div className="w-2 h-2 bg-\[var\(--neo-accent\)\] rounded-full shadow-\[0_0_8px_#B8FF5A\]"><\/div>\s*<\/div>/g,
  `<div className="w-8 h-8 rounded-full border-2 border-[var(--neo-primary)] flex items-center justify-center relative overflow-hidden shrink-0">
     <div className="w-2 h-2 bg-[var(--neo-secondary)] rounded-full"></div>
  </div>`
);


// Replace nav active state text
code = code.replace(
  /bg-\[var\(--neo-primary\)\] text-\[var\(--neo-text-main\)\] shadow-md/g,
  "bg-[var(--neo-primary)] text-white shadow-md"
);

// We replaced ALL `text-white` with `text-[var(--neo-text-main)]`, but the active nav item and some buttons need `text-white`.
code = code.replace(
  /'bg-\[var\(--neo-primary\)\] text-\[var\(--neo-text-main\)\] shadow-md shadow-\[var\(--neo-primary\)\]\/20'/g,
  "'bg-[var(--neo-primary)] text-white shadow-md shadow-[var(--neo-primary)]/20'"
);

code = code.replace(
  /<Icon className=\{\`w-5 h-5 \$\{isActive \? 'text-\[var\(--neo-text-main\)\]' : 'text-\[var\(--neo-muted\)\]'\}\`\} \/>/g,
  "<Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[var(--neo-muted)]'}`} />"
);

code = code.replace(
  /hover:text-\[var\(--neo-text-main\)\]/g,
  "hover:text-[var(--neo-primary)]"
);

fs.writeFileSync('frontend/src/app/(dashboard)/layout.tsx', code);
