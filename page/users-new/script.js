const $btnTaomoi = document.getElementById('btn-dangki');
const $btnBack = document.getElementById('btn-back');
$btnTaomoi.addEventListener('click', (e) => {
    e.preventDefault();
    if ($('#username').val()==""||$('#username').val().length<0||
        $('#email').val()==""||$('#email').val().length<0||
        $('#password').val()==""||$('#password').val().length<0||
        $('#fullname').val()==""||$('#fullname').val().length<0||
        $('#phone').val()==""||$('#phone').val().length<0||
        $('#address').val()==""||$('#address').val().length<0||
        $('#password').val()!=$('#passwordConfirm').val()){
            swal ( "Thất bại !" , "Kiếm tra lại thông tin nhập vào",  "error")
            return;
    }else {
        $.ajax({
            method: "POST",
            url: "/users-new",
            data: $('#TaomoiUser').serialize()
        }).done(function( resp ) {
            if (resp.code==200) {
                swal ( "Thành công !" ,  resp.message , "success" ).then(function() {
                    window.location.href = "/login";
                })
            } else {
                swal ( "Thất bại !" , resp.message, "error" )
            }
        });
    }
})

$btnBack.addEventListener('click', () => {
    window.history.back();
})
    