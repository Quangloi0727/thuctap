
$(document).on('click', '.zmdi-delete', function () {
    var _id = $(this).attr('data-id');
    swal({
        title: "Nhân viên giao hàng này sẽ bị xóa ?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
    .then((resp) => {
        if (resp) {
            $.ajax({
                method: "GET",
                url: "/deliverer-remove/"+_id,
            }).done(function( resp ) {
                if (resp.code==200) {
                    swal ( "Thành công !" ,  "Nhân viên giao hàng đã được xóa" , "success" ).then(function() {
                        window.location.href = "/deliverer";
                    })
                } else {
                    swal ( "Thất bại !" , "Nhân viên giao hàng chưa được xóa", "error" )
                }
            });
        }
    });
});

$(document).on('click', '.au-btn--small', function () {
    window.location.href = "/add-deliverer";
});