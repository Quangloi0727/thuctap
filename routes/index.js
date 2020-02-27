var express = require('express');
var router = express.Router();

/* Trang chủ. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express NodeJS' });
});
module.exports = router;
