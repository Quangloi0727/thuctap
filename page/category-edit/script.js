
$(document).on('click', '#Sua', function () {
    var _id = $(this).attr('data-id');
    $.ajax({
        method: "POST",
        url: "/category-edit/" + _id,
        data: $('#category-edit').serialize()
    }).done(function (resp) {
        if (resp.code == 200) {
            swal("Thành công !", resp.message, "success").then(function () {
                window.location.href = "/category";
            })
        } else {
            swal("Thất bại !", resp.message, "error")
        }
    });

});

$(document).on('click', '#btn-back', function () {
    window.history.back();
})
$(document).on('click', '.zmdi-delete', function (e) {
    e.preventDefault()
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
                        location.reload();
                    })
                } else {
                    swal ( "Thất bại !" , "Danh mục chưa được xóa", "error" )
                }
            });
        }
    });
});
$(document).on('click', '#Taomoi', function () {
    var _id = $(this).attr('data-id');
    $.ajax({
        method: "POST",
        url: "/add-category",
        data: $('#category-child').serialize() + "&parent_id=" + _id
    }).done(function (resp) {
        if (resp.code == 200) {
            swal("Thành công !", "Danh mục con đã được tạo mới", "success").then(function () {
                window.location.href = "/category-edit/"+_id;
            })
        } else {
            swal("Thất bại !", resp.message, "error")
        }
    });
})
$(document).on('click', '#EditChild', function (e) {
    e.preventDefault();
    // Click sửa danh mục
    $('#categoryChildEdit').modal(); //Show modal
    $('#editId').val($(this).data('id'));
    $('#editName').val($(this).data('name'));
    $('#editCode').val($(this).data('code'));
    if($(this).data('status') == true){
        $('#editStatus').attr('checked', 'checked');
    }else{
        $('#editStatus').removeAttr('checked');
    }
})
//Cập nhật danh mục con
$(document).on("click", "#updateCategoryChild", function(e){
    e.preventDefault();
    var subCat = {
        _id: $('#editId').val(),
        name: $('#editName').val(),
        code: $('#editCode').val(),
        status: $('#editStatus').is(':checked'),
    }
    $.ajax({
        method: "POST",
        url: "/category-edit/"+$('#editId').val(),
        data: subCat
    }).done(function (resp) {
        if (resp.code == 200) {
            swal("Thành công !", "Danh mục con đã được cập nhật", "success").then(function () {
                location.reload();
            })
        } else {
            swal("Thất bại !", "Cập nhật thất bại", "error")
        }
    });
})