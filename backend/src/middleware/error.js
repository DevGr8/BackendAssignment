exports.notFound = (req, res) => res.status(404).json({ message: `Route not found: ${req.originalUrl}` });

// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(', ') });
  }
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid ID format' });
  if (err.code === 11000) return res.status(409).json({ message: 'Duplicate value', fields: err.keyValue });
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
};
