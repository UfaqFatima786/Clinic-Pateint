require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const allowed = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim().replace(/\/$/, ''));

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowed.includes(origin)) return cb(null, true);
      return cb(new Error('Not allowed by CORS'));
    },
  })
);
app.use(express.json());

let connecting;
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;
  if (!connecting) connecting = mongoose.connect(process.env.MONGO_URI);
  try {
    await connecting;
  } catch (err) {
    connecting = null;
    throw err;
  }
};
app.get('/api/health', async (req, res) => {
  const info = {
    mongoUriSet: Boolean(process.env.MONGO_URI),
    mongoUriStartsWith: (process.env.MONGO_URI || '').slice(0, 14),
    jwtSecretSet: Boolean(process.env.JWT_SECRET),
    clientUrl: process.env.CLIENT_URL || null,
  };
  try {
    await connectDB();
    info.db = 'connected';
  } catch (err) {
    info.db = 'failed';
    info.error = err.message;
  }
  res.json(info);
});

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    res.status(500).json({ message: 'Database connection failed', detail: err.message });
  }
});

app.get('/', (req, res) => res.json({ message: 'Clinic API running' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/admin', require('./routes/admin'));

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  connectDB()
    .then(() => {
      console.log('MongoDB connected');
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
      console.error('MongoDB connection failed:', err.message);
      process.exit(1);
    });
}

module.exports = app;