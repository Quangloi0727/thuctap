const mongoose = require('mongoose');
var rate = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId },
    phoneId: { type: mongoose.Schema.Types.ObjectId },
    rate: { type: Number }
},
    { collection: 'rate' });
module.exports = mongoose.model('rate', rate);