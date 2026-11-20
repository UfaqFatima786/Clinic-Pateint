require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const NEW_PASSWORD = 'Doctor@123';
const EMAILS = [
  'ayesha.khan@clinic.com',
  'hassan.malik@clinic.com',
  'sara.ahmed@clinic.com',
  'omar.farooq@clinic.com',
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const hash = await bcrypt.hash(NEW_PASSWORD, 10);
    const res = await User.updateMany(
      { email: { $in: EMAILS }, role: 'doctor' },
      { $set: { password: hash } }
    );
    console.log(`Updated ${res.modifiedCount} doctors`);
    EMAILS.forEach((e) => console.log(`${e} / ${NEW_PASSWORD}`));
  } catch (err) {
    console.error('Failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();