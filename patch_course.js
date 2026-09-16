const fs = require('fs');

let service = fs.readFileSync('backend/src/modules/courses/course.service.ts', 'utf8');

if (!service.includes('updateChapter')) {
  const chapterMethods = `
  static async updateChapter(chapterId: string, instructorId: string, data: any) {
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) throw new AppError('Chapter not found', 404, 'NOT_FOUND');
    const course = await Course.findOne({ _id: chapter.courseId, instructors: instructorId });
    if (!course) throw new AppError('Unauthorized', 403, 'FORBIDDEN');
    
    return await Chapter.findByIdAndUpdate(chapterId, data, { new: true });
  }

  static async deleteChapter(chapterId: string, instructorId: string) {
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) throw new AppError('Chapter not found', 404, 'NOT_FOUND');
    const course = await Course.findOne({ _id: chapter.courseId, instructors: instructorId });
    if (!course) throw new AppError('Unauthorized', 403, 'FORBIDDEN');
    
    await Chapter.findByIdAndDelete(chapterId);
    // Cascade delete lessons? Yes.
    await Lesson.deleteMany({ chapterId });
    return { success: true };
  }
  `;
  service = service.replace('static async getChapters(courseId: string) {', chapterMethods + '\n  static async getChapters(courseId: string) {');
}

if (!service.includes('updateLesson')) {
  const lessonMethods = `
  static async updateLesson(lessonId: string, instructorId: string, data: any) {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) throw new AppError('Lesson not found', 404, 'NOT_FOUND');
    const course = await Course.findOne({ _id: lesson.courseId, instructors: instructorId });
    if (!course) throw new AppError('Unauthorized', 403, 'FORBIDDEN');
    
    return await Lesson.findByIdAndUpdate(lessonId, data, { new: true });
  }

  static async deleteLesson(lessonId: string, instructorId: string) {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) throw new AppError('Lesson not found', 404, 'NOT_FOUND');
    const course = await Course.findOne({ _id: lesson.courseId, instructors: instructorId });
    if (!course) throw new AppError('Unauthorized', 403, 'FORBIDDEN');
    
    await Lesson.findByIdAndDelete(lessonId);
    return { success: true };
  }
  `;
  service = service.replace('static async getLessons(chapterId: string) {', lessonMethods + '\n  static async getLessons(chapterId: string) {');
}

fs.writeFileSync('backend/src/modules/courses/course.service.ts', service);
