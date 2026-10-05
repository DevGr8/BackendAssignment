const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    department: { type: String, trim: true },
    manifesto: { type: String, trim: true },
    election: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Candidate', candidateSchema);
