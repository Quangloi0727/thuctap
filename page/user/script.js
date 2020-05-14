
$(document).on('click', '.zmdi-delete', function () {
    var _id = $(this).attr('data-id');
    swal({
        title: "Nhân viên này sẽ bị xóa ?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
    .then((resp) => {
        if (resp) {
            $.ajax({
                method: "GET",
                url: "/user-remove/"+_id,
            }).done(function( resp ) {
                if (resp.code==200) {
                    swal ( "Thành công !" ,  "Nhân viên đã được xóa" , "success" ).then(function() {
                        window.location.href = "/user";
                    })
                } else {
                    swal ( "Thất bại !" , "Nhân viên chưa được xóa", "error" )
                }
            });
        }
    });
});

$(document).on('click', '.au-btn--small', function () {
    window.location.href = "/add-user";
});