require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

(async () => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set');
  await connectDB();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})().catch((err) => {
  console.error('Startup failed:', err.message);
  process.exit(1);
});
