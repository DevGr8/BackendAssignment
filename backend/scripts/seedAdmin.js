require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('../src/models/Student');

(async () => {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not set');
  if (!email || !password) throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set');

  await mongoose.connect(process.env.MONGO_URI);
  const existing = await Student.findOne({ email });

  if (!existing) {
    await Student.create({ name: 'Election Admin', email, password, role: 'admin' });
    console.log(`Admin created: ${email}`);
  } else if (existing.role !== 'admin') {
    existing.role = 'admin';
    await existing.save();
    console.log(`Existing account promoted to admin: ${email} (password unchanged)`);
  } else {
    console.log(`Admin already exists: ${email} (password unchanged)`);
  }
})()
  .catch((err) => { console.error('Seed failed:', err.message); process.exitCode = 1; })
  .finally(() => mongoose.disconnect());