const fs = require('fs');

// 1. ClassesList.tsx
let f1 = 'frontend/src/components/classes/ClassesList.tsx';
if (fs.existsSync(f1)) {
    let c = fs.readFileSync(f1, 'utf8');
    c = c.replace(/const enrolled = cls\.enrolledCount \|\| Math\.floor\(\(cls\.title\.length \* 7\) % \(cls\.capacity \+ 1\)\);/g, "const enrolled = cls.enrolledCount || 0;");
    c = c.replace(/const rating = cls\.rating \|\| \(4 \+ \(\(cls\.title\.length % 10\) \/ 10\)\);/g, "const rating = cls.rating || 0;");
    c = c.replace(/const reviews = cls\.reviews \|\| \(\(cls\.title\.length \* 13\) % 100\);/g, "const reviews = cls.reviewCount || 0;");
    c = c.replace(/const sessionCount = cls\.sessions \|\| \(\(cls\.title\.length % 12\) \+ 4\);/g, "const sessionCount = cls.sessions || 0;");
    fs.writeFileSync(f1, c);
}

// 2. InstructorsList.tsx
let f2 = 'frontend/src/components/instructors/InstructorsList.tsx';
if (fs.existsSync(f2)) {
    let c = fs.readFileSync(f2, 'utf8');
    // We will just remove the mock fields inside the loop and use actual ones
    c = c.replace(/const rating = inst\.rating \|\| \(4 \+ \(\(inst\._id\.charCodeAt\(0\) % 10\) \/ 10\)\);/g, "const rating = inst.rating || 0;");
    c = c.replace(/const reviews = inst\.reviews \|\| \(\(inst\._id\.charCodeAt\(1\) \* 13\) % 100\);/g, "const reviews = inst.reviewCount || 0;");
    c = c.replace(/const students = inst\.students \|\| \(\(inst\._id\.charCodeAt\(2\) \* 37\) % 500\);/g, "const students = inst.studentCount || 0;");
    c = c.replace(/const courses = inst\.courses \|\| \(\(inst\._id\.charCodeAt\(3\) % 15\) \+ 2\);/g, "const courses = inst.courseCount || 0;");
    fs.writeFileSync(f2, c);
}

// 3. InstructorProfileContainer.tsx
let f3 = 'frontend/src/components/instructors/InstructorProfileContainer.tsx';
if (fs.existsSync(f3)) {
    let c = fs.readFileSync(f3, 'utf8');
    c = c.replace(/const rating = inst\.rating \|\| 4\.8;/g, "const rating = inst.rating || 0;");
    c = c.replace(/const reviews = inst\.reviews \|\| 124;/g, "const reviews = inst.reviewCount || 0;");
    c = c.replace(/const students = inst\.students \|\| 1450;/g, "const students = inst.studentCount || 0;");
    c = c.replace(/const coursesCount = inst\.courses \|\| 12;/g, "const coursesCount = inst.courseCount || 0;");
    fs.writeFileSync(f3, c);
}

