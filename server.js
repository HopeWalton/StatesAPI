require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const verifyStates = require('./middleware/verifyStates');
const statesRoutes = require('./routes/statesRoutes');
const connectDB = require('./config/dbConn');
const PORT = process.env.PORT || 3500;

// Connect to MongoDB
connectDB();

// Log successful or failed DB connection
mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
});
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

// Parse JSON request bodies
app.use(express.json());

// Serve static files
app.use('/', express.static(path.join(__dirname, 'public')));

// Use custom middleware
app.use('/states', verifyStates);

// Routes for states
app.use('/states', statesRoutes);

// 404 fallback route
app.all('*', (req, res) => {
  res.status(404);
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'public', '404.html'));
  } else if (req.accepts('json')) {
    res.json({ error: '404 Not Found' });
  } else {
    res.type('txt').send('404 Not Found');
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
