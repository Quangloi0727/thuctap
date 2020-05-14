const mongoose = require('mongoose');
var user = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    fullname: { type: String, required: true },
    status: { type: Boolean, required: true },
    avt: { type: Array, required: true },
    code: { type: String, required: true },
},
    { collection: 'users' });
module.exports = mongoose.model('user', user);