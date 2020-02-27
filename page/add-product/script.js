const $btnTaomoi = document.getElementById('Taomoi');
var pattern = /^[0-9]+$/; //chỉ được nhập số 
// var arrImg=document.getElementsByName("images")
$btnTaomoi.addEventListener('click', (e) => {
    e.preventDefault();
    if ($('#name').val()==""||$('#name').val().length<0||
        $('#description').val()==""||$('#description').val().length<0||
        $('#groupProduct').val()=="-1"){
            swal ( "Thất bại !" , "Kiếm tra lại thông tin nhập vào",  "error")
            return;
    }else if($('#price').val()==""||$('#price').val().length<0||(!$('#price').val().match(pattern))||
            $('#quantity').val()==""||$('#quantity').val().length<0||(!$('#quantity').val().match(pattern))){
            swal ( "Thất bại !" , "Giá và số lượng chỉ được nhập số !",  "error")
            return;
    // }else if(arrImg[0].files.length==0||
    //          arrImg[1].files.length==0||
    //          arrImg[2].files.length==0||
    //          arrImg[3].files.length==0||
    //          arrImg[4].files.length==0){
    //         swal ( "Thất bại !" , "Thêm các ảnh sản phẩm !",  "error")
    //         return;
    // }
        }else{
        // var arr=[];
        // arrImg.forEach(function(item){
        //     arr.push(item.value)
        // })
        let file = $('#images').get(0).files;
        const formData = new FormData();
        formData.append('uploads', file, file.name);
        console.log(file)
        $.ajax({
            method: "POST",
            url: "/add-product",
            data: JSON.stringify({
                file: file
            }),
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
