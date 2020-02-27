module.exports = function(app) { 
    //Trang quản trị 
    app.get('/admin', function (req, res) {  
        res.render('admin', { title: 'Trang quản trị' });
    });
    //trang login trang quản trị
    app.get('/login-admin', function (req, res) {  
        res.render('login-admin', { title: 'Đăng nhập trang quản trị' });
    });
    //Xử lý trang đăng nhập vào trang quản trị
    app.post('/login-admin', function (req, res) {  
        //set tài khoản và mật khẩu đặc biệt cho admin
        if(req.body.username="adminstore"&&req.body.password=="123456a@"){
            res.json({code:200})
        }else{
            res.json({code:500})
        }
    });      
}