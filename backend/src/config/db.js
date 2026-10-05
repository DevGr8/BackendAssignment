const mongoose = require('mongoose');
const Vote = require('../models/Vote');

module.exports = async function connectDB() {
  await mongoose.connect(process.env.MONGO_URI);
  // Make sure the unique (student + election) index exists before accepting votes.
  await Vote.init();
  console.log('MongoDB connected');
};
