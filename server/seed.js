require('dotenv').config();
const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const ADMIN_EMAIL = 'admin@clinic.com';
const ADMIN_PASSWORD = 'admin123';
const DEMO_DOCTORS = [
  {
    name: 'Dr. Ayesha Khan',
    email: 'ayesha.khan@clinic.com',
    specialization: 'Cardiology',
    experience: 8,
  },
  {
    name: 'Dr. Hassan Malik',
    email: 'hassan.malik@clinic.com',
    specialization: 'Dermatology',
    experience: 6,
  },
  {
    name: 'Dr. Sara Ahmed',
    email: 'sara.ahmed@clinic.com',
    specialization: 'Pediatrics',
    experience: 10,
  },
  {
    name: 'Dr. Omar Farooq',
    email: 'omar.farooq@clinic.com',
    specialization: 'Neurology',
    experience: 5,
  },
];
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
    const existingDoctors = new Set(
      (
        await User.find({ email: { $in: DEMO_DOCTORS.map((doctor) => doctor.email) } })
          .select('email')
          .lean()
      ).map((doctor) => doctor.email)
    );
    const createdDoctors = [];
    for (const doctor of DEMO_DOCTORS) {
      if (existingDoctors.has(doctor.email)) continue;
      const password = crypto.randomBytes(18).toString('base64url');
      await User.create({
        ...doctor,
        password: await bcrypt.hash(password, 10),
        role: 'doctor',
      });
      createdDoctors.push({ email: doctor.email, password });
    }
    if (createdDoctors.length) {
      console.log('Demo doctor accounts created. Save these generated passwords:');
      createdDoctors.forEach(({ email, password }) => console.log(`${email} / ${password}`));
    } else {
      console.log('Demo doctor accounts already exist; no duplicate accounts were created.');
    }
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  }
})();
