const mongoose = require('mongoose');
var orderDetail = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId },
    products:[
        {
            _id: false,
            phoneId: { type: mongoose.Schema.Types.ObjectId },
            quantityOrder: { type: Number },
        }
    ],
},
    { collection: 'order-detail' });
module.exports = mongoose.model('orderDetail', orderDetail);