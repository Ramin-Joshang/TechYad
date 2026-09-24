import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Course } from "../courses/course.model.js";
import { Category } from "../catalog/category.model.js";
import { Article } from "../blog/article.model.js";
import { InstructorProfile } from "../instructors/instructor-profile.model.js";
import { Testimonial } from "./testimonial.model.js";
import { User } from "../auth/user.model.js";
import { Role } from "../auth/role.model.js";

// Mock data seeder
const seedData = async () => {
  const courseCount = await Course.countDocuments();
  if (courseCount > 0) return; // Already seeded

  console.log("Seeding initial data...");

  // Get some user to be creator
  let user = await User.findOne();
  if (!user) {
    const role = await Role.findOne();
    user = await User.create({
      firstName: "Admin",
      lastName: "User",
      email: "admin@tecyad.ir",
      passwordHash: "dummyHash",
      role: role?._id,
    });
  }

  // Create Categories
  const cat1 = await Category.create({ name: "برنامه‌نویسی", slug: "programming", description: "آموزش زبان‌های برنامه‌نویسی" });
  const cat2 = await Category.create({ name: "طراحی سایت", slug: "web-design", description: "آموزش طراحی و توسعه وب" });
  const cat3 = await Category.create({ name: "هوش مصنوعی", slug: "ai", description: "آموزش ماشین لرنینگ و دیپ لرنینگ" });
  const cat4 = await Category.create({ name: "شبکه و امنیت", slug: "network-security", description: "آموزش شبکه و امنیت اطلاعات" });

  // Create Instructors
  const inst1 = await InstructorProfile.create({
    userId: user._id,
    title: "مهندس نرم‌افزار",
    bio: "متخصص توسعه وب و مدرس برنامه‌نویسی با ۱۰ سال سابقه",
    avatar: "https://i.pravatar.cc/150?u=inst1",
    specialties: ["React", "Node.js", "TypeScript"],
    education: [],
    socialLinks: {},
    isApproved: true,
  });

  // Create Courses
  const coursesData = [
    { title: "دوره جامع متخصص React", slug: "react-masterclass", price: 1500000, categoryId: cat1._id, tags: ["آنلاین", "React", "Frontend"], isNew: false },
    { title: "آموزش صفر تا صد Node.js", slug: "nodejs-zero-to-hero", price: 1200000, categoryId: cat1._id, tags: ["آنلاین", "Node.js", "Backend"], isNew: true },
    { title: "یادگیری عمیق با پایتون", slug: "deep-learning-python", price: 2000000, categoryId: cat3._id, tags: ["حضوری", "Python", "AI"], isNew: true },
    { title: "مبانی طراحی رابط کاربری (UI/UX)", slug: "ui-ux-basics", price: 0, categoryId: cat2._id, tags: ["آنلاین", "UI", "UX", "رایگان"], isNew: false },
    { title: "آموزش جامع امنیت شبکه", slug: "network-security-pro", price: 1800000, categoryId: cat4._id, tags: ["حضوری", "Network", "Security"], isNew: false },
    { title: "دوره رایگان شروع با HTML/CSS", slug: "html-css-starter", price: 0, categoryId: cat2._id, tags: ["آنلاین", "HTML", "CSS", "رایگان"], isNew: true },
  ];

  for (const cData of coursesData) {
    await Course.create({
      title: cData.title,
      slug: cData.slug,
      shortDescription: "یک دوره عالی و کاربردی برای ورود به بازار کار",
      thumbnail: `https://picsum.photos/seed/${cData.slug}/400/250`,
      instructors: [user._id],
      categoryId: cData.categoryId,
      price: cData.price,
      totalDuration: 1200,
      totalLessons: 24,
      tags: cData.tags,
      status: "published",
      createdBy: user._id,
      publishedAt: new Date(),
    });
  }

  // Create Articles
  const articlesData = [
    { title: "چگونه برنامه‌نویسی را شروع کنیم؟", slug: "how-to-start-programming" },
    { title: "بهترین فریم‌ورک‌های فرانت‌اند در ۲۰۲۴", slug: "best-frontend-frameworks-2024" },
    { title: "آینده هوش مصنوعی در توسعه نرم‌افزار", slug: "ai-future-in-software" },
  ];

  for (const aData of articlesData) {
    await Article.create({
      title: aData.title,
      slug: aData.slug,
      excerpt: "مقاله‌ای جذاب درباره دنیای تکنولوژی و برنامه‌نویسی",
      content: "متن کامل مقاله در اینجا قرار می‌گیرد...",
      thumbnail: `https://picsum.photos/seed/${aData.slug}/400/250`,
      authorId: user._id,
      tags: ["تکنولوژی", "برنامه‌نویسی"],
      status: "published",
      publishedAt: new Date(),
    });
  }

  // Create Testimonials
  await Testimonial.create([
    { studentName: "علی احمدی", courseName: "متخصص React", avatar: "https://i.pravatar.cc/150?u=ali", content: "بهترین دوره‌ای که تا حالا دیدم. استاد بسیار مسلط بودند.", rating: 5 },
    { studentName: "سارا محمدی", courseName: "Node.js", avatar: "https://i.pravatar.cc/150?u=sara", content: "مطالب خیلی خوب و کاربردی بیان شده بود.", rating: 4 },
    { studentName: "رضا حسینی", courseName: "طراحی UI/UX", avatar: "https://i.pravatar.cc/150?u=reza", content: "پروژه محور بودن دوره خیلی به یادگیریم کمک کرد.", rating: 5 },
  ]);

  console.log("Mock data seeded successfully.");
};

export const getHomeData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (mongoose.connection.readyState !== 1) {
       return res.status(503).json({
          success: false,
          message: "Database connection is not established. Please ensure MongoDB is running locally (port 27017) or check your MONGO_URI.",
          data: {}
       });
    }

    await seedData();

    const categories = await Category.find({ isActive: true }).limit(8);
    const popularCourses = await Course.find({ status: "published" }).sort({ totalLessons: -1 }).limit(4).populate('instructors', 'firstName lastName avatar');
    const newCourses = await Course.find({ status: "published" }).sort({ createdAt: -1 }).limit(4).populate('instructors', 'firstName lastName avatar');
    const freeCourses = await Course.find({ status: "published", price: 0 }).limit(4).populate('instructors', 'firstName lastName avatar');
    const onlineClasses = await Course.find({ status: "published", tags: "آنلاین" }).limit(4).populate('instructors', 'firstName lastName avatar');
    const inPersonClasses = await Course.find({ status: "published", tags: "حضوری" }).limit(4).populate('instructors', 'firstName lastName avatar');
    const topInstructors = await InstructorProfile.find({ isApproved: true }).limit(4).populate('userId', 'firstName lastName avatar');
    const latestArticles = await Article.find({ status: "published" }).sort({ createdAt: -1 }).limit(4);
    const testimonials = await Testimonial.find().limit(6);

    res.status(200).json({
      success: true,
      data: {
        categories,
        popularCourses,
        newCourses,
        freeCourses,
        onlineClasses,
        inPersonClasses,
        topInstructors,
        latestArticles,
        testimonials,
      }
    });
  } catch (error) {
    console.error("Error in getHomeData:", error);
    next(error);
  }
};
