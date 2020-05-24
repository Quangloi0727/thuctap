var product = require('../modal/product.js');
var category = require('../modal/category.js');
var user = require('../modal/user.js');
var multer = require('multer');
var async = require("async");
var numeral = require('numeral');
var mongoose = require('mongoose');
var arrImages = [];
var code;
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/img_product')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

var upload = multer({ storage: storage })
module.exports = function (app) {
    //Thêm ảnh nhân viên
    app.post('/uploadfileavt', upload.any(), function (req, res, next) {
        imageName = req.files[0].path.split('\\').pop()
        arrImages.push(imageName);
        res.status(200).send(req.files);
    });
    //Thêm nhân viên
    app.get('/add-user', function (req, res, next) {
        res.render('add-user', {
            title: 'Thêm mới nhân viên',
        });
    });

    //Xử lý thêm mới nhân viên
    app.post('/add-user', function (req, res, next) {
        async.waterfall([
            function (callback) {
                user.find({}, function (err, item) {
                    code = "NV00" + (item.length + 1)
                    callback(null, code)
                })
            }
        ], function (err, result) {
            if (result) {
                var data = new user(req.body)
                if (req.body.status && req.body.status == "true" || req.body.status && req.body.status == "on") {
                    data.status = true
                } else {
                    data.status = false
                }
                data.code = code
                data.avt = arrImages;
                data.save((error) => {
                    console.log(error)
                    res.json({ code: (error ? 500 : 200), message: error ? error : 'Nhân viên đã được tạo mới !' });
                });
                arrImages = [];
            }
        });
    });
    //Danh sách nhân viên
    app.get('/user', function (req, res, next) {
        console.log("dữ liệu nhân được là", req.query)
        var query = {}
        if (req.query.name) {
            query.fullname = { $regex: new RegExp(stringRegex(req.query.name), 'gi') };
        }
        if (req.query.code) {
            query.code = { $regex: new RegExp(stringRegex(req.query.code), 'gi') };
        }
        user.aggregate([
            {
                $match: {
                    $and: [query, { username: { $ne: "adminstore" }}]
                }
            }
        ], function (err, user) {
            res.render('user', {
                title: 'Danh sách nhân viên',
                user: user,
                numeral: numeral
            });
        })
    });
    /*Trang xóa nhân viên */
    app.get('/user-remove/:idremove', function (req, res, next) {
        var idremove = req.params.idremove;
        user.findByIdAndRemove(idremove).exec();
        res.json({ code: 200 });
    });
    /*Trang sửa sản phẩm */
    app.get('/user-edit/:idEdit', function (req, res, next) {
        var idEdit = req.params.idEdit;
        user.findById({ _id: idEdit }, function (err, user) {
            res.render('user-edit', { title: 'Sửa thông tin nhân viên', user: user });
        });
    });
    //Xử lý sửa sản phẩm
    app.post('/user-edit/:idEdit', function (req, res, next) {
        var idEdit = req.params.idEdit;
        user.findById(idEdit, function (err, dulieu) {
            dulieu.fullname = req.body.fullname;
            dulieu.username = req.body.username;
            dulieu.password = req.body.password;
            if (req.body.status && req.body.status == "true" || req.body.status && req.body.status == "on") {
                dulieu.status = true
            } else {
                dulieu.status = false
            }
            dulieu.save((error) => {
                res.json({ code: (error ? 500 : 200), message: error ? error : 'Thông tin nhân viên đã được cập nhật !' });
            });
        });
    });
}
// hàm chuyển hóa chuỗi tìm kiếm nhập vào
stringRegex = function (e) {
    for (var t = e.toLowerCase().replace(/^(\s*)|(\s*)$/g, "").replace(/\s+/g, " "), n = "àáảãạâầấẩẫậăằắẳẵặa", i = "đd", o = "ùúủũụưừứửữựu", a = "ìíỉĩịi", r = "èéẻẽẹêềếểễệe", c = "òóỏõọôồốổỗộơờớởỡợo", l = "ỳýỷỹỵy", u = "", s = 0; s < t.length; s++) n.indexOf(t[s]) >= 0 ? u = u + "[" + n + "]" : i.indexOf(t[s]) >= 0 ? u = u + "[" + i + "]" : o.indexOf(t[s]) >= 0 ? u = u + "[" + o + "]" : a.indexOf(t[s]) >= 0 ? u = u + "[" + a + "]" : r.indexOf(t[s]) >= 0 ? u = u + "[" + r + "]" : c.indexOf(t[s]) >= 0 ? u = u + "[" + c + "]" : l.indexOf(t[s]) >= 0 ? u = u + "[" + l + "]" : u += t[s];
    return u
}
