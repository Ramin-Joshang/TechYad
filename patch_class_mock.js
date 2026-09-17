const fs = require('fs');

let code = fs.readFileSync('frontend/src/components/classes/ClassDetailsContainer.tsx', 'utf8');

// Replace mock logics with actual values (or 0/empty)
code = code.replace(
  /const enrolled = cls\.enrolledCount \|\| Math\.floor\(\(cls\.title\.length \* 7\) % \(cls\.capacity \+ 1\)\);/g,
  "const enrolled = cls.enrolledCount || 0;"
);

code = code.replace(
  /const rating = cls\.rating \|\| \(4 \+ \(\(cls\.title\.length % 10\) \/ 10\)\);/g,
  "const rating = cls.rating || 0;"
);

code = code.replace(
  /const sessions = cls\.sessions \|\| \(\(cls\.title\.length % 12\) \+ 4\);/g,
  "const sessions = cls.sessions || 0;"
);

code = code.replace(
  /const sessionDuration = 90; \/\/ mock duration/g,
  "const sessionDuration = cls.sessionDuration || 0;"
);

fs.writeFileSync('frontend/src/components/classes/ClassDetailsContainer.tsx', code);
