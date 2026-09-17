const fs = require('fs');

let code = fs.readFileSync('frontend/src/components/home/Hero.tsx', 'utf8');

// The replacement for the right column
const newRightColumn = `
          <div className="hidden lg:flex relative h-[600px] w-full items-center justify-center">
            <div className="relative w-[120%] h-auto z-10 mr-10 scale-110">
              <img src="/hero-image.png" alt="Student learning" className="w-full h-auto object-contain drop-shadow-2xl mix-blend-multiply" />
            </div>
          </div>
`;

code = code.replace(
  /<div className="hidden lg:block relative h-\[600px\] w-full">[\s\S]*?<\/div>\s*<\/div>/,
  newRightColumn
);

fs.writeFileSync('frontend/src/components/home/Hero.tsx', code);
