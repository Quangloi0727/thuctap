const mongoose = require('mongoose');
var deliverer = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: Number, required: true },
},
    { collection: 'deliverers' });
module.exports = mongoose.model('deliverer', deliverer);