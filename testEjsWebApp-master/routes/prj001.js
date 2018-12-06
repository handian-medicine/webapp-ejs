var request = require("request");
var express = require('express');
var myconst = require("./const");
var router = express.Router();

/* GET prj001 home page. */
router.get('/', function (req, res, next) {
    console.log(">>>Visting prj001 page!");

    //如果cookie里面有prj001的access_token，那么可以直接获取该项目案例
    if (req.cookies.prj001token) {
        //直接发起数据请求，获取所有prj001项目的案例
        var url = myconst.apiurl + "prj001/geninfo/";
        var authstring = req.cookies.prj001token.access_token;
        console.log(">>> prj001.js access_token: " + authstring);

        var options = {
            url: url,
            headers: {
                'Authorization': 'Bearer ' + authstring
            }
        };
        //这里增加请求内容
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var archiveobjs = JSON.parse(body);
                console.log(">>>prj001.js -> archiveobjs: ", archiveobjs);
                res.render('prj001', {
                    title: '流调项目-排卵障碍性异常子宫出血',
                    archives: archiveobjs.results,
                    username: req.cookies.userinfo.email
                });
            } else {
                console.log(">>>Getting archives met unknown error. " + err.error_description);
                res.redirect("login");
            }
        });
    }
    //如果cookie里面没有prj001的access_token，
    //那么需要先获取一个scope为prj001的access_token
    else {
        if (req.cookies.userinfo) {
            var url = myconst.apiurl + "o/token/";
            var loginData = {
                "username": req.cookies.userinfo.email,
                "password": req.cookies.userinfo.password,
                "grant_type": "password",
                "scope": myconst.scope_prj001,
                "client_id": myconst.client_id,
                "client_secret": myconst.client_secret
            };
            console.log(">>>Info used for prj001 authentication: " + JSON.stringify(loginData));
            request.post({url: url,form: loginData}, function (error, response, body) {
                console.log(">>>Authentication results: " + body);
                if (!error && response.statusCode == 200) {
                    var obj = JSON.parse(body); //由JSON字符串转换为JSON对象
                    // 成功后将token写入Cookie，maxAge为cookie过期时间
                    res.cookie("prj001token", {
                        "access_token": obj.access_token,
                        "refresh_token": obj.refresh_token,
                        "scope": obj.scope,
                        "expires_in": obj.expires_in
                    }, {
                        maxAge: 1000 * 60 * 60 * 4,
                        httpOnly: true
                    }); //cookie 4小时有效时间

                    //进一步发起数据请求，获取所有prj001项目的案例
                    url = myconst.apiurl + "prj001/geninfo/";
                    var authstring = obj.access_token;
                    console.log(">>> prj001 access_token: " + authstring);

                    var options = {
                        url: url,
                        headers: {
                            'Authorization': 'Bearer ' + authstring
                        }
                    };
                    
                    request(options, function (error, response, body) {
                        //console.log(">>>cookie里面没有prj001的access_token, prj001.js -> archiveobjs->id: ", archiveobjs.results[1].id);
                        if (!error && response.statusCode == 200) {
                            var archiveobjs = JSON.parse(body);
                            res.render('prj001', {
                                title: '流调项目-排卵障碍性异常子宫出血',
                                archives: archiveobjs.results,
                                username: req.cookies.userinfo.email
                            });
                        } else {
                            console.log(">>>Getting archives met unknown error. " + err.error_description);
                            res.redirect("login");
                        }
                    });
                } else {
                    console.log(">>>Invoking access token met unknown error. " + err.error_description);
                    res.redirect("login");
                }
            });
        } else {
            console.log(">>>Failed to find cookie with user info");
            res.redirect("login");
        }
    }

});
// router.get('/geninfo', function (req, res, next){
//     if (req.cookies.prj001token) {
//         id = 1
//         var url = myconst.apiurl + "/prj001/geninfo/" + id;
//     }
// });
// router.get('/symptom', function (req, res, next){
//     /prj001/symptom/{id}/
// });

// router.get('/menstruation', function (req, res, next){
//     /prj001/menstruation/{id}/
// });
// router.get('/other', function (req, res, next){
//     /prj001/other/{id}/
// });
// router.get('/cc', function (req, res, next){
//     /prj001/cc/{id}/
// });


module.exports = router;