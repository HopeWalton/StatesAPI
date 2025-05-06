const express = require('express');
const fs = require('fs');
const path = require('path');

// Load statesData.json
const statesData = require('../models/statesData.json');

const app = express();
// JSON middleware
app.use(express.json());

// Create array of state codes
const stateCodes = statesData.map(state => state.code);

// Middleware to verify the state code
const verifyStates = (req, res, next) => {
    const stateCode = req.params.state?.toUpperCase();
    
    if (!stateCodes.includes(stateCode)) {
        return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
    }

    req.code = stateCode; // Attach valid state code
    next();
};

module.exports = verifyStates;
