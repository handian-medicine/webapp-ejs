var request = require("request");
var express = require('express');
var myconst = require("./const");
var mutipart= require('connect-multiparty');
var fs = require("fs");

var router = express.Router();

router.get('/', function (req, res, next) {
    res.render('dataana.html')
})