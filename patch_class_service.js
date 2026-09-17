const fs = require('fs');
let code = fs.readFileSync('backend/src/modules/classes/class.service.ts', 'utf8');

code = code.replace(
  'instructors: [userId] // By default, the creator is the instructor',
  'instructors: data.instructors?.length > 0 ? data.instructors : [userId]'
);

if (!code.includes('static async updateClass')) {
  code = code.replace(
    'static async getMyClasses(userId: string) {',
    `static async updateClass(id: string, userId: string, data: any, overrideAuth: boolean = false) {
    const query = overrideAuth ? { _id: id } : { _id: id, instructors: userId };
    const cls = await Class.findOneAndUpdate(query, data, { new: true });
    if (!cls) throw new AppError('Class not found or unauthorized', 404);
    return cls;
  }
  
  static async deleteClass(id: string, userId: string, overrideAuth: boolean = false) {
    const query = overrideAuth ? { _id: id } : { _id: id, instructors: userId };
    const cls = await Class.findOneAndDelete(query);
    if (!cls) throw new AppError('Class not found or unauthorized', 404);
    return cls;
  }
  
  static async getMyClasses(userId: string) {`
  );
}

fs.writeFileSync('backend/src/modules/classes/class.service.ts', code);
