
var order = require('../modal/order.js');
var numeral = require('numeral');
var moment = require('moment');
var _ = require('underscore')
var async = require('async')
var fsx = require('fs.extra')
var path = require('path')
var rootPath = path.dirname(require.main.filename);
var Excel = require('exceljs')
var title = "BÁO CÁO DS SẢN PHẨM BÁN CHẠY";
var titleHeadTable = [
    { key: 'stt', value: 'STT', },
    { key: 'name', value: 'Tên sản phẩm', },
    { key: 'price', value: 'Giá sản phẩm' },
    { key: 'total', value: 'Tổng số bán' }
]
module.exports = function (app) {
    //Sản phẩm bán chạy
    app.get('/report-sells-product', function (req, res) {
        //báo cáo
        if (req.query.report) {
            exportExcel(req, res);
        } else {
            async.parallel({
                //sản phẩm bán chạy
                productSells: function (next) {
                    let aggs = bindAggs(req, res);
                    order.aggregate(aggs, next)
                },
            },
                function (err, results) {
                    res.render('report-sells-product', {
                        title: 'Danh sách sản phẩm bán chạy',
                        numeral: numeral,
                        moment: moment,
                        productSells: results.productSells,
                        name:req.query.name
                    });
                });
        }
    });
}
function bindAggs(req, res) {
    //query dữ liệu tính toàn công nợ phải thu
    var query = {}
    if (req.query.name) {
        query["product.name"] = { $regex: new RegExp(stringRegex(req.query.name), 'gi') };
    }
    let aggs = [
        { $match: { "status": 3 } },
        {
            $lookup:
            {
                from: "order-detail",
                localField: "_id",
                foreignField: "orderId",
                as: "order"
            }
        },
        { $unwind: { path: '$order', preserveNullAndEmptyArrays: true } },
        { $unwind: { path: '$order.products', preserveNullAndEmptyArrays: true } },
        {
            $group: {
                _id: "$order.products.phoneId",
                quantityOrder: { $sum: "$order.products.quantityOrder" },
            }
        },
        {
            $lookup:
            {
                from: "product",
                localField: "_id",
                foreignField: "_id",
                as: "product"
            }
        },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
        {
            $group: {
                _id: "$_id",
                quantityOrder: { $first: "$quantityOrder" },
                product: { $first: "$product" }
            }
        },
        { $match: query },
        { $sort: { quantityOrder: -1 } },
        { $limit: 10 }
    ]
    return aggs;
}

function exportExcel(req, res) {
    var limitIndex = 10;

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
                for (let i = 0; i < result.length; i++) {
                    sheet.addRow([
                        (i + 1),
                        (result[i].product.name !== undefined ? result[i].product.name : ''),
                        (result[i].product.price !== undefined ? numeral(result[i].product.price).format('0,0 ') : ''),
                        (result[i].quantityOrder !== undefined ? result[i].quantityOrder : ''),
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
            var fileName = path.join('C:', 'Users', 'QuangLoi', 'Desktop', 'hoabinhstore', 'hoabinhstore', 'public', 'assets', 'BaoCaoDanhSachSanPhamBanChay_' + currentDate.getTime() + '.xlsx');
            workbook.xlsx.writeFile(fileName).then(function (error, result) {
                next(error, path.join('assets', 'BaoCaoDanhSachSanPhamBanChay_' + currentDate.getTime() + '.xlsx'));
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