const $btnTaomoi = document.getElementById('Taomoi');
const $btnBack = document.getElementById('btn-back');
$btnTaomoi.addEventListener('click', (e) => {
    e.preventDefault();
    if ($('#fullname').val()==""||$('#fullname').val().length<0||$('#username').val()==""||$('#username').val().length<0||
        $('#password').val()==""||$('#password').val().length<0){
            swal ( "Thất bại !" , "Kiếm tra lại thông tin nhập vào",  "error")
            return;
    }else if($('#password').val()!=$('#confirmPassword').val()){
            swal ( "Thất bại !" , "Mật khẩu không trùng khớp !",  "error")
            return;
    }else{
        $.ajax({
            method: "POST",
            url: "/add-user",
            data: $('#add-user').serialize()
        }).done(function( resp ) {
            if (resp.code==200) {
                swal ( "Thành công !" ,  resp.message , "success" ).then(function() {
                    window.location.href = "/user";
                })
            } else {
                swal ( "Thất bại !" , "Thêm mới thất bại", "error" )
            }
        });
    }
})
$btnBack.addEventListener('click', () => {
    window.history.back();
})
    