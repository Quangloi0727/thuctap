var product = require('../modal/product.js');
var customer = require('../modal/customers.js');
var news = require('../modal/new.js');
var category = require('../modal/category.js');
var order = require('../modal/order.js');
var rate = require('../modal/rate.js');
var numeral = require('numeral');
var async = require("async");
var moment = require('moment');
var mongoose = require('mongoose');
module.exports = function (app) {
    //trang khuyến mãi
    app.get('/sales', function (req, res) {
        async.parallel({
            //query tài khoản đăng nhập
            customer: function (next) {
                customer.aggregate([
                    { $match: { "_id": mongoose.Types.ObjectId(req.session._id) } }
                ], next)
            },
            //query danh mục khuyến mãi
            sales: function (next) {
                news.find({ status: true, category: "Khuyến mãi" }, next)
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
                res.render('sales', {
                    title: 'Trang khuyến mãi',
                    numeral: numeral,
                    listPhone1: results.listPhone1,
                    listPhone2: results.listPhone2,
                    listMenu: results.listMenu,
                    sales: results.sales,
                    customer:results.customer,
                    moment: moment,
                    quantityOrder: req.session.cart ? req.session.cart.length : 0
                });
            });
    });
    //trang khuyến mãi
    app.get('/news', function (req, res) {
        async.parallel({
            //query tài khoản đăng nhập
            customer: function (next) {
                customer.aggregate([
                    { $match: { "_id": mongoose.Types.ObjectId(req.session._id) } }
                ], next)
            },
            //query danh mục tin tức
            news: function (next) {
                news.find({ status: true, category: "Tin tức" }, next)
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
                res.render('news', {
                    title: 'Trang tin tức',
                    numeral: numeral,
                    listPhone1: results.listPhone1,
                    listPhone2: results.listPhone2,
                    listMenu: results.listMenu,
                    news: results.news,
                    customer:results.customer,
                    moment: moment,
                    quantityOrder: req.session.cart ? req.session.cart.length : 0
                });
            });
    });
    //trang chủ
    app.get('/home', function (req, res) {
        console.log("session ",req.session._id)
        async.parallel({
            //query tài khoản đăng nhập
            customer: function (next) {
                customer.aggregate([
                    { $match: { "_id": mongoose.Types.ObjectId(req.session._id) } }
                ], next)
            },
            //query sản phẩm giảm giá cao
            sales: function (next) {
                product.aggregate([
                    { $sort: { discount: -1 } }
                ], next)
            },
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
            //sản phẩm bán chạy
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
        },
            function (err, results) {
                if (!req.session.productseen) {
                    req.session.productseen = [];
                }
                res.render('home', {
                    title: 'Điện thoại Hòa Bình',
                    product: results.product,
                    numeral: numeral,
                    moment: moment,
                    listPhone1: results.listPhone1,
                    listPhone2: results.listPhone2,
                    listMenu: results.listMenu,
                    customer: results.customer,
                    productSells: results.productSells,
                    productseen: req.session.productseen,
                    rate: results.rate,
                    sales: results.sales,
                    quantityOrder: req.session.cart ? req.session.cart.length : 0
                });
            });
    });
}