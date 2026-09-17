const fs = require('fs');
let code = fs.readFileSync('frontend/src/app/(dashboard)/admin/courses/page.tsx', 'utf8');

if (!code.includes("import Link from 'next/link';")) {
  code = code.replace("import { Loader2, Search, BookOpen, CheckCircle, XCircle } from 'lucide-react';", "import { Loader2, Search, BookOpen, CheckCircle, XCircle, Plus, Edit, Trash2 } from 'lucide-react';\nimport Link from 'next/link';");
}

code = code.replace(
  '<div>\n          <h1 className="text-2xl font-black text-gray-900">کل دوره‌ها</h1>',
  `<div>
          <h1 className="text-2xl font-black text-gray-900">کل دوره‌ها</h1>`
);

// Add Add button next to header
code = code.replace(
  '<p className="text-gray-500 mt-1">نمایش همه دوره‌های آموزشی ثبت شده در سیستم</p>\n        </div>\n      </div>',
  `<p className="text-gray-500 mt-1">نمایش همه دوره‌های آموزشی ثبت شده در سیستم</p>
        </div>
        <Link href="/instructor/courses/new" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition">
          <Plus className="w-5 h-5" />
          ایجاد دوره جدید
        </Link>
      </div>`
);

// Add delete mutation
if (!code.includes('deleteMutation')) {
  code = code.replace(
    'const rejectMutation = useMutation({',
    `const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteCourse(id),
    onSuccess: () => {
      toast.success('دوره با موفقیت حذف شد');
      queryClient.invalidateQueries({ queryKey: ['adminCourses'] });
    }
  });

  const rejectMutation = useMutation({`
  );
}

// Add Edit and Delete buttons in actions
code = code.replace(
  '<div className="flex justify-center gap-2">',
  `<div className="flex justify-center items-center gap-2">
                        <Link href={\`/instructor/courses/\${course._id}/edit\`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="ویرایش">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button onClick={() => { if(window.confirm('آیا از حذف اطمینان دارید؟')) deleteMutation.mutate(course._id) }} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="حذف">
                          <Trash2 className="w-4 h-4" />
                        </button>`
);

fs.writeFileSync('frontend/src/app/(dashboard)/admin/courses/page.tsx', code);
