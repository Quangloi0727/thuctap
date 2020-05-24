
var order = require('../modal/order.js');
var numeral = require('numeral');
var moment = require('moment');
var _ = require('underscore')
var async = require('async')
var fsx = require('fs.extra')
var path = require('path')
var rootPath = path.dirname(require.main.filename);
var Excel = require('exceljs')
var isodate = require("isodate");
var title = "BÁO CÁO DOANH THU";
var titleHeadTable = [
    { key: 'stt', value: 'STT', },
    { key: 'code', value: 'Mã đơn hàng' },
    { key: 'total', value: 'Thành tiền' },
    { key: 'date', value: 'Ngày chốt đơn' },
]
module.exports = function (app) {
    //Sản phẩm bán chạy
    app.get('/report-sales-month', function (req, res) {
        //báo cáo
        if (req.query.report) {
            exportExcel(req, res);
        } else {
            async.parallel({
                //sản phẩm bán chạy
                reportSales: function (next) {
                    let aggs = bindAggs(req, res);
                    order.aggregate(aggs, next)
                },
            },
                function (err, results) {
                    res.render('report-sales-month', {
                        title: 'Báo cáo doanh thu ',
                        numeral: numeral,
                        moment: moment,
                        reportSales: results.reportSales,
                        code: req.query.code,
                        createdAtForm: req.query.createdAtForm,
                        createdAtTo: req.query.createdAtTo,
                    });
                });
        }
    });
}
function bindAggs(req, res) {
    //query dữ liệu danh sách bán hàng
    var query = {}
    if (req.query.code) {
        query.code = { $regex: new RegExp(stringRegex(req.query.code), 'gi') };
    }
    if (req.query.createdAtForm) {
        console.log("từ ngày", req.query.createdAtForm)
        query.createdConfirm = {}
        query.createdConfirm.$gte = isodate(req.query.createdAtForm);
    }
    if (req.query.createdAtTo) {
        query.createdConfirm = {}
        query.createdConfirm.$lte = isodate(req.query.createdAtTo);
    }
    let aggs = [
        // { $match: query },
        { $match: { "status": 3 } },
        { $match: query },
        {
            $lookup:
            {
                from: "order-detail",
                localField: "_id",
                foreignField: "orderId",
                as: "order"
            }
        },
        {
            $lookup:
            {
                from: "customers",
                localField: "customerId",
                foreignField: "_id",
                as: "customer"
            }
        },
        {
            $lookup:
            {
                from: "customers",
                localField: "customerId",
                foreignField: "_id",
                as: "customer"
            }
        },
        {
            $lookup:
            {
                from: "users",
                localField: "createdBy",
                foreignField: "_id",
                as: "user"
            }
        },
        { $unwind: { path: '$order', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$order.products', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        {
            $lookup:
            {
                from: "product",
                localField: "order.products.phoneId",
                foreignField: "_id",
                as: "product"
            }
        },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
        {
            $group: {
                _id: "$_id",
                status: { $first: "$status" },
                code: { $first: "$code" },
                note: { $first: "$note" },
                total: { $first: "$total" },
                created: { $first: "$created" },
                createdConfirm: { $first: "$createdConfirm" },
                productOrder: { $push: "$order.products" },
                product: { $push: "$product" },
                customer: { $first: "$customer" },
                user: { $first: "$user" }
            }
        },
    ]
    return aggs;
}

function exportExcel(req, res) {
    var limitIndex = 100;

    var waterFallTask = [];

    var aggs = bindAggs(req, res);
    waterFallTask.push(function (next) {
        aggs.push({ $skip: 0 });
        aggs.push({ $limit: limitIndex });

        var workbook = new Excel.Workbook();
        // workbook.creator = req.session.user.displayName;
        workbook.created = new Date();

        next(null, workbook, aggs, 1)
    });

    for (var i = 1; i <= 1; i++) {

        waterFallTask.push(function (workbook, aggs, indexSheet, next) {
            order.aggregate(aggs, function (error, result) {
                var sheet = workbook.addWorksheet('sheet' + indexSheet, { state: 'visible' });
                createTitleExcel(sheet, title);
                createHead(sheet);
                customView(sheet, result.length);
                var sum = 0;
                for (let i = 0; i < result.length; i++) {
                    sum += result[i].total
                    sheet.addRow([
                        (i + 1),
                        (result[i].code !== undefined ? result[i].code : ''),
                        (result[i].total !== undefined ? numeral(result[i].total).format('0,0 ') : ''),
                        (result[i].createdConfirm !== undefined ? moment(result[i].createdConfirm).format('HH:mm DD/MM/YYYY') : ''),
                    ]);
                    for (let i = 1; i <= titleHeadTable.length; i++) {
                        let charNameColumn = columnToLetter(i);

                        sheet.lastRow.getCell(charNameColumn).border = {
                            top: { style: "thin" },
                            left: { style: "thin" },
                            bottom: { style: "thin" },
                            right: { style: "thin" }
                        }
                        sheet.lastRow.getCell(charNameColumn).font = {
                            name: 'Times New Roman',
                            family: 4,
                            size: 12
                        };
                        if (charNameColumn != 'Z') {
                            sheet.lastRow.getCell(charNameColumn).alignment = { vertical: 'middle', horizontal: 'center' };
                        }
                    }

                }
                var row = sheet.lastRow;
                sheet.addRow([('TỔNG'), (''), (numeral(sum).format('0,0')), ('')]);
                for (let i = 1; i <= titleHeadTable.length; i++) {
                    let charNameColumn = columnToLetter(i);

                    sheet.lastRow.getCell(charNameColumn).border = {
                        top: { style: "medium" },
                        left: { style: "medium" },
                        bottom: { style: "medium" },
                        right: { style: "medium" }
                    }
                    sheet.lastRow.getCell(charNameColumn).alignment = { vertical: 'middle', horizontal: 'center' };
                }
                sheet.mergeCells(`A${row._number + 1}:B${row._number + 1}`);
                sheet.getCell(`A${row._number + 1}`).font = { name: 'Times New Roman', family: 4, size: 12, bold: true };
                sheet.getCell(`A${row._number + 1}`).alignment = { vertical: 'middle', horizontal: 'center' };
                // sheet.mergeCells(`F${row._number + 1}:G${row._number + 1}`);
                sheet.getCell(`G${row._number + 1}`).font = { name: 'Times New Roman', family: 4, size: 12, bold: true };
                sheet.getCell(`G${row._number + 1}`).alignment = { vertical: 'middle', horizontal: 'center' };
                sheet.addRow([]);

                sheet.addRow([('NGƯỜI PHÊ DUYỆT'), (''), (''), (''), ('Hà Nội, ngày....tháng....năm')])
                sheet.mergeCells(`A${row._number + 3}:C${row._number + 3}`);
                sheet.getCell(`A${row._number + 3}`).font = { name: 'Times New Roman', family: 4, size: 12, bold: true };
                sheet.getCell(`A${row._number + 3}`).alignment = { vertical: 'middle', horizontal: 'center' };
                sheet.mergeCells(`E${row._number + 3}:G${row._number + 3}`);
                sheet.getCell(`E${row._number + 3}`).font = { name: 'Times New Roman', family: 4, size: 12, bold: true };
                sheet.getCell(`E${row._number + 3}`).alignment = { vertical: 'middle', horizontal: 'center' };

                sheet.addRow([('(Ký và ghi rõ họ tên)'), (''), (''), (''), ('NGƯỜI LẬP')])
                sheet.mergeCells(`A${row._number + 4}:C${row._number + 4}`);
                sheet.getCell(`A${row._number + 4}`).font = { name: 'Times New Roman', family: 4, size: 12, italic: true };
                sheet.getCell(`A${row._number + 4}`).alignment = { vertical: 'middle', horizontal: 'center' };
                sheet.mergeCells(`E${row._number + 4}:G${row._number + 4}`);
                sheet.getCell(`E${row._number + 4}`).font = { name: 'Times New Roman', family: 4, size: 12, bold: true };
                sheet.getCell(`E${row._number + 4}`).alignment = { vertical: 'middle', horizontal: 'center' };

                sheet.addRow([(''), (''), (''), (''), ('(Ký và ghi rõ họ tên)')])
                sheet.mergeCells(`E${row._number + 5}:G${row._number + 5}`);
                sheet.getCell(`E${row._number + 5}`).font = { name: 'Times New Roman', family: 5, size: 12, italic: true };
                sheet.getCell(`E${row._number + 5}`).alignment = { vertical: 'middle', horizontal: 'center' };
                aggs.pop();
                aggs.pop();
                aggs.push({ $skip: (indexSheet * limitIndex) });
                aggs.push({ $limit: limitIndex });

                indexSheet = indexSheet + 1;
                next(null, workbook, aggs, indexSheet);
            })
        });
    }

    waterFallTask.push(
        function (workbook, aggs, indexSheet, next) {

            fsx.mkdirs(path.join('C:', 'Users', 'QuangLoi', 'Desktop', 'hoabinhstore', 'hoabinhstore', 'public', 'assets'), function (error, result) {

                next(error, workbook);

            });
        },
        function (workbook, next) {
            var currentDate = new Date();
            var fileName = path.join('C:', 'Users', 'QuangLoi', 'Desktop', 'hoabinhstore', 'hoabinhstore', 'public', 'assets', 'BaoCaoDoanhThu_' + currentDate.getTime() + '.xlsx');
            workbook.xlsx.writeFile(fileName).then(function (error, result) {
                next(error, path.join('assets', 'BaoCaoDoanhThu_' + currentDate.getTime() + '.xlsx'));
            });
        }
    );

    async.waterfall(waterFallTask, function (error, result) {

        res.json({ code: error ? 500 : 200, data: '/' + result });
    });


}


function columnToLetter(column) {
    var temp, letter = '';
    while (column > 0) {
        temp = (column - 1) % 26;
        letter = String.fromCharCode(temp + 65) + letter;
        column = (column - temp - 1) / 26;
    }
    return letter;
}

function createTitleExcel(worksheet, title, startDate, endDate, type) {
    worksheet.getCell('A2').value = title;
    worksheet.getCell('A2').font = { name: 'Times New Roman', family: 4, size: 16, underline: 'true', bold: true };
    worksheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.mergeCells('A2:D2');

    worksheet.addRow([]);
}
function customView(worksheet, countRow) {

    for (let i = 1; i <= titleHeadTable.length; i++) {
        let charNameColumn = columnToLetter(i);
        worksheet.lastRow.getCell(charNameColumn).border = {
            top: { style: "medium" },
            left: { style: "medium" },
            bottom: { style: "medium" },
            right: { style: "medium" }
        }
        worksheet.lastRow.getCell(charNameColumn).font = {
            name: 'Times New Roman',
            family: 4,
            size: 12,
            bold: true
        };
        worksheet.lastRow.getCell(charNameColumn).alignment = { vertical: 'middle', horizontal: 'center' };
    }

}
function createHead(worksheet) {
    //Header 01
    worksheet.addRow(_.pluck(titleHeadTable, 'value'));
    var dobCol1 = worksheet.getColumn(1);
    dobCol1.width = 15;
    var dobCol2 = worksheet.getColumn(2);
    dobCol2.width = 30;
    var dobCol3 = worksheet.getColumn(3);
    dobCol3.width = 15;
    var dobCol4 = worksheet.getColumn(4);
    dobCol4.width = 20;
}

// hàm chuyển hóa chuỗi tìm kiếm nhập vào
stringRegex = function (e) {
    for (var t = e.toLowerCase().replace(/^(\s*)|(\s*)$/g, "").replace(/\s+/g, " "), n = "àáảãạâầấẩẫậăằắẳẵặa", i = "đd", o = "ùúủũụưừứửữựu", a = "ìíỉĩịi", r = "èéẻẽẹêềếểễệe", c = "òóỏõọôồốổỗộơờớởỡợo", l = "ỳýỷỹỵy", u = "", s = 0; s < t.length; s++) n.indexOf(t[s]) >= 0 ? u = u + "[" + n + "]" : i.indexOf(t[s]) >= 0 ? u = u + "[" + i + "]" : o.indexOf(t[s]) >= 0 ? u = u + "[" + o + "]" : a.indexOf(t[s]) >= 0 ? u = u + "[" + a + "]" : r.indexOf(t[s]) >= 0 ? u = u + "[" + r + "]" : c.indexOf(t[s]) >= 0 ? u = u + "[" + c + "]" : l.indexOf(t[s]) >= 0 ? u = u + "[" + l + "]" : u += t[s];
    return u
}