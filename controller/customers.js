//Thêm mới users(view)
var customers = require('../modal/customers.js');
var product = require('../modal/product.js');
var category = require('../modal/category.js');
var numeral = require('numeral');
var async = require("async");
module.exports = function (app) {
    //Trang view thêm tài khoản người dùng  
    app.get('/customers-new', function (req, res) {
        async.parallel({
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
            }
        },
            function (err, results) {
                if (!req.session.productseen) {
                    req.session.productseen = [];
                }
                res.render('customers-new', {
                    title: 'Thêm mới khách hàng',
                    product: results.product,
                    numeral: numeral,
                    listPhone1: results.listPhone1,
                    listPhone2: results.listPhone2,
                    listMenu: results.listMenu,
                    productseen: req.session.productseen,
                    quantityOrder: req.session.cart ? req.session.cart.length : 0
                });
            })
    });
    //Xử lý thêm tài khoản
    app.post('/customers-new', function (req, res) {
        customers.find({ username: req.body.username }, function (err, result) {
            if (result.length > 0) {
                res.json({ code: 500, message: "Tên Email đã tồn tại" });
                return;
            } else {
                if (req.body.gender == "Nam") {
                    req.body.gender = true
                } else if (req.body.gender == "Nữ") {
                    req.body.gender = false
                }
                req.body.phone = parseInt(req.body.phone)
                var customer = new customers(req.body)
                customer.save((error) => {
                    res.json({ code: (error ? 500 : 200), message: error ? 'Kiểm tra lại thông tin đăng nhập !' : 'Tài khoản đã được tạo !' });
                });
            }
        })
    })
    //Đăng nhập
    app.get('/login', function (req, res) {
        async.parallel({
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
            }
        },
            function (err, results) {
                if (!req.session.productseen) {
                    req.session.productseen = [];
                }
                res.render('login', {
                    title: 'Đăng nhập',
                    product: results.product,
                    numeral: numeral,
                    listPhone1: results.listPhone1,
                    listPhone2: results.listPhone2,
                    listMenu: results.listMenu,
                    productseen: req.session.productseen,
                    quantityOrder: req.session.cart ? req.session.cart.length : 0
                });
            });
    });
    //Xử lý đang nhập
    app.post('/login', function (req, res) {
        customers.findOne({ username: req.body.username, password: req.body.password }, function (err, user) {
            if (!user) {
                res.json({ code: 500, message: 'Đăng nhập thất bại !' });
            } else {
                res.cookie("fullname", user.fullname)
                req.session._id = user._id;
                res.json({ code: 200, message: 'Đăng nhập thành công !' });
            }
        })
    })
    /* Trang đăng xuất. */
    app.get('/logout', function (req, res, next) {
        // xóa cookie
        res.clearCookie('fullname');
        // xóa session
        req.session.destroy();
        res.redirect('/login');
    });
    /* Trang thay đổi mật khẩu . */
    app.post('/edit-password', function (req, res, next) {
        if(req.session._id){
            customers.findById(req.session._id, function (err, dulieu) {
                if (dulieu.password == req.body.oldPass) {
                    dulieu.password = req.body.newPass;
                    dulieu.save();
                    res.json({ code: 200 });
                } else {
                    res.json({ code: 500 });
                }
            });
        }else{
            res.json({ code: 400 });
        }
    });
}