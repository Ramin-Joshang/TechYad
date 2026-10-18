import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Class } from '../modules/classes/class.model.js';
import { Course } from '../modules/courses/course.model.js';
import { normalizePricing } from '../common/utils/pricing.js';

dotenv.config();

async function runMigration() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tekyad');
  console.log('Connected to MongoDB for Pricing Migration');

  const classes = await Class.find({});
  console.log(`Processing ${classes.length} classes...`);
  let updatedClasses = 0;
  for (const c of classes) {
    if (c.isFree) {
      if (c.price !== 0 || c.cashPrice !== 0 || c.installmentPrice !== 0) {
        c.price = 0;
        c.cashPrice = 0;
        c.installmentPrice = 0;
        await c.save();
        updatedClasses++;
      }
      continue;
    }

    const norm = normalizePricing({
      price: c.price,
      cashPrice: c.cashPrice,
      installmentPrice: c.installmentPrice,
      discountPrice: c.discountPrice,
      isFree: c.isFree,
    });

    let changed = false;
    if (c.cashPrice !== norm.cashPrice) {
      c.cashPrice = norm.cashPrice;
      changed = true;
    }
    if (c.installmentPrice !== norm.installmentPrice) {
      c.installmentPrice = norm.installmentPrice;
      changed = true;
    }
    if (c.price !== norm.price) {
      c.price = norm.price;
      changed = true;
    }

    if (changed) {
      await c.save();
      updatedClasses++;
      console.log(`Updated class "${c.title}" -> Cash: ${c.cashPrice}, Installment: ${c.installmentPrice}`);
    }
  }
  console.log(`Finished migrating classes: ${updatedClasses} updated.`);

  const courses = await Course.find({});
  console.log(`Processing ${courses.length} courses...`);
  let updatedCourses = 0;
  for (const c of courses) {
    if (c.isFree) {
      if (c.price !== 0 || c.cashPrice !== 0 || c.installmentPrice !== 0) {
        c.price = 0;
        c.cashPrice = 0;
        c.installmentPrice = 0;
        await c.save();
        updatedCourses++;
      }
      continue;
    }

    const norm = normalizePricing({
      price: c.price,
      cashPrice: c.cashPrice,
      installmentPrice: c.installmentPrice,
      discountPrice: c.discountPrice,
      isFree: c.isFree,
    });

    let changed = false;
    if (c.cashPrice !== norm.cashPrice) {
      c.cashPrice = norm.cashPrice;
      changed = true;
    }
    if (c.installmentPrice !== norm.installmentPrice) {
      c.installmentPrice = norm.installmentPrice;
      changed = true;
    }
    if (c.price !== norm.price) {
      c.price = norm.price;
      changed = true;
    }

    if (changed) {
      await c.save();
      updatedCourses++;
      console.log(`Updated course "${c.title}" -> Cash: ${c.cashPrice}, Installment: ${c.installmentPrice}`);
    }
  }
  console.log(`Finished migrating courses: ${updatedCourses} updated.`);

  process.exit(0);
}

runMigration().catch(err => {
  console.error('Pricing Migration failed:', err);
  process.exit(1);
});
