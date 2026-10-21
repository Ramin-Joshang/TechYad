import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function fix() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tecyad');
  const db = mongoose.connection.db;
  if (!db) {
    console.error('No DB');
    process.exit(1);
  }
  const roles = await db.collection('roles').find({}).toArray();
  const instructorRole = roles.find(r => r.slug === 'instructor');
  const partnerRole = roles.find(r => r.slug === 'partner');
  
  if (instructorRole && partnerRole) {
    const users = await db.collection('users').find({
      $or: [
        { roles: instructorRole._id },
        { email: 'mohammadhoseineslamitabar82@gmail.com' },
        { email: 'amirrezaramezani.2139@gmail.com' }
      ]
    }).toArray();

    for (const u of users) {
      console.log('Fixing user:', u.email, 'Current role:', u.role, 'roles:', u.roles);
      const rolesArr = (u.roles || []).map((r: any) => r.toString());
      if (!rolesArr.includes(instructorRole._id.toString())) rolesArr.push(instructorRole._id.toString());
      if (!rolesArr.includes(partnerRole._id.toString())) rolesArr.push(partnerRole._id.toString());
      
      await db.collection('users').updateOne(
        { _id: u._id },
        {
          $set: {
            role: instructorRole._id,
            roles: rolesArr.map((id: string) => new mongoose.Types.ObjectId(id)),
            canTeach: true
          }
        }
      );
    }
  }
  console.log('Fix completed successfully!');
  process.exit(0);
}
fix();
