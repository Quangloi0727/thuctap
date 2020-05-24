const $btnTaomoi = document.getElementById('Taomoi');
const $btnBack = document.getElementById('btn-back');
$btnTaomoi.addEventListener('click', (e) => {
    e.preventDefault();
    if ($('#name').val()==""||$('#name').val().length<0||$('#phone').val()==""||$('#phone').val().length<0){
            swal ( "Thất bại !" , "Kiếm tra lại thông tin nhập vào",  "error")
            return;
    }else{
        $.ajax({
            method: "POST",
            url: "/add-deliverer",
            data: $('#add-deliverer').serialize()
        }).done(function( resp ) {
            if (resp.code==200) {
                swal ( "Thành công !" ,  resp.message , "success" ).then(function() {
                    window.location.href = "/deliverer";
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
    