import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Role } from '../modules/auth/role.model.js';
import { User } from '../modules/auth/user.model.js';

dotenv.config();

export async function migrateRolesAndUsers() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/tekyad';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for multi-role migration');
  }

  // 1. Ensure Partner Role
  const partnerRole = await Role.findOneAndUpdate(
    { slug: 'partner' },
    {
      name: 'شریک مؤسسه',
      slug: 'partner',
      description: 'شریک تجاری با دسترسی فقط‌خواندنی به پنل حسابداری و گزارش‌های مالی',
      permissions: ['accounting.view', 'reports.view'],
    },
    { upsert: true, new: true }
  );
  console.log('Partner role ensured:', partnerRole._id);

  // 2. Ensure Accountant Role
  const accountantRole = await Role.findOneAndUpdate(
    { slug: 'accountant' },
    {
      name: 'حسابدار',
      slug: 'accountant',
      description: 'حسابدار رسمی با دسترسی نظارتی به گزارش‌ها و تراکنش‌های مالی',
      permissions: ['accounting.view', 'accounting.reports', 'orders.view', 'settlements.view', 'payments.view'],
    },
    { upsert: true, new: true }
  );
  console.log('Accountant role ensured:', accountantRole._id);

  // 3. Migrate all existing users to ensure roles array is populated
  const users = await User.find({});
  let migratedCount = 0;
  for (const user of users) {
    let changed = false;
    const currentRoles: any[] = (user as any).roles || [];
    
    if (currentRoles.length === 0 && user.role) {
      (user as any).roles = [user.role];
      changed = true;
    } else if (currentRoles.length > 0 && !user.role) {
      user.role = currentRoles[0];
      changed = true;
    }

    if (changed) {
      await User.updateOne(
        { _id: user._id },
        { $set: { roles: (user as any).roles, role: user.role } }
      );
      migratedCount++;
    }
  }

  console.log(`Migrated ${migratedCount} users to multi-role structure (total ${users.length} users).`);
  return { success: true, migratedCount };
}

if (process.argv[1]?.endsWith('migrateMultiRoleAndNewRoles.js') || process.argv[1]?.endsWith('migrateMultiRoleAndNewRoles.ts')) {
  migrateRolesAndUsers()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
