var product = require('../modal/product.js');
var customer = require('../modal/customers.js');
var category = require('../modal/category.js');
var order = require('../modal/order.js');
var orderDetail = require('../modal/order-detail.js');
var async = require("async");
var numeral = require('numeral');
var mongoose = require('mongoose');
var ralteProduct=[]
module.exports = function (app) {
    //Thêm giỏ hàng
    app.get('/cart', function (req, res, next) {
        async.parallel({
            //query tài khoản đăng nhập
            customer: function (next) {
                customer.aggregate([
                    { $match: { "_id": mongoose.Types.ObjectId(req.session._id) } }
                ], next)
            },
            //query sản phẩm liên quan
            ralteProduct: function (next) {
                product.find({},function(err,data){
                    ralteProduct=[];
                    ralteProduct.push(data[Math.floor(Math.random() * data.length)])
                    next(null,ralteProduct)
                });
            },
            //query sản phẩm liên quan
            ralteProduct2: function (next) {
                product.find({},function(err,data){
                    ralteProduct.push(data[Math.floor(Math.random() * data.length)])
                    next(null,ralteProduct)
                });
            },
            //query dánh sách sản phẩm
            product: function (next) {
                product.find({}, next);
            },
            //query danh mục menu
            listMenu: function (next) {
                category.find({ code: "menu", status: true }, function (err, data) {
                    if (data.length > 0) {
                        category.find({ parent_id: data[0]._id, status: true }, next)
                    } else {
                        next(null, data)
                    }
                })
            },
            //query danh mục điện thoại (cấp 1)
            listPhone1: function (next) {
                category.find({ code: "phone", status: true }, function (err, data) {
                    if (data.length > 0) {
                        category.find({ parent_id: data[0]._id, status: true }).limit(5).exec(next)
                    } else {
                        next(null, data)
                    }
                })
            },
            //query danh mục điện thoại (cấp 2)
            listPhone2: function (next) {
                category.find({ code: "phone", status: true }, function (err, data) {
                    if (data.length > 0) {
                        category.find({ parent_id: data[0]._id, status: true }).limit(5).skip(5).exec(next)
                    } else {
                        next(null, data)
                    }
                })
            },
        },
            function (err, results) {
                console.log("dữ liệu",ralteProduct)
                if (!req.session.cart) {
                    req.session.cart = []
                }
                res.render('cart', {
                    title: 'Giỏ hàng',
                    listPhone1: results.listPhone1,
                    listPhone2: results.listPhone2,
                    listMenu: results.listMenu,
                    product: results.product,
                    numeral: numeral,
                    customer:results.customer,
                    ralteProduct: ralteProduct,
                    productOrder: req.session.cart,
                    idCustomer: req.session._id ? req.session._id : null,
                    quantityOrder: req.session.cart ? req.session.cart.length : 0
                });
            });
    });
    //xử lý thêm giỏ hàng
    app.post('/cart', function (req, res, next) {
        var removeItem = req.session.cart.filter(function (el) { return el.productId != req.body._id; });
        req.session.cart = removeItem;
        res.json({ code: 200 })
    });
    //xử lý cập nhật giỏ hàng
    app.post('/update-cart', function (req, res, next) {
        console.log("session là", req.session.cart)
        var data = JSON.parse(req.body.data)
        data.forEach((item) => {
            req.session.cart.forEach((el) => {
                if (item._id == el.productId) {
                    el.quantityOrder = item.quantityOrder
                }
            })
        })
        res.json({ code: 200 })
    });
    //Danh sách đã đặt hàng
    app.get('/list-cart', function (req, res, next) {
        async.parallel({
            //query tài khoản đăng nhập
            customer: function (next) {
                customer.aggregate([
                    { $match: { "_id": mongoose.Types.ObjectId(req.session._id) } }
                ], next)
            },
            //query dánh sách sản phẩm
            product: function (next) {
                product.find({}, next);
            },
            //query danh mục menu
            listMenu: function (next) {
                category.find({ code: "menu", status: true }, function (err, data) {
                    if (data.length > 0) {
                        category.find({ parent_id: data[0]._id, status: true }, next)
                    } else {
                        next(null, data)
                    }
                })
            },
            //query danh mục điện thoại (cấp 1)
            listPhone1: function (next) {
                category.find({ code: "phone", status: true }, function (err, data) {
                    if (data.length > 0) {
                        category.find({ parent_id: data[0]._id, status: true }).limit(5).exec(next)
                    } else {
                        next(null, data)
                    }
                })
            },
            //query danh mục điện thoại (cấp 2)
            listPhone2: function (next) {
                category.find({ code: "phone", status: true }, function (err, data) {
                    if (data.length > 0) {
                        category.find({ parent_id: data[0]._id, status: true }).limit(5).skip(5).exec(next)
                    } else {
                        next(null, data)
                    }
                })
            },
            //Kiểm tra đặt hàng
            order: function (next) {
                var idCus = mongoose.Types.ObjectId(req.session._id);
                order.aggregate([
                    { $match: { "customerId": idCus } },
                    { $match: { "status": 0 } },
                    {
                        $lookup:
                        {
                            from: "order-detail",
                            localField: "_id",
                            foreignField: "orderId",
                            as: "order"
                        }
                    },
                    { $unwind: { path: '$order', preserveNullAndEmptyArrays: true } },
                    { $unwind: { path: '$order.products', preserveNullAndEmptyArrays: true } },
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
                        }
                    }
                ], next)
            }
        },
            function (err, results) {
                console.log("aaaaa",results.order)
                if (!req.session.cart) {
                    req.session.cart = []
                }
                res.render('list-cart', {
                    title: 'Lịch sử đặt hàng',
                    listPhone1: results.listPhone1,
                    listPhone2: results.listPhone2,
                    listMenu: results.listMenu,
                    product: results.product,
                    order: results.order,
                    numeral: numeral,
                    customer:results.customer,
                    productOrder: req.session.cart,
                    idCustomer: req.session._id ? req.session._id : null,
                    quantityOrder: req.session.cart ? req.session.cart.length : 0
                });
            });
    });
    //xử lý hủy đơn hàng
    app.post('/list-cart', function (req, res, next) {
        console.log("nhận được",req.body)
        order.findById({"_id":req.body.id},function(err,dulieu){
            dulieu.status=2;
            dulieu.save();
            res.json({ code: 200 })
        })
    });
}