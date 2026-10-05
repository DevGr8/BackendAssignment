const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

app.set('trust proxy', 1);
app.use(helmet());

const origins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((s) => s.trim().replace(/\/+$/, ''))
  .filter(Boolean);
app.use(cors({ origin: origins.length ? origins : true }));
app.use(express.json());

app.get('/', (req, res) => res.json({ status: 'ok', service: 'College Election API' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }), require('./routes/authRoutes'));
app.use('/api/elections', require('./routes/electionRoutes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;