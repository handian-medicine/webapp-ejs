var request = require("request");
var express = require('express');
var myconst = require("./const");
var router = express.Router();

router.get('/', function (req, res, next) {
    console.log(">>>Visting datainput page!");
    res.render('datainput');
});

router.post('/', function (req, res, next) {
    console.log(">>>datainput.js->post");
    if (req.cookies.prj001token) {
        var url = myconst.apiurl + "/prj001/geninfo/create/";
        var authstring = req.cookies.prj001token.access_token;
        var options = {
            url: url,
            headers: {
                'Authorization': 'Bearer ' + authstring
            }
        };  
        request.post(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var archiveobjs = JSON.parse(body);
                console.log(">>>datainput.js -> archiveobjs: ", archiveobjs);
                res.render('datainput');
            }
        })
        }
    })

         //把数据提交后台server
         //request.put(url, callback){
         //    var url = myconst.apiurl + "prj001/geninfo/" + archiveobjs.results[1].id;
        // };///prj001/geninfo/create/,update /prj001/geninfo/{id}
         //request(options, function (error, response, body){}
module.exports = router;