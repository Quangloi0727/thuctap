var multer  = require('multer');
/* up ảnh sản phẩm*/
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
var upload = multer({ storage: storage });
module.exports = function (app) {
    //Thêm sản phẩm
    app.get('/add-product', function (req, res, next) {
        res.render('add-product', { title: 'Thêm mới sản phẩm' });
    });
    //Xử lý thêm mới sản phẩm
    app.post('/add-product', function (req, res, next) {
        console.log(req.body)
        // var a = req.body.images;
        // var b = a.split(",");
        // const images = []
        // for (let i = 0; i < b.length; i++) {
        //     const imageName = b[i].split('\\').pop()
        //     images.push(imageName)
        // }
    });
}