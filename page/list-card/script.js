// chuyển trang danh sách đặt hàng
$(document).on('click', '.destroy-cart', function () {
    var id = $(this).attr("data-id")
    swal({
        title: "Bạn có muốn hủy đơn hàng ?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
        .then((resp) => {
            if (resp) {
                $.ajax({
                    method: "POST",
                    url: "/list-cart",
                    data: { "id": id }
                }).done(function (resp) {
                    if (resp.code == 200) {
                        swal("Thành công !", "Đơn hàng đã được xóa !", "success").then(function () {
                            location.reload();
                        })
                    } else {
                        swal("Thất bại !", "Xóa thất bại", "error")
                    }
                });
            }
        });
})