console.log("loaddddd")
const $btnDangnhap = document.getElementById('btn-Dangnhap');
$btnDangnhap.addEventListener('click', (e) => {
    e.preventDefault();
    $.ajax({
        method: "POST",
        url: "/login-admin",
        data: $('#loginAdmin').serialize()
    }).done(function (resp) {
        if (resp.code==200) {
            window.location.href = "/admin";
        } else {
            swal ( "Thất bại !" ,"Kiểm tra lại thông tin đăng nhập !", "error" )
        }
    });
})