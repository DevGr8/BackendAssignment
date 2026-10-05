const mongoose = require('mongoose');

// One Election document == one election category (e.g. "President", "Cultural Secretary").
const electionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    startTime: { type: Date, required: true },
    endTime: {
      type: Date,
      required: true,
      validate: {
        validator: function (v) { return v > this.startTime; },
        message: 'endTime must be after startTime',
      },
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Election', electionSchema);
