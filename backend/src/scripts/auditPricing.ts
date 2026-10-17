import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Class } from '../modules/classes/class.model.js';
import { Course } from '../modules/courses/course.model.js';

dotenv.config();

async function runAudit() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tekyad');
  console.log('Connected to MongoDB');

  const classes = await Class.find({}).lean();
  console.log(`\n=== Found ${classes.length} classes ===`);
  for (const c of classes) {
    console.log(`Class: "${c.title}" | price: ${c.price} | discountPrice: ${c.discountPrice} | cashPrice: ${c.cashPrice} | isFree: ${c.isFree}`);
    
    // Check if class was accidentally price=0 or missing price
    let needsUpdate = false;
    const updateObj: any = {};

    if (c.price === 0 && !c.isFree) {
      console.warn(`Class ${c.title} has price 0 but isFree is not true!`);
    }

    // Ensure realistic pricing if price was 0 but should be paid
    if ((c.price === undefined || c.price === null || c.price === 0) && !c.isFree && !c.title.includes('رایگان')) {
      needsUpdate = true;
      updateObj.price = 850000;
      updateObj.discountPrice = 690000;
      updateObj.cashPrice = 690000;
      updateObj.installmentPrice = 900000;
      console.log(`Fixing zero price for paid class: ${c.title}`);
    }

    if (c.price > 0 && c.discountPrice && c.discountPrice >= c.price) {
      needsUpdate = true;
      updateObj.discountPrice = Math.round(c.price * 0.85); // 15% discount
      console.log(`Fixing invalid discountPrice >= price for class: ${c.title}`);
    }

    if (needsUpdate) {
      await Class.updateOne({ _id: c._id }, { $set: updateObj });
      console.log(`Updated class ${c._id}`);
    }
  }

  const courses = await Course.find({}).lean();
  console.log(`\n=== Found ${courses.length} courses ===`);
  for (const course of courses) {
    if (course.price === 0 && !course.isFree) {
      console.warn(`Course ${course.title} has price 0 but isFree is false`);
    }
  }

  console.log('\nAudit and price checks completed successfully.');
  process.exit(0);
}

runAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
