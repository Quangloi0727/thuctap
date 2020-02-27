//Thêm mới users(view)
var users=require('../modal/users.js');
module.exports = function(app) {
    //Trang view thêm tài khoản người dùng  
    app.get('/users-new', function (req, res) {  
        res.render('users-new', { title: 'Thêm mới khách hàng'});
    });
    //Xử lý thêm tài khoản
    app.post('/users-new', function(req, res){
        users.find({username:req.body.username},function(err,result){
            if(result.length>0){
                res.json({ code:500,message:"Tên Email đã tồn tại" });
                return;
            }else{
                if(req.body.gender=="Nam"){
                    req.body.gender=true
                }else if(req.body.gender=="Nữ"){
                    req.body.gender=false
                }
                req.body.phone=parseInt(req.body.phone)
                var user=new users(req.body)
                user.save((error) => {
                    res.json({ code: (error ? 500 : 200), message: error ? 'Kiểm tra lại thông tin đăng nhập !' : 'Tài khoản đã được tạo !' });
                });
            }
        })
    })
    //Đăng nhập
    app.get('/login', function (req, res) {  
        res.render('login', { title: 'Đăng nhập'});
    });
    //Xử lý đang nhập
    app.post('/login', function(req, res){
        users.findOne({username:req.body.username,password:req.body.password},function(err,user){
            if(!user){
                res.json({ code:500,message:'Đăng nhập thất bại !' });
            }else{
                res.json({ code:200,message:'Đăng nhập thành công !' });
                req.session._id=user._id;
                req.session.fullname=user.fullname;
            }
        })
    })
}