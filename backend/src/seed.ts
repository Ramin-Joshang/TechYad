import mongoose from 'mongoose';
import argon2 from 'argon2';
import dotenv from 'dotenv';
import { User } from './modules/auth/user.model.js';
import { Role } from './modules/auth/role.model.js';

dotenv.config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tekyad');
    console.log('Connected to MongoDB');

    // Create Roles
    const adminRole = await Role.findOneAndUpdate(
      { slug: 'admin' },
      { name: 'مدیر', slug: 'admin', permissions: ['create_course', 'courses.publish', 'manage_users'] },
      { upsert: true, new: true }
    );
    
    const instructorRole = await Role.findOneAndUpdate(
      { slug: 'instructor' },
      { name: 'استاد', slug: 'instructor', permissions: ['create_course'] },
      { upsert: true, new: true }
    );
    
    const studentRole = await Role.findOneAndUpdate(
      { slug: 'student' },
      { name: 'دانشجو', slug: 'student', permissions: [] },
      { upsert: true, new: true }
    );

    // Common password
    const passwordHash = await argon2.hash('password123');

    // Create Users
    await User.findOneAndUpdate(
      { email: 'admin@tekyad.com' },
      {
        firstName: 'مدیر',
        lastName: 'سیستم',
        email: 'admin@tekyad.com',
        passwordHash,
        role: adminRole._id,
        emailVerified: true
      },
      { upsert: true }
    );

    await User.findOneAndUpdate(
      { email: 'instructor@tekyad.com' },
      {
        firstName: 'استاد',
        lastName: 'نمونه',
        email: 'instructor@tekyad.com',
        passwordHash,
        role: instructorRole._id,
        emailVerified: true
      },
      { upsert: true }
    );

    await User.findOneAndUpdate(
      { email: 'student@tekyad.com' },
      {
        firstName: 'دانشجو',
        lastName: 'کوشا',
        email: 'student@tekyad.com',
        passwordHash,
        role: studentRole._id,
        emailVerified: true
      },
      { upsert: true }
    );

    console.log('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
