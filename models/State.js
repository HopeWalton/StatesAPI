const mongoose = require('mongoose');
const { Schema } = mongoose;

const statesSchema = new Schema({
    stateCode: {
        type: String,
        required: true,
        unique: true
    },
    funfacts: [String]
});

module.exports = mongoose.model('State', statesSchema);