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

    // Permissions list
    const adminPermissions = [
      'admin.access',
      'users.read', 'users.manage',
      'courses.read', 'courses.manage', 'courses.publish',
      'orders.read', 'orders.manage',
      'coupons.manage',
      'blog.manage',
      'classes.manage',
      'tickets.manage',
      'reviews.manage',
      'comments.manage',
      'reports.read',
      'catalog.manage',
      'community.manage',
    ];

    const instructorPermissions = [
      'create_course',
      'courses.manage',
      'create_class',
      'classes.manage',
    ];

    // Create Roles
    const superAdminRole = await Role.findOneAndUpdate(
      { slug: 'super-admin' },
      { name: 'مدیر کل', slug: 'super-admin', permissions: adminPermissions },
      { upsert: true, returnDocument: 'after' }
    );

    const adminRole = await Role.findOneAndUpdate(
      { slug: 'admin' },
      { name: 'مدیر', slug: 'admin', permissions: adminPermissions },
      { upsert: true, returnDocument: 'after' }
    );

    const instructorRole = await Role.findOneAndUpdate(
      { slug: 'instructor' },
      { name: 'استاد', slug: 'instructor', permissions: instructorPermissions },
      { upsert: true, returnDocument: 'after' }
    );
    
    const supportRole = await Role.findOneAndUpdate(
      { slug: 'support' },
      { name: 'پشتیبان', slug: 'support', permissions: ['tickets.manage', 'comments.manage', 'admin.access'] },
      { upsert: true, returnDocument: 'after' }
    );

    const studentRole = await Role.findOneAndUpdate(
      { slug: 'student' },
      { name: 'دانشجو', slug: 'student', permissions: [] },
      { upsert: true, returnDocument: 'after' }
    );

    // Common password
    const passwordHash = await argon2.hash('password123');

    // Create Users
    await User.findOneAndUpdate(
      { email: 'superadmin@tekyad.com' },
      {
        firstName: 'سوپر',
        lastName: 'ادمین',
        email: 'superadmin@tekyad.com',
        passwordHash,
        role: superAdminRole._id,
        status: 'active',
        emailVerified: true
      },
      { upsert: true, returnDocument: 'after' }
    );

    await User.findOneAndUpdate(
      { email: 'admin@tekyad.com' },
      {
        firstName: 'مدیر',
        lastName: 'سیستم',
        email: 'admin@tekyad.com',
        passwordHash,
        role: adminRole._id,
        status: 'active',
        emailVerified: true
      },
      { upsert: true, returnDocument: 'after' }
    );

    await User.findOneAndUpdate(
      { email: 'instructor@tekyad.com' },
      {
        firstName: 'استاد',
        lastName: 'نمونه',
        email: 'instructor@tekyad.com',
        passwordHash,
        role: instructorRole._id,
        status: 'active',
        emailVerified: true
      },
      { upsert: true, returnDocument: 'after' }
    );

    await User.findOneAndUpdate(
      { email: 'student@tekyad.com' },
      {
        firstName: 'دانشجو',
        lastName: 'کوشا',
        email: 'student@tekyad.com',
        passwordHash,
        role: studentRole._id,
        status: 'active',
        emailVerified: true
      },
      { upsert: true, returnDocument: 'after' }
    );

    console.log('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}
seed();
