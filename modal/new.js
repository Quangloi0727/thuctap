const mongoose = require('mongoose');
var news = new mongoose.Schema({
    banner: { type: Array },
    title: { type: String },
    form: { type: String },
    to: { type: String },
    content: { type: String },
    status: { type: Boolean }, 
    category: { type: String }, 
},
    { collection: 'news' });
module.exports = mongoose.model('news', news);