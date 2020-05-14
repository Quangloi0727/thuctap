const $btnTaomoi = document.getElementById('Taomoi');
var pattern = /^[0-9]+$/; //chỉ được nhập số 
const $btnBack = document.getElementById('btn-back');
$btnTaomoi.addEventListener('click', (e) => {
    e.preventDefault();
    if ($('#name').val()==""||$('#name').val().length<0||$('#ram').val()==""||$('#ram').val().length<0||$('#camera').val()==""||$('#camera').val().length<0||$('#memory').val()==""||$('#memory').val().length<0||
        $('#description').val()==""||$('#description').val().length<0||
        $('#groupProduct').val()=="-1"||$('#color').val()=="-1"){
            swal ( "Thất bại !" , "Kiếm tra lại thông tin nhập vào",  "error")
            return;
    }else if($('#price').val()==""||$('#price').val().length<0||(!$('#price').val().match(pattern))||
            $('#quantity').val()==""||$('#quantity').val().length<0||(!$('#quantity').val().match(pattern))){
            swal ( "Thất bại !" , "Giá và số lượng chỉ được nhập số !",  "error")
            return;
    }else{
        $.ajax({
            method: "POST",
            url: "/add-product",
            data: $('#add-product').serialize()
        }).done(function( resp ) {
            if (resp.code==200) {
                swal ( "Thành công !" ,  resp.message , "success" ).then(function() {
                    window.location.href = "/product";
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
    