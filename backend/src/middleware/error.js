exports.notFound = (req, res) => res.status(404).json({ message: `Route not found: ${req.originalUrl}` });

const FIELD_LABELS = { email: 'email', rollNumber: 'roll number' };

exports.errorHandler = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(', ') });
  }
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid ID format' });
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    const label = FIELD_LABELS[field];
    const message = label ? `An account with this ${label} already exists` : 'Duplicate value';
    return res.status(409).json({ message, fields: err.keyValue });
  }
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
};