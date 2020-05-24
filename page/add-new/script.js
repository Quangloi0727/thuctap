const $btnTaomoi = document.getElementById('Taomoi');
const $btnBack = document.getElementById('btn-back');
$btnTaomoi.addEventListener('click', (e) => {
    e.preventDefault();
    $.ajax({
        method: "POST",
        url: "/add-new",
        data: $('#add-new').serialize()
    }).done(function (resp) {
        if (resp.code == 200) {
            swal("Thành công !", resp.message, "success").then(function () {
                window.location.href = "/new";
            })
        } else {
            swal("Thất bại !", resp.message, "error")
        }
    });
})
$btnBack.addEventListener('click', () => {
    window.history.back();
})
