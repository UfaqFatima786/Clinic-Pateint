// Run once: npm run seed   -> creates the admin account
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const ADMIN_EMAIL = 'admin@clinic.com';
const ADMIN_PASSWORD = 'admin123';

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const exists = await User.findOne({ email: ADMIN_EMAIL });
    if (exists) {
      console.log('Admin already exists:', ADMIN_EMAIL);
    } else {
      await User.create({
        name: 'Clinic Admin',
        email: ADMIN_EMAIL,
        password: await bcrypt.hash(ADMIN_PASSWORD, 10),
        role: 'admin',
      });
      console.log(`Admin created -> email: ${ADMIN_EMAIL}  password: ${ADMIN_PASSWORD}`);
    }
  } catch (err) {
    console.error(err.message);
  } finally {
    await mongoose.disconnect();
  }
})();
