import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../../auth/user.model.js';
import { Role } from '../../auth/role.model.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tecyad');
  await Role.find({});
  const users = await User.find().populate('role').populate('roles').lean();
  console.log('--- ALL USERS IN DB ---');
  for (const u of users) {
    const roleSlug = (u.role as any)?.slug;
    const roleSlugs = (u.roles as any[])?.map(r => r?.slug);
    console.log(`User: ${u.email} (${u.firstName} ${u.lastName}) | Primary: ${roleSlug} | Roles: ${JSON.stringify(roleSlugs)} | canTeach: ${u.canTeach}`);
  }
  process.exit(0);
}
run();
