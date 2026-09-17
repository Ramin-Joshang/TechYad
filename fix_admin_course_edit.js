const fs = require('fs');

let code = fs.readFileSync('frontend/src/app/(dashboard)/instructor/courses/[id]/edit/page.tsx', 'utf8');

if (!code.includes('adminApi')) {
    code = code.replace("import { coursesApi } from '@/features/courses/api/courses.api';", "import { coursesApi } from '@/features/courses/api/courses.api';\nimport { adminApi } from '@/features/admin/api/admin.api';\nimport { useAuthStore } from '@/features/auth/stores/auth.store';");
    
    code = code.replace("export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {", "export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {\n  const { user } = useAuthStore();");

    code = code.replace(
        "queryFn: () => coursesApi.getCourseBySlug(id).then((res: any) => res.data.data || res.data)",
        "queryFn: () => {\n      if (user?.role === 'admin' || user?.role === 'super-admin') {\n        return adminApi.getCourseById(id).then((res: any) => res.data.data || res.data);\n      }\n      return coursesApi.getCourseBySlug(id).then((res: any) => res.data.data || res.data);\n    }"
    );

    code = code.replace(
        "mutationFn: (data: any) => coursesApi.updateCourse(id, data)",
        "mutationFn: (data: any) => {\n      if (user?.role === 'admin' || user?.role === 'super-admin') {\n        return adminApi.updateCourse(id, data);\n      }\n      return coursesApi.updateCourse(id, data);\n    }"
    );
    
    fs.writeFileSync('frontend/src/app/(dashboard)/instructor/courses/[id]/edit/page.tsx', code);
}

let adminApiCode = fs.readFileSync('frontend/src/features/admin/api/admin.api.ts', 'utf8');
if (!adminApiCode.includes('getCourseById: async')) {
    adminApiCode = adminApiCode.replace(
        "updateCourse: async (id: string, data: any) => {",
        `getCourseById: async (id: string) => {\n    return api.get<any, any>(\`/admin/courses/\${id}\`);\n  },\n  updateCourse: async (id: string, data: any) => {`
    );
    fs.writeFileSync('frontend/src/features/admin/api/admin.api.ts', adminApiCode);
}

