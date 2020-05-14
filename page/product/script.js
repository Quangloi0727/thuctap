
$(document).on('click', '.zmdi-delete', function () {
    var _id = $(this).attr('data-id');
    swal({
        title: "Sản phẩm này sẽ bị xóa ?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
    .then((resp) => {
        if (resp) {
            $.ajax({
                method: "GET",
                url: "/product-remove/"+_id,
            }).done(function( resp ) {
                if (resp.code==200) {
                    swal ( "Thành công !" ,  "Sản phẩm đã được xóa" , "success" ).then(function() {
                        window.location.href = "/product";
                    })
                } else {
                    swal ( "Thất bại !" , "Sản phẩm chưa được xóa", "error" )
                }
            });
        }
    });
});

$(document).on('click', '.au-btn--small', function () {
    window.location.href = "/add-product";
});