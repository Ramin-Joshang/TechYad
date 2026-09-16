const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tekyad');

async function fix() {
  const User = require('./backend/src/modules/auth/user.model').User;
  await User.updateMany(
    { avatar: { $regex: 'storage.techyad.mock' } },
    { $set: { avatar: '' } }
  );
  console.log('Fixed users');
  process.exit(0);
}
fix();
