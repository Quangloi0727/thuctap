var user = require('../modal/user.js');
module.exports = function (app) {
    //Trang quản trị 
    app.get('/admin', function (req, res) {
        res.render('admin', {
            title: 'Trang quản trị'
        });
    });
    //trang login trang quản trị
    app.get('/login-admin', function (req, res) {
        res.render('login-admin', { title: 'Đăng nhập trang quản trị' });
    });
    //Xử lý trang đăng nhập vào trang quản trị
    app.post('/login-admin', function (req, res) {
        user.findOne({ username: req.body.username, password: req.body.password }, function (err, user) {
            if (!user) {
                res.json({ code: 500, message: 'Đăng nhập thất bại !' });
            } else {
                res.cookie("nameUser", user.fullname)
                res.cookie("userId", user._id)
                res.cookie("avt", user.avt)
                res.json({ code: 200, message: 'Đăng nhập thành công !' });
            }
        })
    });
    /* Trang đăng xuất. */
    app.get('/logout-admin', function (req, res, next) {
        // xóa cookie
        res.clearCookie('nameUser');
        res.clearCookie('userId');
        res.clearCookie('avt');
        res.redirect('/login-admin');
    });
    //thay đổi mật khẩu user
    app.get('/changePassUser', function (req, res) {
        res.render('changePassUser', { title: 'Thay đổi mật khẩu' });
    });
    //thay đổi mật khẩu user
    app.post('/changePassUser', function (req, res) {
        user.findById({ _id: req.cookies.userId }, function (err, data) {
            if (data.password != req.body.oldPass) {
                res.json({ code: 500 })
            } else {
                data.password = req.body.newPass;
                data.save();
                res.json({ code: 200 })
            }
        })
    });
}