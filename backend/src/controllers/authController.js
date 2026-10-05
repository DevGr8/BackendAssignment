const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

const sign = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });

const clean = (v) => (typeof v === 'string' ? v.trim() : '');
exports.register = async (req, res, next) => {
  try {
    const name = clean(req.body.name);
    const email = clean(req.body.email);
    const rollNumber = clean(req.body.rollNumber);
    const { password } = req.body;
    if (!name || !email || typeof password !== 'string' || !password) {
      return res.status(400).json({ message: 'name, email and password are required' });
    }
    const data = { name, email, password, role: 'student' };
    if (rollNumber) data.rollNumber = rollNumber;

    const user = await Student.create(data);
    res.status(201).json({
      token: sign(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const email = clean(req.body.email).toLowerCase();
    const { password } = req.body;
    if (!email || typeof password !== 'string' || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const user = await Student.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json({
      token: sign(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) { next(err); }
};

exports.me = (req, res) => {
  const { _id, name, email, role, rollNumber } = req.user;
  res.json({ id: _id, name, email, role, rollNumber });
};