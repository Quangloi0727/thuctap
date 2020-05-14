$(document).on('keyup', '#deliveryCost', function () {
    $("#deliveryCost").val(numeral($("#deliveryCost").val()).format('0,0') + " ₫")
    customerPay();
})
$(document).on('change', '#deliverer', function () {
    var options = this.children;
    for (var i = 0; i < options.length; i++) {
        if (options[i].selected) {
            var dataPhone = $(options[i]).attr('data-phone');
            $("#delivererPhone").val(dataPhone)
        }
    }
})

function customerPay() {
    //convert VD 20,000 VND -> 200000 valuevoucher
    var b = $("#valueVoucher").val()
    var c = b.split(",")
    var d = c.join('');

    //convert VD 20,000 VND -> 200000 discount
    var e = $("#deliveryCost").val()
    var f = e.split(",")
    var h = f.join('');

    // khách hàng phải trả
    $("#customerPay").val(numeral(parseInt(d) + parseInt(h)).format('0,0') + " ₫")
}
customerPay();
$(document).on('click', '#back', function () {
    window.history.back();
})
$(document).on('click', '#submit', function () {
    swal({
        title: "Bạn có chắc chắn muốn chốt đơn hàng ?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
        .then((resp) => {
            if (resp) {
                var _id = $(this).attr('data-id');
                $.ajax({
                    method: "POST",
                    url: "/order-edit/" + _id,
                    data: $('#order-edit').serialize()
                }).done(function (resp) {
                    if (resp.code == 200) {
                        swal("Thành công !", "Đơn hàng đã được tạo mới", "success").then(function () {
                            window.location.href = "/order";
                        })
                    } else {
                        swal("Thất bại !", "Thêm mới thất bại", "error")
                    }
                });
            }
        });
})
//đóng đơn hàng
$(document).on('click', '#close', function () {
    swal({
        title: "Xác nhận đóng đơn hàng ?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
        .then((resp) => {
            if (resp) {
                var _id = $(this).attr('data-id');
                $.ajax({
                    method: "POST",
                    url: "/order-edit/" + _id,
                    data: {"idClose":_id}
                }).done(function (resp) {
                    if (resp.code == 200) {
                        swal("Thành công !", "Đơn hàng đã được đóng lại", "success").then(function () {
                            window.location.href = "/order";
                        })
                    } else {
                        swal("Thất bại !", "Thất bại", "error")
                    }
                });
            }
        });
})
//hủy đơn hàng
$(document).on('click', '#delete', function () {
    swal({
        title: "Xác nhận hủy đơn hàng ?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
        .then((resp) => {
            if (resp) {
                var _id = $(this).attr('data-id');
                $.ajax({
                    method: "POST",
                    url: "/order-edit/" + _id,
                    data: {"idDelete":_id}
                }).done(function (resp) {
                    if (resp.code == 200) {
                        swal("Thành công !", "Đơn hàng đã được hủy", "success").then(function () {
                            window.location.href = "/order";
                        })
                    } else {
                        swal("Thất bại !", "Thất bại", "error")
                    }
                });
            }
        });
})