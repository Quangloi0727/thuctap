module.exports = function(app) {
    app.get('/home', function (req, res) {  
        // var fullname;
        // if(req.session.fullname){
        //     fullname=req.session.fullname
        // } else{
        //     fullname=""
        // }
        res.render('home', { title: 'Điện thoại Hòa Bình'});
    });    
}