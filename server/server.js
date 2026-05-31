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


app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/rent', rentRoutes);
app.use('/api/notices', noticeRoutes);


app.get('/', (req, res) => {
  res.json({ message: 'Rental Management API is running!' });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});