
//Xóa sản phẩm khi click vào thùng rác
items = document.querySelectorAll(".cart_item")
items.forEach((item, i) => {
    item.querySelector('.zmdi-delete').addEventListener('click', (e) => {
        var _id = $(item).attr('data-id');
        swal({
            title: "Sản phẩm này sẽ bị xóa khỏi giỏ hàng ?",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((resp) => {
                if (resp) {
                    $.ajax({
                        method: "POST",
                        url: "/cart",
                        data: { "_id": _id }
                    }).done(function (resp) {
                        if (resp.code == 200) {
                            item.remove();
                            swal("Thành công !", "Sản phẩm đã được xóa", "success").then(function () {
                                location.reload();
                            })
                        } else {
                            swal("Thất bại !", "Sản phẩm chưa được xóa", "error")
                        }
                    });
                }
            });
    })
});
$(document).on('click', '.update_cart', function () {
    swal({
        title: "Bạn có muốn cập nhật lại giỏ hàng ?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
        .then((resp) => {
            if (resp) {
                var arrData = [];
                dsMuahang = document.querySelectorAll(".quantity")
                dsMuahang.forEach((item, i) => {
                    arrData.push({ "_id": $("#id" + i).val(), "quantityOrder": $("#quantityOrder" + i).val() })
                });
                var dataSend = JSON.stringify(arrData)
                $.ajax({
                    method: "POST",
                    url: "/update-cart",
                    data: { data: dataSend }
                }).done(function (resp) {
                    if (resp.code == 200) {
                        swal("Thành công !", "Giỏ hàng đã được cập nhật", "success").then(function () {
                            location.reload();
                        })
                    } else {
                        swal("Thất bại !", "Cập nhật thất bại", "error")
                    }
                });
            }
        });
})
//khi nhập quá số lượng sản phẩm
dsMuahang = document.querySelectorAll(".quantity")
dsMuahang.forEach((item, i) => {
    item.querySelector('#quantityOrder' + i).addEventListener('change', (e) => {
        let dataMax = $(item).attr('data-max');
        if (parseInt($("#quantityOrder" + i).val()) > parseInt(dataMax)) {
            $("#quantityOrder" + i).val(dataMax)
            swal("Cảnh báo !", "Bạn chỉ có thể mua tối đa " + dataMax + " sản phẩm", "warning")
        }
    })
});
//thanh toán khi mua hàng
$(document).on('click', '.submit-cart', function () {
    if (idCustomer == null) {
        swal("Mua hàng thất bại !", "Vui lòng đăng nhập trước khi mua hàng ! ", "error").then(function () {
            window.location.href = "/login"
        })
    } else {
        swal({
            title: "Bạn có xác nhận muốn mua hàng không ?",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((resp) => {
                if (resp) {
                    var arrData = [];
                    dsMuahang = document.querySelectorAll(".quantity")
                    dsMuahang.forEach((item, i) => {
                        arrData.push({ "_id": $("#id" + i).val(), "quantityOrder": $("#quantityOrder" + i).val() })
                    });
                    var dataSend = JSON.stringify(arrData)
                    $.ajax({
                        method: "POST",
                        url: "/order",
                        data: { data: dataSend, "totalAll": $("#totalAll").val() }
                    }).done(function (resp) {
                        if (resp.code == 200) {
                            swal("Thành công !", "Mua hàng thành công", "success").then(function () {
                                window.location.href="/home"
                            })
                        } else {
                            swal("Thất bại !", "Mua hàng thất bại", "error")
                        }
                    });
                }
            });
    }

})

// chuyển trang danh sách đặt hàng
$(document).on('click', '.list-cart', function () {
    window.location.href="/list-cart"
})