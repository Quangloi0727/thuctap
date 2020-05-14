var order = require('../modal/order.js');
var orderDetail = require('../modal/order-detail.js');
var deliverer = require('../modal/deliverer.js');
var product = require('../modal/product.js');
var customer = require('../modal/customers.js');
var moment = require('moment');
var numeral = require('numeral');
var mongoose = require('mongoose');
var async = require("async");
var isodate = require("isodate");
var nodemailer = require('nodemailer'); // khai báo sử dụng module nodemailer
var code;
module.exports = function (app) {
    //Danh sách đơn hàng
    app.get('/order', function (req, res, next) {
        var query = {}
        if (req.query.code) {
            query.code = { $regex: new RegExp(stringRegex(req.query.code), 'gi') };
        }
        if (req.query.customer) {
            query.customer = {}
            query.customer.fullname = { $regex: new RegExp(stringRegex(req.query.customer), 'gi') };
        }
        if (req.query.status && req.query.status != "-1") {
            query.status = parseInt(req.query.status)
        }
        if (req.query.createdAtForm) {
            console.log("từ ngày", req.query.createdAtForm)
            query.created = {}
            query.created.$gte = isodate(req.query.createdAtForm);
        }
        if (req.query.createdAtTo) {
            query.created = {}
            query.created.$lte = isodate(req.query.createdAtTo);
        }
        order.aggregate([
            { $match: query },
            {
                $lookup:
                {
                    from: "order-detail",
                    localField: "_id",
                    foreignField: "orderId",
                    as: "order"
                }
            },
            {
                $lookup:
                {
                    from: "customers",
                    localField: "customerId",
                    foreignField: "_id",
                    as: "customer"
                }
            },
            {
                $lookup:
                {
                    from: "customers",
                    localField: "customerId",
                    foreignField: "_id",
                    as: "customer"
                }
            },
            {
                $lookup:
                {
                    from: "users",
                    localField: "createdBy",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: { path: '$order', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$order.products', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            {
                $lookup:
                {
                    from: "product",
                    localField: "order.products.phoneId",
                    foreignField: "_id",
                    as: "product"
                }
            },
            { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: "$_id",
                    status: { $first: "$status" },
                    code: { $first: "$code" },
                    note: { $first: "$note" },
                    total: { $first: "$total" },
                    created: { $first: "$created" },
                    productOrder: { $push: "$order.products" },
                    product: { $push: "$product" },
                    customer: { $first: "$customer" },
                    user: { $first: "$user" }
                }
            },
            { $sort : { code : -1 } }
        ], function (err, result) {
            res.render('order', {
                title: 'Danh sách đơn hàng',
                result: result,
                moment: moment,
                numeral: numeral
            });
        })
    });
    //xử lý thêm giỏ hàng
    app.post('/order', function (req, res, next) {
        async.waterfall([
            function (callback) {
                order.find({}, function (err, item) {
                    code = "DH00" + (item.length + 1)
                    callback(null, code)
                })
            }
        ], function (err, result) {
            if (result) {
                var data = new order()
                data.status = 0;
                data.code = code;
                data.customerId = req.session._id;
                data.total = parseInt(req.body.totalAll);
                data.save((error, item) => {
                    var products = [];
                    var dataJson = JSON.parse(req.body.data)
                    dataJson.forEach((item) => {
                        products.push({ "phoneId": item._id, "quantityOrder": item.quantityOrder })
                    })
                    var orderdetail = new orderDetail()
                    orderdetail.orderId = item._id
                    orderdetail.products = products;
                    orderdetail.save();
                    res.json({ code: (error ? 500 : 200) });
                });
            }
        });
    });
    // Chỉnh sửa giỏ hàng
    app.get('/order-edit/:id', function (req, res, next) {
        var id = mongoose.Types.ObjectId(req.params.id);
        order.aggregate([
            { $match: { "_id": id } },
            {
                $lookup:
                {
                    from: "order-detail",
                    localField: "_id",
                    foreignField: "orderId",
                    as: "order"
                }
            },
            {
                $lookup:
                {
                    from: "customers",
                    localField: "customerId",
                    foreignField: "_id",
                    as: "customer"
                }
            },
            { $unwind: { path: '$order', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$order.products', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
            {
                $lookup:
                {
                    from: "product",
                    localField: "order.products.phoneId",
                    foreignField: "_id",
                    as: "product"
                }
            },
            { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: "$_id",
                    status: { $first: "$status" },
                    code: { $first: "$code" },
                    delivererId: { $first: "$delivererId" },
                    expectedTime: { $first: "$expectedTime" },
                    delivererAddress: { $first: "$delivererAddress" },
                    delivererPhone: { $first: "$delivererPhone" },
                    deliveryCost: { $first: "$deliveryCost" },
                    note: { $first: "$note" },
                    total: { $first: "$total" },
                    created: { $first: "$created" },
                    productOrder: { $push: "$order.products" },
                    product: { $push: "$product" },
                    customer: { $first: "$customer" }
                }
            }
        ], function (err, result) {
            deliverer.find({}, function (err, data) {
                res.render('order-edit', {
                    title: 'Thông tin đơn hàng',
                    result: result,
                    moment: moment,
                    numeral: numeral,
                    deliverer: data
                });
            })
        })
    })
    // xử lý chỉnh sửa đơn hàng
    app.post('/order-edit/:id', function (req, res, next) {
        if(req.body.idClose){
            order.findById({"_id":req.body.idClose},function(err,dulieu){
                dulieu.status=3;
                dulieu.save();
                res.json({ code: 200 })
            })
        }else if(req.body.idDelete){
            order.findById({"_id":req.body.idDelete},function(err,dulieu){
                dulieu.status=2;
                dulieu.save();
                res.json({ code: 200 })
            })
        }else{
            var idEdit = req.params.id;

            var transporter = nodemailer.createTransport({ // config mail server
                service: 'Gmail',
                auth: {
                    user: 'nguyenquangloi@hoasao.vn',
                    pass: 'Quangloi072798'
                }
            });
            var mainOptions = { // thiết lập đối tượng, nội dung gửi mail
                from: 'Hoa Binh Store',
                to: req.body.EmailTo,
                subject: 'Đặt hàng thành công',
                html: '<p>Bạn đã đặt hàng thành công</b>' +
                    '<ul>' +
                    '<li>Thành tiền: ' + req.body.valueVoucher + '</li>' +
                    '<li>Chi phí vận chuyển: ' + req.body.deliveryCost + '</li>' +
                    '<li>Số tiền khách hàng phải trả: ' + req.body.customerPay + '</li>' +
                    '<li>Thời gian giao hàng dự kiến: ' + req.body.expectedTime + '</li>' +
                    '<li>Số điện thoại nhân viên giao hàng: ' + req.body.delivererPhone + '</li>' +
                    '</ul>'
            }
            transporter.sendMail(mainOptions, function (err, info) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Message sent: ' + info.response);
                }
            });
            //convert VD 20,000 VND -> 200000 deliveryCost
            var b = req.body.deliveryCost
            var c = b.split(",")
            var d = c.join('');
            //convert VD 20,000 VND -> 200000 customerPay
            var x = req.body.customerPay
            var y = x.split(",")
            var z = y.join('');
            order.findById(idEdit, function (err, dulieu) {
                dulieu.note = req.body.note;
                dulieu.status = 1;
                dulieu.delivererId = mongoose.Types.ObjectId(req.body.deliverer);
                dulieu.delivererAddress = req.body.delivererAddress;
                dulieu.delivererPhone = req.body.delivererPhone;
                dulieu.expectedTime = req.body.expectedTime;
                dulieu.deliveryCost = parseInt(d);
                dulieu.customerPay = parseInt(z);
                dulieu.createdBy=req.cookies['userId']
                dulieu.save((error) => {
                    orderDetail.find({ "orderId": idEdit }, function (err1, dulieu1) {
                        dulieu1[0].products.forEach((item) => {
                            product.findById({ _id: item.phoneId }, function (err2, dulieu2) {
                                dulieu2.quantity = dulieu2.quantity - item.quantityOrder
                                dulieu2.save();
                            })
                        })
                    })
                    res.json({ code: (error ? 500 : 200) });
                });
            }); 
        }
        
    })
}
// hàm chuyển hóa chuỗi tìm kiếm nhập vào
stringRegex = function (e) {
    for (var t = e.toLowerCase().replace(/^(\s*)|(\s*)$/g, "").replace(/\s+/g, " "), n = "àáảãạâầấẩẫậăằắẳẵặa", i = "đd", o = "ùúủũụưừứửữựu", a = "ìíỉĩịi", r = "èéẻẽẹêềếểễệe", c = "òóỏõọôồốổỗộơờớởỡợo", l = "ỳýỷỹỵy", u = "", s = 0; s < t.length; s++) n.indexOf(t[s]) >= 0 ? u = u + "[" + n + "]" : i.indexOf(t[s]) >= 0 ? u = u + "[" + i + "]" : o.indexOf(t[s]) >= 0 ? u = u + "[" + o + "]" : a.indexOf(t[s]) >= 0 ? u = u + "[" + a + "]" : r.indexOf(t[s]) >= 0 ? u = u + "[" + r + "]" : c.indexOf(t[s]) >= 0 ? u = u + "[" + c + "]" : l.indexOf(t[s]) >= 0 ? u = u + "[" + l + "]" : u += t[s];
    return u
}