const fs = require('fs');

// 1. Fix params.id in Next.js 15+ (unwrap with React.use())
function fixNextParams(path) {
  let code = fs.readFileSync(path, 'utf8');
  if (code.includes('const id = params.id;') || code.includes('params.id')) {
    if (!code.includes('import { use } from "react";')) {
      code = code.replace("import { useState, useEffect } from 'react';", "import { useState, useEffect, use } from 'react';");
      if (!code.includes('use } from')) {
          code = code.replace("import { useState } from 'react';", "import { useState, use } from 'react';");
      }
    }
    
    // Replace standard props
    code = code.replace(
      /export default function [a-zA-Z0-9]+\({ params }: { params: { id: string } }\) {/g,
      "export default function Page({ params }: { params: Promise<{ id: string }> }) {"
    );
    
    code = code.replace(/const id = params\.id;/g, "const unwrappedParams = use(params) as any;\n  const id = unwrappedParams.id;");
    
    // Fix any other references
    if (!code.includes('unwrappedParams')) {
        code = code.replace(/params\.id/g, "(use(params as any) as any).id");
    }
    
    fs.writeFileSync(path, code);
  }
}

fixNextParams('frontend/src/app/(dashboard)/super-admin/admins/[id]/page.tsx');
fixNextParams('frontend/src/app/(dashboard)/admin/users/[id]/page.tsx');
fixNextParams('frontend/src/app/(dashboard)/instructor/courses/[id]/edit/page.tsx');


// 2. Fix Admin Edit Course "NOT_FOUND" 
// The problem is GET /instructor/courses/:id validates the instructor, 
// so admins can't fetch it to edit. We need a way for admins to fetch courses by ID.
let courseController = fs.readFileSync('backend/src/modules/courses/course.controller.ts', 'utf8');
if (!courseController.includes('export const adminGetCourseById =')) {
  courseController += `\nexport const adminGetCourseById = async (req: Request, res: Response) => {
  const result = await CourseService.getCourseById(req.params.id as string);
  sendSuccess(res, result, 'Course retrieved successfully');
};`;
  fs.writeFileSync('backend/src/modules/courses/course.controller.ts', courseController);
}

let courseService = fs.readFileSync('backend/src/modules/courses/course.service.ts', 'utf8');
if (!courseService.includes('static async getCourseById(id: string) {')) {
  courseService = courseService.replace(
    'static async getInstructorCourseById(instructorId: string, id: string) {',
    `static async getCourseById(id: string) {
    const course = await Course.findById(id).populate('categoryId subjectId fieldId levelId instructors');
    if (!course) throw new AppError('Course not found', 404);
    return course;
  }
  
  static async getInstructorCourseById(instructorId: string, id: string) {`
  );
  fs.writeFileSync('backend/src/modules/courses/course.service.ts', courseService);
}

let courseRoutes = fs.readFileSync('backend/src/modules/courses/course.routes.ts', 'utf8');
if (!courseRoutes.includes("router.get('/admin/courses/:id'")) {
  courseRoutes = courseRoutes.replace(
    "router.post('/admin/courses/:id/publish', isAdmin, asyncHandler(Controller.publishCourse));",
    `router.get('/admin/courses/:id', isAdmin, asyncHandler(Controller.adminGetCourseById));\nrouter.post('/admin/courses/:id/publish', isAdmin, asyncHandler(Controller.publishCourse));`
  );
  fs.writeFileSync('backend/src/modules/courses/course.routes.ts', courseRoutes);
}


// 3. Fix Lesson order validation (expected number, received undefined)
let courseValidation = fs.readFileSync('backend/src/modules/courses/course.validation.ts', 'utf8');
courseValidation = courseValidation.replace(
  /order: z\.number\(\),/g,
  'order: z.number().optional().default(0),'
);
fs.writeFileSync('backend/src/modules/courses/course.validation.ts', courseValidation);


// 4. Fix Class Creation Enum and required fields
let classModel = fs.readFileSync('backend/src/modules/classes/class.model.ts', 'utf8');
classModel = classModel.replace(/enum: \['online', 'in-person'\],/g, "enum: ['online', 'in-person', 'offline'],");
fs.writeFileSync('backend/src/modules/classes/class.model.ts', classModel);

let classService = fs.readFileSync('backend/src/modules/classes/class.service.ts', 'utf8');
if (!classService.includes('endDate: data.endDate')) {
  classService = classService.replace(
    `capacity: data.capacity || data.maxStudents,
      ...data,`,
    `capacity: data.capacity || data.maxStudents || 50,
      description: data.description || data.shortDescription || 'توضیحاتی برای این کلاس وارد نشده است.',
      endDate: data.endDate || new Date(new Date(data.startDate || new Date()).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      ...data,`
  );
  fs.writeFileSync('backend/src/modules/classes/class.service.ts', classService);
}

// 5. Fix Course Pending (Add publish button in /admin/courses/pending)
let pendingCoursesPage = fs.readFileSync('frontend/src/app/(dashboard)/admin/courses/pending/page.tsx', 'utf8');
if (!pendingCoursesPage.includes('publishMutation.mutate')) {
  pendingCoursesPage = pendingCoursesPage.replace(
    "const rejectMutation = useMutation({",
    `const publishMutation = useMutation({
    mutationFn: (id: string) => adminApi.publishCourse(id),
    onSuccess: () => {
      toast.success('دوره تایید و منتشر شد');
      queryClient.invalidateQueries({ queryKey: ['pendingCourses'] });
    }
  });\n\n  const rejectMutation = useMutation({`
  );
  pendingCoursesPage = pendingCoursesPage.replace(
    /<CheckCircle className="w-4 h-4" \/>\n\s*<\/button>/,
    `<CheckCircle className="w-4 h-4" />
                            </button>`
  );
  pendingCoursesPage = pendingCoursesPage.replace(
    /<button \n\s*className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"\n\s*title="تایید و انتشار"\n\s*>/,
    `<button onClick={() => publishMutation.mutate(course._id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="تایید و انتشار">`
  );
  fs.writeFileSync('frontend/src/app/(dashboard)/admin/courses/pending/page.tsx', pendingCoursesPage);
}

