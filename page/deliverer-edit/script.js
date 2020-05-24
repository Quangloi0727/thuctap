
$(document).on('click', '#Sua', function () {
    var _id = $(this).attr('data-id');
    $.ajax({
        method: "POST",
        url: "/deliverer-edit/"+_id,
        data: $('#deliverer-edit').serialize()
    }).done(function( resp ) {
        if (resp.code==200) {
            swal ( "Thành công !" , resp.message , "success" ).then(function() {
                window.location.href = "/deliverer";
            })
        } else {
            swal ( "Thất bại !" , resp.message, "error" )
        }
    });
      
});

$(document).on('click', '#btn-back', function () {
    window.history.back();
})
    