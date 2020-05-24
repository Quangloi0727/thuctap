
$(document).on('click', '.zmdi-delete', function () {
    var _id = $(this).attr('data-id');
    swal({
        title: "Khách hàng này sẽ bị xóa ?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
    .then((resp) => {
        if (resp) {
            $.ajax({
                method: "GET",
                url: "/customers-remove/"+_id,
            }).done(function( resp ) {
                if (resp.code==200) {
                    swal ( "Thành công !" ,  "Khách hàng đã được xóa" , "success" ).then(function() {
                        window.location.href = "/customers";
                    })
                } else {
                    swal ( "Thất bại !" , "Khách hàng chưa được xóa", "error" )
                }
            });
        }
    });
});
