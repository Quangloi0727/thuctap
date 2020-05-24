var news = require('../modal/new.js');
var category = require('../modal/category.js');
var multer = require('multer');
var async = require("async");
var numeral = require('numeral');
var mongoose = require('mongoose');
var arrImages = [];
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
    //Thêm ảnh tin tức
    app.post('/uploadfilenew', upload.any(), function (req, res, next) {
        imageName = req.files[0].path.split('\\').pop()
        arrImages.push(imageName);
        res.status(200).send(req.files);
    });
    //Thêm tin tức
    app.get('/add-new', function (req, res, next) {
        res.render('add-new', {
            title: 'Thêm mới tin tức',
        });
    });

    //Xử lý thêm mới tin tức
    app.post('/add-new', function (req, res, next) {
        var data = new news(req.body)
        if (req.body.status && req.body.status == "true" || req.body.status && req.body.status == "on") {
            data.status = true
        } else {
            data.status = false
        }
        data.banner = arrImages;
        data.save((error) => {
            res.json({ code: (error ? 500 : 200), message: error ? error : 'Tin tức đã được thêm mới !' });
        });
        arrImages = [];
    });
    //Danh sách tin tức
    app.get('/new', function (req, res, next) {
        console.log("dữ liệu nhân được là",req.query)
        var query = {}
        if (req.query.title) {
            query.title = { $regex: new RegExp(stringRegex(req.query.title), 'gi') };
        }
        if (req.query.category && req.query.category!="1" ) {
            query.category = { $regex: new RegExp(stringRegex(req.query.category), 'gi') };
        }
        news.aggregate([
            { $match: query }
        ], function (err, news) {
            res.render('new', {
                title: 'Danh sách tin tức',
                news: news
            });
        })
    });
    /*Trang xóa tin tức*/
    app.get('/new-remove/:idremove', function (req, res, next) {
        var idremove = req.params.idremove;
        news.findByIdAndRemove(idremove).exec();
        res.json({ code: 200 });
    });
    /*Trang sửa tin tức */
    app.get('/new-edit/:idEdit', function (req, res, next) {
        var idEdit = req.params.idEdit;
        news.findById({ _id: idEdit }, function(err,data){
            res.render('new-edit', {
                title: 'Chỉnh sửa tin tức',
                n: data
            });
        })
    });
    //Xử lý sửa sản phẩm
    app.post('/new-edit/:idEdit', function (req, res, next) {
        var idEdit = req.params.idEdit;
        news.findById(idEdit, function (err, dulieu) {
            if (req.body.status && req.body.status == "true" || req.body.status && req.body.status == "on") {
                dulieu.status = true
            } else {
                dulieu.status = false
            }
            dulieu.title = req.body.title;
            dulieu.category = req.body.category;
            dulieu.form = req.body.form;
            dulieu.to = req.body.to;
            dulieu.content = req.body.content;
            dulieu.save((error) => {
                res.json({ code: (error ? 500 : 200), message: error ? error : 'Tin tức đã được cập nhật !' });
            });
        });
    });
}
// hàm chuyển hóa chuỗi tìm kiếm nhập vào
stringRegex = function (e) {
    for (var t = e.toLowerCase().replace(/^(\s*)|(\s*)$/g, "").replace(/\s+/g, " "), n = "àáảãạâầấẩẫậăằắẳẵặa", i = "đd", o = "ùúủũụưừứửữựu", a = "ìíỉĩịi", r = "èéẻẽẹêềếểễệe", c = "òóỏõọôồốổỗộơờớởỡợo", l = "ỳýỷỹỵy", u = "", s = 0; s < t.length; s++) n.indexOf(t[s]) >= 0 ? u = u + "[" + n + "]" : i.indexOf(t[s]) >= 0 ? u = u + "[" + i + "]" : o.indexOf(t[s]) >= 0 ? u = u + "[" + o + "]" : a.indexOf(t[s]) >= 0 ? u = u + "[" + a + "]" : r.indexOf(t[s]) >= 0 ? u = u + "[" + r + "]" : c.indexOf(t[s]) >= 0 ? u = u + "[" + c + "]" : l.indexOf(t[s]) >= 0 ? u = u + "[" + l + "]" : u += t[s];
    return u
}