const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    election: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Core integrity rule: one vote per student per election, enforced by MongoDB itself.
voteSchema.index({ student: 1, election: 1 }, { unique: true });
// Speeds up result counting.
voteSchema.index({ election: 1, candidate: 1 });

// ---- Immutability: a cast vote can never be edited or removed through Mongoose ----
const immutable = async function () {
  throw new Error('Votes are immutable and cannot be modified or deleted');
};
[
  'updateOne', 'updateMany', 'findOneAndUpdate', 'findOneAndReplace', 'replaceOne',
  'deleteMany', 'findOneAndDelete',
].forEach((op) => voteSchema.pre(op, immutable));

voteSchema.pre('deleteOne', { document: true, query: true }, immutable);
voteSchema.pre('save', async function () {
  if (!this.isNew) throw new Error('Votes are immutable and cannot be modified');
});

module.exports = mongoose.model('Vote', voteSchema);
