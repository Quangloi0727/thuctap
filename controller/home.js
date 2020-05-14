var product = require('../modal/product.js');
var category = require('../modal/category.js');
var order = require('../modal/order.js');
var rate = require('../modal/rate.js');
var numeral = require('numeral');
var async = require("async");
module.exports = function (app) {
    app.get('/home', function (req, res) {
        async.parallel({
            //query đánh giá 
            rate: function (next) {
                rate.aggregate([
                    {
                        $group: {
                            _id: "$phoneId",
                            rate: { $sum: "$rate" },
                            length: { $push: "$rate" }
                        }
                    }
                ],next)
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
            productSells: function (next) {
                order.aggregate([
                    { $match: { "status": 3 } },
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
                        $group: {
                            _id: "$order.products.phoneId",
                            quantityOrder: { $sum: "$order.products.quantityOrder" },
                        }
                    },
                    {
                        $lookup:
                        {
                            from: "product",
                            localField: "_id",
                            foreignField: "_id",
                            as: "product"
                        }
                    },
                    { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
                    {
                        $group: {
                            _id: "$_id",
                            quantityOrder: { $first: "$quantityOrder" },
                            product: { $first: "$product" }
                        }
                    },
                    { $sort: { quantityOrder: -1 } }
                ], next)
            },
            //sản phẩm bán chạy
        },
            function (err, results) {
                if (!req.session.productseen) {
                    req.session.productseen = [];
                }
                res.render('home', {
                    title: 'Điện thoại Hòa Bình',
                    product: results.product,
                    numeral: numeral,
                    listPhone1: results.listPhone1,
                    listPhone2: results.listPhone2,
                    listMenu: results.listMenu,
                    productSells: results.productSells,
                    productseen: req.session.productseen,
                    rate:results.rate,
                    quantityOrder: req.session.cart ? req.session.cart.length : 0
                });
            });
    });
}