require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

const makeAdmin = async () => {
  await connectDB();
  const email = process.argv[2];
  
  if (!email) {
    console.log('Usage: node make-admin.js <email>');
    process.exit(1);
  }

  try {
    const user = await User.findOneAndUpdate(
      { email },
      { role: 'admin', isVerified: true },
      { new: true }
    );

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log(`✅ User promoted to admin: ${user.email} (ID: ${user._id})`);
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

makeAdmin();
