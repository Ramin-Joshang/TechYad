import { Request, Response } from 'express';
import { sendSuccess } from '../../common/utils/response.js';
import { FAQ } from './models/faq.model.js';
import { ContactMessage } from './models/contact.model.js';
import { CareerApplication } from './models/career.model.js';
import { JobPosition } from './models/job-position.model.js';

// ======================== FAQs ========================
export const getFaqs = async (req: Request, res: Response) => {
  let faqs = await FAQ.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
  if (faqs.length === 0) {
    // Seed initial FAQs if empty
    await FAQ.create([
      { question: 'چگونه می‌توانم در یک دوره آموزشی ثبت‌نام کنم؟', answer: 'پس از انتخاب دوره مورد نظر، با کلیک بر روی دکمه «ثبت‌نام در دوره» وارد سبد خرید می‌شوید و پس از پرداخت وجه، دوره فوراً در پنل کاربری شما فعال می‌گردد.', category: 'register', order: 1, isActive: true },
      { question: 'آیا امکان مشاهده جلسات بعد از پایان دوره وجود دارد؟', answer: 'بله، دسترسی به ویدیوها و فایل‌های دوره‌ها دائمی و مادام‌العمر است و هر زمان می‌توانید به محتوای آموزشی مراجعه کنید.', category: 'courses', order: 2, isActive: true },
      { question: 'کلاس‌های آنلاین با چه پلتفرمی برگزار می‌شوند؟', answer: 'کلاس‌های زنده آنلاین از طریق پلتفرم‌های تعاملی نظیر اسکای‌روم و ادوبی‌کانکت برگزار شده و نیاز به نصب نرم‌افزار خاصی ندارد.', category: 'online', order: 3, isActive: true },
      { question: 'در صورت مشکل در پرداخت بانکی چه اقدامی انجام دهم؟', answer: 'اگر وجه از حساب شما کسر شده ولی تراکنش ناموفق ثبت شده، مبلغ معمولاً طی ۷۲ ساعت توسط بانک عودت داده می‌شود. در صورت عدم بازگشت، با پشتیبانی تماس حاصل فرمایید.', category: 'payment', order: 4, isActive: true },
      { question: 'چگونه می‌توانم با استاد دوره در ارتباط باشم و رفع اشکال کنم؟', answer: 'در هر دوره آموزشی بخش پرسش و پاسخ، ارسال تیکت و بخش ارسال تکالیف وجود دارد که استاد شخصاً پاسخگوی سوالات شماست.', category: 'support', order: 5, isActive: true }
    ]);
    faqs = await FAQ.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
  }
  sendSuccess(res, faqs, 'FAQs retrieved successfully');
};

export const getAllFaqsAdmin = async (req: Request, res: Response) => {
  const faqs = await FAQ.find().sort({ order: 1, createdAt: -1 });
  sendSuccess(res, faqs, 'All FAQs retrieved successfully');
};

export const createFaq = async (req: Request, res: Response) => {
  const faq = await FAQ.create(req.body);
  sendSuccess(res, faq, 'FAQ created successfully', 201);
};

export const updateFaq = async (req: Request, res: Response) => {
  const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!faq) {
    return res.status(404).json({ success: false, message: 'FAQ not found' });
  }
  sendSuccess(res, faq, 'FAQ updated successfully');
};

export const deleteFaq = async (req: Request, res: Response) => {
  await FAQ.findByIdAndDelete(req.params.id);
  sendSuccess(res, null, 'FAQ deleted successfully');
};

// ==================== Contact Messages ====================
export const submitContact = async (req: Request, res: Response) => {
  const message = await ContactMessage.create(req.body);
  sendSuccess(res, message, 'Message sent successfully', 201);
};

export const getContactsAdmin = async (req: Request, res: Response) => {
  const { status, search, page = 1, limit = 20 } = req.query;
  const filter: any = {};
  if (status && status !== 'all') {
    filter.status = status;
  }
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { message: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [messages, total] = await Promise.all([
    ContactMessage.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    ContactMessage.countDocuments(filter)
  ]);

  sendSuccess(res, { messages, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) }, 'Contact messages retrieved');
};

export const updateContactStatus = async (req: Request, res: Response) => {
  const { status, replyNotes, isRead } = req.body;
  const updateData: any = {};
  if (status) updateData.status = status;
  if (replyNotes !== undefined) updateData.replyNotes = replyNotes;
  if (isRead !== undefined) updateData.isRead = isRead;

  const contact = await ContactMessage.findByIdAndUpdate(req.params.id, updateData, { new: true });
  if (!contact) {
    return res.status(404).json({ success: false, message: 'Message not found' });
  }
  sendSuccess(res, contact, 'Contact status updated successfully');
};

export const deleteContact = async (req: Request, res: Response) => {
  await ContactMessage.findByIdAndDelete(req.params.id);
  sendSuccess(res, null, 'Message deleted successfully');
};

// ==================== Job Positions & Careers ====================
export const getJobPositions = async (req: Request, res: Response) => {
  let positions = await JobPosition.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
  if (positions.length === 0) {
    // Seed default jobs
    await JobPosition.create([
      { title: 'استاد ریاضیات و فیزیک دانشگاهی', type: 'آنلاین / پاره‌وقت', department: 'آموزش', location: 'دورکاری', description: 'تدریس دروس ریاضیات پایه و مهندسی دانشگاهی با روش‌های جذاب و مفهومی', requirements: ['مدرک کارشناسی ارشد یا دکتری', 'حداقل ۳ سال سابقه تدریس', 'تسلط به ابزارهای قلم نوری و تدریس مجازی'], order: 1, isActive: true },
      { title: 'مدرس تخصصی برنامه‌نویسی (React & Next.js)', type: 'حضوری و آنلاین', department: 'فنی و مهندسی', location: 'تهران / دورکاری', description: 'آموزش پروژه‌محور فریم‌ورک‌های مدرن وب فرانت‌اند و ساخت اپلیکیشن‌های مقیاس‌پذیر', requirements: ['تسلط کامل بر React, TypeScript, Next.js', 'نمونه کارهای اجرایی و لینک گیت‌هاب', 'فن بیان قوی و روحیه انتقال دانش'], order: 2, isActive: true },
      { title: 'تولیدکننده محتوا و طراح آموزشی', type: 'پروژه‌ای / دورکاری', department: 'محتوا و رسانه', location: 'دورکاری', description: 'تدوین ویدیوهای آموزشی، آماده‌سازی اسلایدهای درسی و طراحی هویت محتوایی دوره‌ها', requirements: ['تسلط به Premiere یا AfterEffects', 'تسلط به فتوشاپ و فیگما', 'خلاقیت در ساختاربندی بصری مباحث آموزشی'], order: 3, isActive: true },
      { title: 'منتور و پشتیبان آموزشی دوره‌ها', type: 'دورکاری / تمام‌وقت', department: 'پشتیبانی دانشجویی', location: 'دورکاری', description: 'بررسی پروژه‌ها و تمرین‌های ارسالی دانشجویان، رفع اشکال آنلاین و نظارت بر پیشرفت کلاس', requirements: ['تسلط عمومی به مباحث فنی و مهندسی', 'حوصله و نظم بالا در تعامل با دانشجو', 'روابط عمومی عالی'], order: 4, isActive: true }
    ]);
    positions = await JobPosition.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
  }
  sendSuccess(res, positions, 'Job positions retrieved');
};

export const getAllJobPositionsAdmin = async (req: Request, res: Response) => {
  const positions = await JobPosition.find().sort({ order: 1, createdAt: -1 });
  sendSuccess(res, positions, 'All job positions retrieved');
};

export const createJobPosition = async (req: Request, res: Response) => {
  const position = await JobPosition.create(req.body);
  sendSuccess(res, position, 'Job position created successfully', 201);
};

export const updateJobPosition = async (req: Request, res: Response) => {
  const position = await JobPosition.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!position) {
    return res.status(404).json({ success: false, message: 'Position not found' });
  }
  sendSuccess(res, position, 'Job position updated successfully');
};

export const deleteJobPosition = async (req: Request, res: Response) => {
  await JobPosition.findByIdAndDelete(req.params.id);
  sendSuccess(res, null, 'Job position deleted successfully');
};

// ==================== Career Applications ====================
export const submitCareer = async (req: Request, res: Response) => {
  const application = await CareerApplication.create(req.body);
  sendSuccess(res, application, 'Application submitted successfully', 201);
};

export const getCareerApplicationsAdmin = async (req: Request, res: Response) => {
  const { status, search, page = 1, limit = 20 } = req.query;
  const filter: any = {};
  if (status && status !== 'all') {
    filter.status = status;
  }
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { mobile: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { specialty: { $regex: search, $options: 'i' } },
      { jobTitle: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [applications, total] = await Promise.all([
    CareerApplication.find(filter).populate('jobPositionId').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    CareerApplication.countDocuments(filter)
  ]);

  sendSuccess(res, { applications, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) }, 'Career applications retrieved');
};

export const updateCareerApplicationStatus = async (req: Request, res: Response) => {
  const { status, adminNotes } = req.body;
  const updateData: any = {};
  if (status) updateData.status = status;
  if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

  const app = await CareerApplication.findByIdAndUpdate(req.params.id, updateData, { new: true });
  if (!app) {
    return res.status(404).json({ success: false, message: 'Application not found' });
  }
  sendSuccess(res, app, 'Application status updated successfully');
};

export const deleteCareerApplication = async (req: Request, res: Response) => {
  await CareerApplication.findByIdAndDelete(req.params.id);
  sendSuccess(res, null, 'Application deleted successfully');
};
