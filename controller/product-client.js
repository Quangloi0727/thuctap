var product = require('../modal/product.js');
var category = require('../modal/category.js');
var rate = require('../modal/rate.js');
var numeral = require('numeral');
var async = require("async");
var mongoose = require('mongoose');
module.exports = function (app) {
    //chi tiết sản phẩm phía client
    app.get('/product-detail/:id', function (req, res) {
        var id = req.params.id
        async.parallel({
            //query chi tiết sản phẩm
            productList: function (next) {
                product.find({}, next);
            },
            //query chi tiết sản phẩm
            productDetail: function (next) {
                product.findById({ _id: id }, next);
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
            //query các sản phẩm liên quan
            relatedProduct: function (next) {
                product.findById({ "_id": id }, function (err, data) {
                    category.aggregate([
                        {
                            $match: {
                                _id: { $in: data.categoryId }
                            }
                        }
                    ], function (err, ketqua) {
                        product.find({ "categoryId": ketqua[0]._id }).exec(next)
                    })
                })
            },
        },
            function (err, results) {
                //danh sách đã xem
                if (!req.session.productseen) {
                    req.session.productseen = [];
                }
                if (req.session.productseen.indexOf(id) == -1) {
                    req.session.productseen.push(id);
                }
                //giỏ hàng
                if (!req.session.cart) {
                    req.session.cart = [];
                }
                res.render('product-detail-client', {
                    title: 'Chi tiết điện thoại',
                    product: results.productDetail,
                    numeral: numeral,
                    listPhone1: results.listPhone1,
                    listPhone2: results.listPhone2,
                    listMenu: results.listMenu,
                    productList: results.productList,
                    cart: req.session.cart,
                    relatedProduct: results.relatedProduct,
                    idCustomer: req.session._id ? req.session._id : null,
                    idDetail: id,
                    quantityOrder: req.session.cart ? req.session.cart.length : 0
                });
            });
    });

    app.post('/product-detail/:id', function (req, res) {
        var id = req.params.id
        //giỏ hàng
        if (!req.session.cart) {
            req.session.cart = [];
        }
        if (req.session.cart) {
            if (req.session.cart.length > 0) {
                //kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
                var searchId = req.session.cart.filter(function (idSearch) {
                    return idSearch.productId == id
                })
                if (searchId.length > 0) {
                    req.session.cart.forEach(function (item) {
                        if (item.productId == id) {
                            product.findById(id, function (err, data) {
                                if (parseInt(item.quantityOrder) + parseInt(req.body.quantityOrder) > data.quantity) {
                                    res.json({ code: 500 })
                                } else {
                                    item.quantityOrder = parseInt(item.quantityOrder) + parseInt(req.body.quantityOrder)
                                    res.json({ code: 200 })
                                }
                            })
                        }
                    })
                } else {
                    req.session.cart.push({ "productId": id, "quantityOrder": req.body.quantityOrder });
                    res.json({ code: 200 });
                }
            } else {
                req.session.cart.push({ "productId": id, "quantityOrder": req.body.quantityOrder });
                res.json({ code: 200 });
            }
        }
    });
    //danh sách sản phẩm ở clinet
    app.get('/list-product', function (req, res) {
        console.log("query", req.query)
        var query = {}
        var name = "";
        var phoneName = "";
        var price = "";
        var color = "";
        var discount = "";
        var ram = "";
        var memory = "";
        if (req.query.name == "AP") {
            query.categoryId = mongoose.Types.ObjectId("5eb123f388173f51c0cbb2c1")
            name = "AP"
        }
        if (req.query.name == "SS") {
            query.categoryId = mongoose.Types.ObjectId("5eb1241288173f51c0cbb2c2")
            name = "SS"
        }
        if (req.query.name == "VV") {
            query.categoryId = mongoose.Types.ObjectId("5eb1242088173f51c0cbb2c3")
            name = "VV"
        }
        if (req.query.name == "NK") {
            query.categoryId = mongoose.Types.ObjectId("5eb1243288173f51c0cbb2c4")
            name = "NK"
        }
        if (req.query.name == "OP") {
            query.categoryId = mongoose.Types.ObjectId("5eb1246588173f51c0cbb2c5")
            name = "OP"
        }
        if (req.query.name == "XM") {
            query.categoryId = mongoose.Types.ObjectId("5eb12a30f9c26b4900141620")
            name = "XM"
        }
        if (req.query.name == "HW") {
            query.categoryId = mongoose.Types.ObjectId("5eb12a42f9c26b4900141621")
            name = "HW"
        }
        if (req.query.phoneName) {
            query.name = { $regex: new RegExp(stringRegex(req.query.phoneName), 'gi') };
            phoneName = req.query.phoneName
        }
        if (req.query.phoneName) {
            query.name = { $regex: new RegExp(stringRegex(req.query.phoneName), 'gi') };
            phoneName = req.query.phoneName
        }
        if (req.query.ram) {
            query.ram = { $regex: new RegExp(stringRegex(req.query.ram), 'gi') };
            ram = req.query.ram
        }
        if (req.query.memory) {
            query.memory = { $regex: new RegExp(stringRegex(req.query.memory), 'gi') };
            memory = req.query.memory
        }
        if (req.query.price && req.query.price != "-1") {
            if (req.query.price == "<1") {
                query.price = {}
                query.price.$lt = parseInt(1000000);
                price = req.query.price
            }
            if (req.query.price == "1-3") {
                query.price = {}
                query.price.$gte = parseInt(1000000);
                query.price.$lte = parseInt(3000000);
                price = req.query.price
            }
            if (req.query.price == "3-5") {
                query.price = {}
                query.price.$gte = parseInt(3000000);
                query.price.$lte = parseInt(5000000);
                price = req.query.price
            }
            if (req.query.price == "5-7") {
                query.price = {}
                query.price.$gte = parseInt(5000000);
                query.price.$lte = parseInt(7000000);
                price = req.query.price
            }
            if (req.query.price == "7-10") {
                query.price = {}
                query.price.$gte = parseInt(7000000);
                query.price.$lte = parseInt(10000000);
                price = req.query.price
            }
            if (req.query.price == ">10") {
                query.price = {}
                query.price.$gt = parseInt(10000000);
                price = req.query.price
            }
        }
        if (req.query.color && req.query.color != "-1") {
            query.categoryId = mongoose.Types.ObjectId(req.query.color)
            color = req.query.color
        }
        if (req.query.discount && req.query.discount == "on") {
            query.discount = {}
            query.discount.$gt = parseInt(0);
            discount = "on";
        }
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
            //query danh mục màu
            listColor: function (next) {
                category.find({ code: "color", status: true }, function (err, data) {
                    if (data.length > 0) {
                        category.find({ parent_id: data[0]._id, status: true }).exec(next)
                    } else {
                        next(null, data)
                    }
                })
            },
            //danh sách sản phẩm
            listProduct: function (next) {
                product.aggregate([
                    { $match: query }
                ], next)
            },
        },
            function (err, results) {
                var page = parseInt(req.query.page) || 1
                var perPage = 4;
                var start = (page - 1) * perPage;
                var end = page * perPage;
                var pageLength = Math.ceil(parseInt(results.listProduct.length) / perPage)
                console.log("pageLength", pageLength)
                //giỏ hàng
                if (!req.session.cart) {
                    req.session.cart = [];
                }
                res.render('list-product', {
                    title: 'Danh sách sản phẩm',
                    product: results.productDetail,
                    numeral: numeral,
                    rate:results.rate,
                    listPhone1: results.listPhone1,
                    listPhone2: results.listPhone2,
                    listMenu: results.listMenu,
                    listProduct: results.listProduct.slice(start, end),
                    cart: req.session.cart,
                    pageLength: pageLength,
                    listColor: results.listColor,
                    name: name,
                    phoneName: phoneName,
                    price: price,
                    color: color,
                    ram: ram,
                    memory: memory,
                    discount: discount,
                    quantityOrder: req.session.cart ? req.session.cart.length : 0
                });
            });
    })
    //đánh giá sản phẩm
    app.post('/rate', function (req, res) {
        if (!req.body.rate) {
            res.json({ code: 500 })
        } else {
            var data = new rate(req.body)
            data.phoneId = req.body.idP
            data.customerId = req.body.idC
            data.rate = parseInt(req.body.rate)
            data.save();
            res.json({ code: 200 })
        }
    })
}
// hàm chuyển hóa chuỗi tìm kiếm nhập vào
stringRegex = function (e) {
    for (var t = e.toLowerCase().replace(/^(\s*)|(\s*)$/g, "").replace(/\s+/g, " "), n = "àáảãạâầấẩẫậăằắẳẵặa", i = "đd", o = "ùúủũụưừứửữựu", a = "ìíỉĩịi", r = "èéẻẽẹêềếểễệe", c = "òóỏõọôồốổỗộơờớởỡợo", l = "ỳýỷỹỵy", u = "", s = 0; s < t.length; s++) n.indexOf(t[s]) >= 0 ? u = u + "[" + n + "]" : i.indexOf(t[s]) >= 0 ? u = u + "[" + i + "]" : o.indexOf(t[s]) >= 0 ? u = u + "[" + o + "]" : a.indexOf(t[s]) >= 0 ? u = u + "[" + a + "]" : r.indexOf(t[s]) >= 0 ? u = u + "[" + r + "]" : c.indexOf(t[s]) >= 0 ? u = u + "[" + c + "]" : l.indexOf(t[s]) >= 0 ? u = u + "[" + l + "]" : u += t[s];
    return u
}