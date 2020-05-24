var deliverer = require('../modal/deliverer.js');
var category = require('../modal/category.js');
var user = require('../modal/user.js');
var multer = require('multer');
var async = require("async");
var numeral = require('numeral');
var mongoose = require('mongoose');
module.exports = function (app) {
    //Thêm nhân viên giao hàng
    app.get('/add-deliverer', function (req, res, next) {
        res.render('add-deliverer', {
            title: 'Thêm mới nhân viên giao hàng',
        });
    });
    //Xử lý thêm mới nhân viên giao hàng
    app.post('/add-deliverer', function (req, res, next) {
        var data = new deliverer(req.body)
        if (req.body.status && req.body.status == "true" || req.body.status && req.body.status == "on") {
            data.status = true
        } else {
            data.status = false
        }
        data.save((error) => {
            console.log(error)
            res.json({ code: (error ? 500 : 200), message: error ? error : 'Nhân viên giao hàng đã được tạo mới !' });
        });
    });
    //Danh sách nhân viên giao hàng
    app.get('/deliverer', function (req, res, next) {
        var query = {}
        if (req.query.name) {
            query.name = { $regex: new RegExp(stringRegex(req.query.name), 'gi') };
        }
        if (req.query.phone) {
            query.phone = { $regex: new RegExp(stringRegex(req.query.phone), 'gi') };
        }
        deliverer.aggregate([
            {
                $match: query
            }
        ], function (err, d) {
            res.render('deliverer', {
                title: 'Danh sách nhân viên giao hàng',
                d: d,
                numeral: numeral
            });
        })
    });
    /*Trang xóa nhân viên giao hàng */
    app.get('/deliverer-remove/:idremove', function (req, res, next) {
        var idremove = req.params.idremove;
        deliverer.findByIdAndRemove(idremove).exec();
        res.json({ code: 200 });
    });
    /*Trang sửa nhân viên giao hàng */
    app.get('/deliverer-edit/:idEdit', function (req, res, next) {
        var idEdit = req.params.idEdit;
        deliverer.findById({ _id: idEdit }, function (err, deliverer) {
            res.render('deliverer-edit', { title: 'Sửa thông tin nhân viên giao hàng', deliverer: deliverer });
        });
    });
    //Xử lý sửa sản phẩm
    app.post('/deliverer-edit/:idEdit', function (req, res, next) {
        var idEdit = req.params.idEdit;
        deliverer.findById(idEdit, function (err, dulieu) {
            dulieu.name = req.body.name;
            dulieu.phone = req.body.phone;
            if (req.body.status && req.body.status == "true" || req.body.status && req.body.status == "on") {
                dulieu.status = true
            } else {
                dulieu.status = false
            }
            dulieu.save((error) => {
                res.json({ code: (error ? 500 : 200), message: error ? error : 'Thông tin nhân viên giao hàng đã được cập nhật !' });
            });
        });
    });
}
// hàm chuyển hóa chuỗi tìm kiếm nhập vào
stringRegex = function (e) {
    for (var t = e.toLowerCase().replace(/^(\s*)|(\s*)$/g, "").replace(/\s+/g, " "), n = "àáảãạâầấẩẫậăằắẳẵặa", i = "đd", o = "ùúủũụưừứửữựu", a = "ìíỉĩịi", r = "èéẻẽẹêềếểễệe", c = "òóỏõọôồốổỗộơờớởỡợo", l = "ỳýỷỹỵy", u = "", s = 0; s < t.length; s++) n.indexOf(t[s]) >= 0 ? u = u + "[" + n + "]" : i.indexOf(t[s]) >= 0 ? u = u + "[" + i + "]" : o.indexOf(t[s]) >= 0 ? u = u + "[" + o + "]" : a.indexOf(t[s]) >= 0 ? u = u + "[" + a + "]" : r.indexOf(t[s]) >= 0 ? u = u + "[" + r + "]" : c.indexOf(t[s]) >= 0 ? u = u + "[" + c + "]" : l.indexOf(t[s]) >= 0 ? u = u + "[" + l + "]" : u += t[s];
    return u
}
