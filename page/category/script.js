
$(document).on('click', '.zmdi-delete', function () {
    var _id = $(this).attr('data-id');
    swal({
        title: "Danh mục này sẽ bị xóa ?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
    .then((resp) => {
        if (resp) {
            $.ajax({
                method: "GET",
                url: "/category-remove/"+_id,
            }).done(function( resp ) {
                if (resp.code==200) {
                    swal ( "Thành công !" ,  "Danh mục đã được xóa" , "success" ).then(function() {
                        window.location.href = "/category";
                    })
                } else {
                    swal ( "Thất bại !" , "Danh mục chưa được xóa", "error" )
                }
            });
        }
    });
});

$(document).on('click', '.au-btn--small', function () {
    window.location.href = "/add-category";
});
var x = document.getElementsByClassName("tr-shadow");
for (let i = 0; i < x.length; i++) {
    switch (x[i].getAttribute('data-css') % 2) {
        case 0:
            x[i].setAttribute("class", "bgm")
            break;
    }
}