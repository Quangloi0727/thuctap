var product = require('../modal/product.js');
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
  //Thêm ảnh sản phẩm
  app.post('/uploadfile', upload.any(), function (req, res, next) {
    imageName = req.files[0].path.split('\\').pop()
    arrImages.push(imageName);
    res.status(200).send(req.files);
  });
  //Thêm sản phẩm
  app.get('/add-product', function (req, res, next) {
    async.parallel({
      //query danh mục nhóm sản phẩm
      groupProduct: function (next) {
        category.find({ code: "phone", status: true }, function (err, data) {
          if (data.length > 0) {
            category.find({ parent_id: data[0]._id, status: true }, next)
          } else {
            next(null, data)
          }
        })
      },
      //query danh mục mã màu 
      color: function (next) {
        category.find({ code: "color", status: true }, function (err, data) {
          if (data.length > 0) {
            category.find({ parent_id: data[0]._id, status: true }).limit(5).exec(next)
          } else {
            next(null, data)
          }
        })
      },
    },
      function (err, results) {
        res.render('add-product', {
          title: 'Thêm mới sản phẩm',
          groupProduct: results.groupProduct,
          color: results.color,
        });
      });
  });

  //Xử lý thêm mới sản phẩm
  app.post('/add-product', function (req, res, next) {
    var categoryId = [];
    req.body.category.forEach(function (item) {
      categoryId.push(mongoose.Types.ObjectId(item))
    })
    var products = new product(req.body)
    products.categoryId = categoryId;
    products.images = arrImages;
    products.createdBy = req.cookies['userId']
    products.save((error) => {
      console.log(error)
      res.json({ code: (error ? 500 : 200), message: error ? error : 'Sản phẩm đã được thêm mới !' });
    });
    arrImages = [];
  });
  //Danh sách sản phẩm
  app.get('/product', function (req, res, next) {
    var query = {}
    async.parallel({
      //query danh mục nhóm sản phẩm
      groupProduct: function (next) {
        category.find({ code: "phone", status: true }, function (err, data) {
          if (data.length > 0) {
            category.find({ parent_id: data[0]._id, status: true }, next)
          } else {
            next(null, data)
          }
        })
      },
      //query danh mục mã màu 
      product: function (next) {
        if (req.query.name) {
          query.name = { $regex: new RegExp(stringRegex(req.query.name), 'gi') };
        }
        if (req.query.categoryId && req.query.categoryId!="-1") {
          query.categoryId = mongoose.Types.ObjectId(req.query.categoryId)
        }
        product.aggregate([
          { $match: query }
        ], next)
      },
    },
      function (err, results) {
        res.render('product', {
          title: 'Danh sách sản phẩm',
          product: results.product,
          groupProduct: results.groupProduct,
          numeral: numeral
        });
      });
  });
  /*Trang xóa sản phẩm */
  app.get('/product-remove/:idremove', function (req, res, next) {
    var idremove = req.params.idremove;
    product.findByIdAndRemove(idremove).exec();
    res.json({ code: 200 });
  });
  /*Trang sửa sản phẩm */
  app.get('/product-edit/:idEdit', function (req, res, next) {
    var idEdit = req.params.idEdit;
    product.findById({ _id: idEdit }, function (err, product) {
      res.render('product-edit', { title: 'Sửa thông tin sản phẩm', product: product });
    });
  });
  //Xử lý sửa sản phẩm
  app.post('/product-edit/:idEdit', function (req, res, next) {
    var idEdit = req.params.idEdit;
    product.findById(idEdit, function (err, dulieu) {
      dulieu.name = req.body.name;
      dulieu.price = req.body.price;
      dulieu.quantity = req.body.quantity;
      dulieu.description = req.body.description;
      dulieu.save((error) => {
        res.json({ code: (error ? 500 : 200), message: error ? error : 'Sản phẩm đã được cập nhật !' });
      });
    });
  });
}
// hàm chuyển hóa chuỗi tìm kiếm nhập vào
stringRegex = function (e) {
  for (var t = e.toLowerCase().replace(/^(\s*)|(\s*)$/g, "").replace(/\s+/g, " "), n = "àáảãạâầấẩẫậăằắẳẵặa", i = "đd", o = "ùúủũụưừứửữựu", a = "ìíỉĩịi", r = "èéẻẽẹêềếểễệe", c = "òóỏõọôồốổỗộơờớởỡợo", l = "ỳýỷỹỵy", u = "", s = 0; s < t.length; s++) n.indexOf(t[s]) >= 0 ? u = u + "[" + n + "]" : i.indexOf(t[s]) >= 0 ? u = u + "[" + i + "]" : o.indexOf(t[s]) >= 0 ? u = u + "[" + o + "]" : a.indexOf(t[s]) >= 0 ? u = u + "[" + a + "]" : r.indexOf(t[s]) >= 0 ? u = u + "[" + r + "]" : c.indexOf(t[s]) >= 0 ? u = u + "[" + c + "]" : l.indexOf(t[s]) >= 0 ? u = u + "[" + l + "]" : u += t[s];
  return u
}