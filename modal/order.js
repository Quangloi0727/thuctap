const mongoose = require('mongoose');
var order = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId },
    status: { type: Number },
    code: { type: String },
    delivererId: { type: mongoose.Schema.Types.ObjectId, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    delivererPhone: { type:Number, default: null },
    total: { type: Number, default: null },
    delivererAddress: { type: String, default: null },
    note: { type: String, default: null },
    customerPay: { type: Number, default: null },//số tiền khách hàng phải trả
    deliveryCost: { type: Number, default: null },//Phí vận chuyển
    expectedTime: { type: Date, default: null },//Thời gian giao hàng dự kiến
    created: { type: Date, default: Date.now },
    createdConfirm: { type: Date, default: null },
},
    { collection: 'orders' });
module.exports = mongoose.model('order', order);