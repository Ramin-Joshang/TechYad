const fs = require('fs');

let frontend = fs.readFileSync('frontend/src/app/(dashboard)/admin/courses/page.tsx', 'utf8');

frontend = frontend.replace(
  `<div>
          <h1 className="text-2xl font-black text-gray-900">مدیریت دوره‌ها</h1>
          <p className="text-gray-500 mt-1">نمایش و مدیریت وضعیت دوره‌های آموزشی</p>
        </div>
      </div>`,
  `<div>
          <h1 className="text-2xl font-black text-gray-900">مدیریت دوره‌ها</h1>
          <p className="text-gray-500 mt-1">نمایش و مدیریت وضعیت دوره‌های آموزشی</p>
        </div>
        <Link href="/instructor/courses/new" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition">
          <Plus className="w-5 h-5" />
          افزودن دوره جدید
        </Link>
      </div>`
);

frontend = frontend.replace(
  `{course.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => publishMutation.mutate(course._id)}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="تایید و انتشار"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => rejectMutation.mutate(course._id)}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="رد کردن"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}`,
  `{course.status !== 'published' && (
                          <button 
                            onClick={() => publishMutation.mutate(course._id)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="تایید و انتشار"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {course.status === 'pending' && (
                           <button 
                              onClick={() => rejectMutation.mutate(course._id)}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="رد کردن"
                            >
                              <XCircle className="w-4 h-4" />
                           </button>
                        )}`
);

fs.writeFileSync('frontend/src/app/(dashboard)/admin/courses/page.tsx', frontend);
