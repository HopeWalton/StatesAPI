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

// middleware for json
app.use(express.json());

// Landing page
app.use('/', express.static(path.join(__dirname, 'public')));

app.use('/states', statesRoutes);

mongoose.connection.once('open', () => {
    console.log('Connected to mongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})

app.all('/{*any}', (req, res) => {
    res.status(404);
  
    if (req.accepts('html')) {
      res.sendFile(path.join(__dirname, 'public', '404.html'));
    } else if (req.accepts('json')) {
      res.json({ error: '404 Not Found' });
    } else {
      res.type('txt').send('404 Not Found');
    }
  });
  