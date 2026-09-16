const fs = require('fs');
let code = fs.readFileSync('frontend/src/app/(dashboard)/instructor/page.tsx', 'utf8');

code = code.replace("import { useQuery } from '@tanstack/react-query';", "import { useQuery } from '@tanstack/react-query';\nimport { coursesApi } from '@/features/courses/api/courses.api';");
code = code.replace("api.get('/instructor/earnings').then(res => res.data?.data || res.data)", "coursesApi.getInstructorStats().then(res => res.data)");
code = code.replace("earningsData?.totalEarnings", "earningsData?.totalRevenue");
code = code.replace("earningsData?.monthlyEarnings || 8500000", "(earningsData?.totalRevenue || 0) / 12");

fs.writeFileSync('frontend/src/app/(dashboard)/instructor/page.tsx', code);
