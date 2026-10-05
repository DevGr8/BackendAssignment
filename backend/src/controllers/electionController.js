const mongoose = require('mongoose');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');

const statusOf = (e, now = new Date()) =>
  now < e.startTime ? 'upcoming' : now > e.endTime ? 'closed' : 'open';

// POST /elections  (admin)
exports.createElection = async (req, res, next) => {
  try {
    const { title, description, startTime, endTime, candidates = [] } = req.body;
    if (!title || !startTime || !endTime) {
      return res.status(400).json({ message: 'title, startTime and endTime are required' });
    }
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (isNaN(start) || isNaN(end)) return res.status(400).json({ message: 'Invalid date format' });
    if (end <= start) return res.status(400).json({ message: 'endTime must be after startTime' });

    const election = await Election.create({
      title, description, startTime: start, endTime: end, createdBy: req.user._id,
    });
    let created = [];
    if (Array.isArray(candidates) && candidates.length) {
      created = await Candidate.insertMany(
        candidates.map((c) => ({ name: c.name, department: c.department, manifesto: c.manifesto, election: election._id }))
      );
    }
    res.status(201).json({ election, candidates: created });
  } catch (err) { next(err); }
};

// POST /elections/:id/candidates  (admin) - only before voting starts
exports.addCandidate = async (req, res, next) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found' });
    if (new Date() >= election.startTime) {
      return res.status(403).json({ message: 'Candidates cannot be added once voting has started' });
    }
    const { name, department, manifesto } = req.body;
    if (!name) return res.status(400).json({ message: 'Candidate name is required' });
    const candidate = await Candidate.create({ name, department, manifesto, election: election._id });
    res.status(201).json(candidate);
  } catch (err) { next(err); }
};

// GET /elections  (any logged-in user) - includes status + whether *I* have voted
exports.listElections = async (req, res, next) => {
  try {
    const elections = await Election.find().sort({ startTime: -1 }).lean();
    const myVotes = await Vote.find({ student: req.user._id }).select('election').lean();
    const voted = new Set(myVotes.map((v) => String(v.election)));
    res.json(elections.map((e) => ({ ...e, status: statusOf(e), hasVoted: voted.has(String(e._id)) })));
  } catch (err) { next(err); }
};

// GET /elections/:id
exports.getElection = async (req, res, next) => {
  try {
    const election = await Election.findById(req.params.id).lean();
    if (!election) return res.status(404).json({ message: 'Election not found' });
    const candidates = await Candidate.find({ election: election._id }).lean();
    const hasVoted = !!(await Vote.exists({ student: req.user._id, election: election._id }));
    res.json({ ...election, status: statusOf(election), hasVoted, candidates });
  } catch (err) { next(err); }
};

// POST /elections/:id/vote  (student)
exports.castVote = async (req, res, next) => {
  try {
    const { candidateId } = req.body;
    if (!candidateId || !mongoose.isValidObjectId(candidateId)) {
      return res.status(400).json({ message: 'A valid candidateId is required' });
    }

    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found' });

    // Time-window validation (server clock is the source of truth)
    const now = new Date();
    if (now < election.startTime) return res.status(403).json({ message: 'Voting has not started yet' });
    if (now > election.endTime) return res.status(403).json({ message: 'Voting has ended' });

    // Candidate must belong to THIS election
    const candidate = await Candidate.findOne({ _id: candidateId, election: election._id });
    if (!candidate) return res.status(400).json({ message: 'Candidate does not belong to this election' });

    try {
      await Vote.create({ student: req.user._id, election: election._id, candidate: candidate._id });
    } catch (err) {
      // Unique compound index (student + election) rejected a second vote
      if (err.code === 11000) {
        return res.status(409).json({ message: 'You have already voted in this election' });
      }
      throw err;
    }
    res.status(201).json({ message: 'Vote recorded successfully' });
  } catch (err) { next(err); }
};

// GET /elections/:id/results  (admin) - live counts
exports.getResults = async (req, res, next) => {
  try {
    const election = await Election.findById(req.params.id).lean();
    if (!election) return res.status(404).json({ message: 'Election not found' });

    const [candidates, counts] = await Promise.all([
      Candidate.find({ election: election._id }).lean(),
      Vote.aggregate([
        { $match: { election: election._id } },
        { $group: { _id: '$candidate', votes: { $sum: 1 } } },
      ]),
    ]);
    const map = new Map(counts.map((c) => [String(c._id), c.votes]));
    const results = candidates
      .map((c) => ({ candidateId: c._id, name: c.name, department: c.department, votes: map.get(String(c._id)) || 0 }))
      .sort((a, b) => b.votes - a.votes);
    const totalVotes = results.reduce((s, r) => s + r.votes, 0);

    res.json({
      election: { id: election._id, title: election.title, status: statusOf(election) },
      totalVotes,
      results: results.map((r) => ({ ...r, percentage: totalVotes ? +((r.votes / totalVotes) * 100).toFixed(2) : 0 })),
    });
  } catch (err) { next(err); }
};
