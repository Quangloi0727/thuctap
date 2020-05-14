const $btnTaomoi = document.getElementById('Taomoi');
const $btnBack = document.getElementById('btn-back');
$btnTaomoi.addEventListener('click', (e) => {
    e.preventDefault();
    if ($('#name').val()==""||$('#name').val().length<0||
        $('#ode').val()==""||$('#code').val().length<0){
            swal ( "Thất bại !" , "Vui lòng nhập đầy đủ thông tin",  "error")
            return;
    }else{
        $.ajax({
            method: "POST",
            url: "/add-category",
            data: $('#add-category').serialize()
        }).done(function( resp ) {
            if (resp.code==200) {
                swal ( "Thành công !" ,  resp.message , "success" ).then(function() {
                    window.location.href = "/category";
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
    