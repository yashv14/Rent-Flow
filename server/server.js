const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./config/db');

const app = express();
const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const rentRoutes = require('./routes/rentRoutes');
const noticeRoutes = require('./routes/noticeRoutes');


// Normalize CLIENT_URL — strip any trailing slash to avoid CORS mismatch
const rawClientUrl = (process.env.CLIENT_URL || '').replace(/\/$/, '');

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g. curl, Render health checks)
    if (!origin) return callback(null, true);
    // Allow if origin matches CLIENT_URL (with or without trailing slash)
    if (!rawClientUrl || rawClientUrl === '*' || origin.replace(/\/$/, '') === rawClientUrl) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/rent', rentRoutes);
app.use('/api/notices', noticeRoutes);


app.get('/', (req, res) => {
  res.json({ message: 'Rental Management API is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});