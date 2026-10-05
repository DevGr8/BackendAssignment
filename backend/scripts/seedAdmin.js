require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('../src/models/Student');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const email = process.env.ADMIN_EMAIL;
  if (await Student.findOne({ email })) {
    console.log('Admin already exists');
  } else {
    await Student.create({ name: 'Election Admin', email, password: process.env.ADMIN_PASSWORD, role: 'admin' });
    console.log(`Admin created: ${email}`);
  }
  await mongoose.disconnect();
})();
