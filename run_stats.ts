import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { AdminService } from './backend/src/modules/admin/admin.service.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://admin:admin@cluster0.mongodb.net/test?retryWrites=true&w=majority');
  try {
    const stats = await AdminService.getDashboardStats();
    console.log(stats);
  } catch (e) {
    console.error(e);
  }
  mongoose.disconnect();
}
run();
