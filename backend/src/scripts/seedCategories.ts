import { connectDB } from '../config/database.js';
import { Category } from '../modules/catalog/category.model.js';
import { Course } from '../modules/courses/course.model.js';
import { Class } from '../modules/classes/class.model.js';
import { User } from '../modules/auth/user.model.js';
import mongoose from 'mongoose';

async function seedCategories() {
  await connectDB();
  console.log('Seeding / Migrating Categories...');

  const categoryTreeDef = [
    {
      name: 'برنامه‌نویسی و توسعه نرم‌افزار',
      slug: 'programming',
      description: 'یادگیری جامع زبان‌های برنامه‌نویسی، فریم‌ورک‌های مدرن فرانت‌اند، بک‌اند و توسعه فول‌استک برای ورود به بازار کار',
      icon: 'Code2',
      sortOrder: 1,
      children: [
        {
          name: 'توسعه فرانت‌اند (Front-End)',
          slug: 'frontend',
          description: 'طراحی و ساخت صفحات وب مدرن و تعاملی با جاوااسکریپت و ری‌اکت',
          icon: 'Layout',
          sortOrder: 1,
          children: [
            {
              name: 'React & Next.js',
              slug: 'react',
              description: 'دوره‌ها و کلاس‌های تخصصی فریم‌ورک ری‌اکت و نکست جی‌اس',
              sortOrder: 1,
            },
            {
              name: 'JavaScript & TypeScript',
              slug: 'javascript',
              description: 'مفاهیم پایه و پیشرفته زبان جاوااسکریپت و تایپ‌اسکریپت مدرن',
              sortOrder: 2,
            },
            {
              name: 'HTML & CSS',
              slug: 'html-css',
              description: 'پایه‌های طراحی وب، استایل‌دهی مدرن با Tailwind CSS و Flex/Grid',
              sortOrder: 3,
            },
          ]
        },
        {
          name: 'توسعه بک‌اند (Back-End)',
          slug: 'backend',
          description: 'ساخت سرورهای مقیاس‌پذیر، معماری میکروسرویس، پایگاه‌های داده و APIها',
          icon: 'Server',
          sortOrder: 2,
          children: [
            {
              name: 'Node.js',
              slug: 'nodejs',
              description: 'توسعه وب سرورها و میکروسرویس‌ها با Node.js و Express',
              sortOrder: 1,
            },
            {
              name: 'Python',
              slug: 'python',
              description: 'برنامه‌نویسی پایتون برای وب، اسکریپت‌نویسی و هوش مصنوعی',
              sortOrder: 2,
            },
          ]
        },
        {
          name: 'توسعه فول‌استک (Full-Stack)',
          slug: 'fullstack',
          description: 'تسلط همزمان بر توسعه سمت کلاینت و سرور',
          icon: 'Layers',
          sortOrder: 3,
        }
      ]
    },
    {
      name: 'هوش مصنوعی و علوم داده',
      slug: 'artificial-intelligence',
      description: 'دوره‌ها و کلاس‌های تخصصی یادگیری ماشین، یادگیری عمیق، پردازش زبان طبیعی و علوم داده',
      icon: 'Brain',
      sortOrder: 2,
      children: [
        {
          name: 'یادگیری عمیق (Deep Learning)',
          slug: 'deep-learning',
          description: 'شبکه‌های عصبی مصنوعی، بینایی ماشین و پردازش صوت با پایتون و PyTorch',
          sortOrder: 1,
        },
        {
          name: 'یادگیری ماشین (Machine Learning)',
          slug: 'machine-learning',
          description: 'الگوریتم‌های کلاسیک یادگیری ماشین، رگرسیون، کلاسترینگ و یادگیری تقویتی',
          sortOrder: 2,
        },
        {
          name: 'علم داده و تحلیل داده (Data Science)',
          slug: 'data-science',
          description: 'تحلیل آماری، Pandas، تجسم داده‌ها و هوش تجاری',
          sortOrder: 3,
        }
      ]
    },
    {
      name: 'طراحی و تجربه کاربری (UI/UX)',
      slug: 'design-ui-ux',
      description: 'طراحی رابط کاربری، تحقیقات کاربر، فیگما و متدهای خلق تجربه کاربری ایده‌آل',
      icon: 'Palette',
      sortOrder: 3,
      children: [
        {
          name: 'طراحی رابط کاربری (UI Design)',
          slug: 'ui-design',
          description: 'طراحی المان‌ها، دیزاین سیستم، تایپوگرافی و کار حرفه‌ای با Figma',
          sortOrder: 1,
        },
        {
          name: 'تحقیقات و تجربه کاربری (UX Research)',
          slug: 'ux-research',
          description: 'تست‌های کاربردپذیری، نقشه سفر کاربر و معماری اطلاعات',
          sortOrder: 2,
        }
      ]
    },
    {
      name: 'شبکه و امنیت اطلاعات',
      slug: 'network-security',
      description: 'مباحث تخصصی امنیت سایبری، کانفیگ سرورهای لینوکس، دوره‌های سیسکو و هک اخلاقی',
      icon: 'Shield',
      sortOrder: 4,
      children: [
        {
          name: 'امنیت سایبری و تست نفوذ',
          slug: 'cyber-security',
          description: 'تست نفوذ وب، امنیت شبکه و تحلیل آسیب‌پذیری‌ها',
          sortOrder: 1,
        },
        {
          name: 'لینوکس و دواپس (DevOps)',
          slug: 'devops-linux',
          description: 'مدیریت سرورهای لینوکسی، داکر، CI/CD و اتوماسیون استقرار',
          sortOrder: 2,
        }
      ]
    }
  ];

  // Map to store created/found category by slug
  const categoryBySlug = new Map<string, any>();

  async function processCategory(catDef: any, parentId: any = null, level: number = 0) {
    let cat = await Category.findOne({ slug: catDef.slug });
    if (!cat) {
      cat = await Category.create({
        name: catDef.name,
        slug: catDef.slug,
        parentId,
        level,
        description: catDef.description || '',
        icon: catDef.icon || '',
        sortOrder: catDef.sortOrder || 0,
        isActive: true,
        seoTitle: `دوره‌ها و کلاس‌های ${catDef.name} | تک‌یاد`,
        seoDescription: catDef.description || `فهرست جامع دوره‌ها و کارگاه‌های آنلاین ${catDef.name}`,
      });
      console.log(` Created category: ${cat.name} (level: ${level}, slug: ${cat.slug})`);
    } else {
      // Ensure level and parentId are up to date
      cat.name = catDef.name;
      cat.parentId = parentId;
      cat.level = level;
      if (catDef.description) cat.description = catDef.description;
      if (catDef.icon) cat.icon = catDef.icon;
      cat.isActive = true;
      await cat.save();
      console.log(`✓ Updated category: ${cat.name} (level: ${level}, slug: ${cat.slug})`);
    }

    categoryBySlug.set(cat.slug, cat);

    if (Array.isArray(catDef.children)) {
      for (const childDef of catDef.children) {
        await processCategory(childDef, cat._id, level + 1);
      }
    }
  }

  for (const rootCat of categoryTreeDef) {
    await processCategory(rootCat, null, 0);
  }

  console.log(`Total categories in map: ${categoryBySlug.size}`);

  // Map existing courses to appropriate categories
  const courseMappings: Record<string, string> = {
    'react-masterclass': 'react',
    'nodejs-zero-to-hero': 'nodejs',
    'deep-learning-python': 'deep-learning',
    'ui-ux-basics': 'ui-design',
    'network-security-pro': 'cyber-security',
    'html-css-starter': 'html-css',
  };

  for (const [courseSlug, targetCatSlug] of Object.entries(courseMappings)) {
    const targetCat = categoryBySlug.get(targetCatSlug);
    if (targetCat) {
      const updateResult = await Course.updateMany(
        { slug: courseSlug },
        { $set: { categoryId: targetCat._id } }
      );
      console.log(`Mapped course ${courseSlug} -> category ${targetCat.name} (${updateResult.modifiedCount} updated)`);
    }
  }

  // Find instructor user to assign to classes
  let instructorUser = await User.findOne({ email: 'instructor@tecyad.ir' });
  if (!instructorUser) {
    instructorUser = await User.findOne();
  }

  // Create sample classes if classes collection has few or none
  const existingClassesCount = await Class.countDocuments();
  if (existingClassesCount === 0 && instructorUser) {
    console.log('Seeding sample published classes with categories...');
    const now = new Date();
    const inTwoDays = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const inFiveDays = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
    const inSevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const sampleClasses = [
      {
        title: 'کارگاه تعاملی ساخت میکروسرویس با Node.js و Docker',
        slug: 'nodejs-microservices-workshop',
        description: 'کارگاه پروژه محور آنلاین برای پیاده‌سازی معماری میکروسرویس واقعی به همراه داکر و صف پیام RabbitMQ با اساتید مطرح صنعت',
        shortDescription: 'پیاده‌سازی میکروسرویس‌های واقعی با Node.js و داکر',
        type: 'public',
        mode: 'online',
        instructors: [instructorUser._id],
        categoryId: categoryBySlug.get('nodejs')?._id || categoryBySlug.get('backend')?._id,
        price: 850000,
        discountPrice: 680000,
        capacity: 25,
        startDate: inTwoDays,
        endDate: new Date(inTwoDays.getTime() + 14 * 24 * 60 * 60 * 1000),
        sessions: 4,
        totalHours: 12,
        allowPreRegistration: true,
        preRegistrationDeposit: 200000,
        status: 'published',
        registrationOpen: true,
        createdBy: instructorUser._id,
        scheduleDays: ['پنج‌شنبه', 'جمعه'],
        scheduleTime: '۱۸:۰۰ الی ۲۱:۰۰',
        meetingPlatform: 'اسکای‌روم',
        meetingLink: 'https://www.skyroom.online/ch/tecyad/nodejs-live',
        thumbnail: 'https://picsum.photos/seed/nodejs-class/800/500',
        syllabus: [
          { sessionNumber: 1, title: 'معماری مایکروسرویس و شکستن مونولیت', date: '۱۴۰۵/۰۴/۱۰', time: '۱۸:۰۰', durationMinutes: 180 },
          { sessionNumber: 2, title: 'داکرایز کردن سرویس‌ها و Docker Compose', date: '۱۴۰۵/۰۴/۱۱', time: '۱۸:۰۰', durationMinutes: 180 },
          { sessionNumber: 3, title: 'ارتباطات ناهمگام با RabbitMQ', date: '۱۴۰۵/۰۴/۱۷', time: '۱۸:۰۰', durationMinutes: 180 },
          { sessionNumber: 4, title: 'مانیتورینگ و تست End-to-End', date: '۱۴۰۵/۰۴/۱۸', time: '۱۸:۰۰', durationMinutes: 180 },
        ]
      },
      {
        title: 'کلاس آنلاین تسلط بر React 19 و معماری Server Components',
        slug: 'react-19-server-components-live',
        description: 'جلسات رفع اشکال و تمرین زنده پیرامون امکانات جدید React 19، کامپوننت‌های سمت سرور و بهینه‌سازی پرفورمنس وب اپلیکیشن‌ها',
        shortDescription: 'بررسی عمیق ویژگی‌های جدید React 19 با تمرینات عملی',
        type: 'public',
        mode: 'online',
        instructors: [instructorUser._id],
        categoryId: categoryBySlug.get('react')?._id || categoryBySlug.get('frontend')?._id,
        price: 950000,
        discountPrice: 750000,
        capacity: 30,
        startDate: inFiveDays,
        endDate: new Date(inFiveDays.getTime() + 21 * 24 * 60 * 60 * 1000),
        sessions: 6,
        totalHours: 15,
        allowPreRegistration: false,
        preRegistrationDeposit: 0,
        status: 'published',
        registrationOpen: true,
        createdBy: instructorUser._id,
        scheduleDays: ['دوشنبه', 'چهارشنبه'],
        scheduleTime: '۱۹:۰۰ الی ۲۱:۳۰',
        meetingPlatform: 'گوگل میت',
        meetingLink: 'https://meet.google.com/xyz-tecyad-live',
        thumbnail: 'https://picsum.photos/seed/react-class/800/500',
        syllabus: [
          { sessionNumber: 1, title: 'مفاهیم بنیادی React Server Components', date: '۱۴۰۵/۰۴/۱۵', time: '۱۹:۰۰', durationMinutes: 150 },
          { sessionNumber: 2, title: 'اکشن‌های سرور (Server Actions) و هوک‌های فرم', date: '۱۴۰۵/۰۴/۱۷', time: '۱۹:۰۰', durationMinutes: 150 },
          { sessionNumber: 3, title: 'بهینه‌سازی حافظه و معماری کلاینت/سرور', date: '۱۴۰۵/۰۴/۲۲', time: '۱۹:۰۰', durationMinutes: 150 },
        ]
      },
      {
        title: 'کارگاه حضوری طراحی سیستم‌های دیزاین با Figma',
        slug: 'figma-design-systems-in-person',
        description: 'کارگاه عملی حضوری ۲ روزه در تهران برای طراحی متمرکز توکن‌های طراحی، کامپوننت‌های پیشرفته و کتابخانه‌های مقیاس‌پذیر در Figma',
        shortDescription: 'طراحی دیزاین سیستم مقیاس‌پذیر در فیگما به صورت حضوری',
        type: 'public',
        mode: 'in_person',
        instructors: [instructorUser._id],
        categoryId: categoryBySlug.get('ui-design')?._id || categoryBySlug.get('design-ui-ux')?._id,
        price: 1200000,
        discountPrice: 990000,
        capacity: 15,
        startDate: inSevenDays,
        endDate: new Date(inSevenDays.getTime() + 7 * 24 * 60 * 60 * 1000),
        sessions: 2,
        totalHours: 16,
        allowPreRegistration: true,
        preRegistrationDeposit: 300000,
        status: 'published',
        registrationOpen: true,
        city: 'تهران',
        location: 'دانشکده فنی، سالن کارگاه‌های فناوری',
        address: 'تهران، میدان ونک، خیابان ملاصدرا، پردیس نوآوری تک‌یاد',
        createdBy: instructorUser._id,
        scheduleDays: ['پنج‌شنبه', 'جمعه'],
        scheduleTime: '۰۹:۰۰ الی ۱۷:۰۰',
        thumbnail: 'https://picsum.photos/seed/figma-class/800/500',
        syllabus: [
          { sessionNumber: 1, title: 'ساختارهای Design Token و متغیرها در Figma', date: '۱۴۰۵/۰۴/۲۴', time: '۰۹:۰۰', durationMinutes: 480 },
          { sessionNumber: 2, title: 'کامپوننت‌های پیشرفته، Auto Layout 5 و مستندسازی', date: '۱۴۰۵/۰۴/۲۵', time: '۰۹:۰۰', durationMinutes: 480 },
        ]
      }
    ];

    for (const c of sampleClasses) {
      await Class.create(c as any);
      console.log(` Created sample class: ${c.title}`);
    }
  }

  console.log('✅ Seeding & Migration finished successfully!');
  process.exit(0);
}

seedCategories().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
