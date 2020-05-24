
$(document).on('click', '.zmdi-delete', function () {
    var _id = $(this).attr('data-id');
    swal({
        title: "Tin tức này sẽ bị xóa ?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
    .then((resp) => {
        if (resp) {
            $.ajax({
                method: "GET",
                url: "/new-remove/"+_id,
            }).done(function( resp ) {
                if (resp.code==200) {
                    swal ( "Thành công !" ,  "Tin tức đã được xóa" , "success" ).then(function() {
                        window.location.href = "/new";
                    })
                } else {
                    swal ( "Thất bại !" , "Tin tức chưa được xóa", "error" )
                }
            });
        }
    });
});

$(document).on('click', '.au-btn--small', function () {
    window.location.href = "/add-new";
});