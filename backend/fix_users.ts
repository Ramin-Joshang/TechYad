import mongoose from 'mongoose';
import { User } from './src/modules/auth/user.model.js';
import dotenv from 'dotenv';
dotenv.config();

async function fix() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tekyad');
  await User.updateMany(
    { avatar: { $regex: 'storage.techyad.mock' } },
    { $set: { avatar: '' } }
  );
  console.log('Fixed users');
  process.exit(0);
}
fix();
