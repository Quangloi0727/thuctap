var category = require('../modal/category.js');
var _ = require('underscore');
module.exports = function (app) {
    //Danh mục hệ thống
    app.get('/category', function (req, res, next) {
        var query = {}
        if (req.query.name) {
            query.name = { $regex: new RegExp(stringRegex(req.query.name), 'gi') };
        }
        if (req.query.code) {
            query.code = { $regex: new RegExp(stringRegex(req.query.code), 'gi') };
        }
        if (req.query.status) {
            if (req.query.status == "true") {
                query.status = true;
            } else if (req.query.status == "false") {
                query.status = false;
            } else {
                query.status = {}
            }
        }
        category.aggregate([
            { $match: { $and: [query, { parent_id: null }] } }
        ], function (err, data) {
            res.render('category', {
                title: 'Danh mục hệ thống',
                categories: data
            });
        })
    });
    //Thêm mới danh mục hệ thống
    app.get('/add-category', function (req, res, next) {
        res.render('add-category', { title: 'Thêm mới danh mục' });
    });
    //xử lý thêm mới danh mục hệ thống
    app.post('/add-category', function (req, res, next) {
        var categories = new category(req.body)
        if (req.body.status && req.body.status == "true" || req.body.status && req.body.status == "on") {
            categories.status = true
        } else {
            categories.status = false
        }
        categories.save((error) => {
            res.json({ code: (error ? 500 : 200), message: error ? error : 'Danh mục đã được thêm mới !' });
        });
    });
    /*Trang xóa danh mục hệ thống */
    app.get('/category-remove/:idremove', function (req, res, next) {
        var idremove = req.params.idremove;
        category.findByIdAndRemove(idremove).exec();
        res.json({ code: 200 });
    });
    /*Trang sửa danh mục hệ thống */
    app.get('/category-edit/:idEdit', function (req, res, next) {
        var idEdit = req.params.idEdit;
        category.find({ parent_id: idEdit }, function (err, data) {
            category.findById({ _id: idEdit }, function (err, category) {
                res.render('category-edit', { title: 'Sửa thông tin danh mục', category: category, data: data, idEdit: idEdit });
            })
        });
    });
    //Xử lý sửa danh mục hệ thống
    app.post('/category-edit/:idEdit', function (req, res, next) {
        console.log("dữ liệu nhận được là", req.body)
        var idEdit = req.params.idEdit;
        category.findById(idEdit, function (err, dulieu) {
            dulieu.name = req.body.name;
            if (req.body.note) {
                dulieu.note = req.body.note;
            }
            if (req.body.code) {
                dulieu.code = req.body.code;
            }
            if (req.body.status && req.body.status == "true" || req.body.status && req.body.status == "on") {
                dulieu.status = true
            } else {
                dulieu.status = false
            }
            dulieu.save((error) => {
                res.json({ code: (error ? 500 : 200), message: error ? error : 'Danh mục đã được cập nhật !' });
            });
        });
    });
}
// hàm chuyển hóa chuỗi tìm kiếm nhập vào
stringRegex = function (e) {
    for (var t = e.toLowerCase().replace(/^(\s*)|(\s*)$/g, "").replace(/\s+/g, " "), n = "àáảãạâầấẩẫậăằắẳẵặa", i = "đd", o = "ùúủũụưừứửữựu", a = "ìíỉĩịi", r = "èéẻẽẹêềếểễệe", c = "òóỏõọôồốổỗộơờớởỡợo", l = "ỳýỷỹỵy", u = "", s = 0; s < t.length; s++) n.indexOf(t[s]) >= 0 ? u = u + "[" + n + "]" : i.indexOf(t[s]) >= 0 ? u = u + "[" + i + "]" : o.indexOf(t[s]) >= 0 ? u = u + "[" + o + "]" : a.indexOf(t[s]) >= 0 ? u = u + "[" + a + "]" : r.indexOf(t[s]) >= 0 ? u = u + "[" + r + "]" : c.indexOf(t[s]) >= 0 ? u = u + "[" + c + "]" : l.indexOf(t[s]) >= 0 ? u = u + "[" + l + "]" : u += t[s];
    return u
}