const fs = require('fs');

// Root layout: remove Navbar and Footer
let rootCode = fs.readFileSync('frontend/src/app/layout.tsx', 'utf8');
rootCode = rootCode.replace('import { Navbar } from "@/components/layout/Navbar";\n', '');
rootCode = rootCode.replace('import { Footer } from "@/components/layout/Footer";\n', '');
rootCode = rootCode.replace('<Navbar />', '');
rootCode = rootCode.replace('<Footer />', '');
fs.writeFileSync('frontend/src/app/layout.tsx', rootCode);

// Public layout: add Navbar and Footer
const publicLayout = `
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="flex-1 flex flex-col">
        {children}
      </div>
      <Footer />
    </>
  );
}
`;
fs.writeFileSync('frontend/src/app/(public)/layout.tsx', publicLayout);
