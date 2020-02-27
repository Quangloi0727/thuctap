const $btnDangnhap = document.getElementById('btn-dangnhap');
const $btnBack = document.getElementById('btn-back');
$btnDangnhap.addEventListener('click', (e) => {
    e.preventDefault();
    $.ajax({
        method: "POST",
        url: "/login",
        data: $('#dangnhap').serialize()
    }).done(function( resp ) {
        if (resp.code==200) {
            swal ( "Thành công !" ,  resp.message , "success" ).then(function() {
                window.location.href = "/users-new";
            })
        } else {
            swal ( "Thất bại !" , resp.message, "error" )
        }
    });
})

$btnBack.addEventListener('click', () => {
    window.history.back();
})
    