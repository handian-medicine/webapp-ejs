var request = require("request");
var express = require('express');
var myconst = require("./const");

var router = express.Router();
//路由 ../moblie/
'use strict';
var form_all = {"data":{}};
router.get('/move1', function (req, res, next) {
    res.render('move1');
});
router.post('/move1', function (req, res, next) {
    var geninfo_data = JSON.stringify(req.body);
    geninfo_data = JSON.parse(geninfo_data);
    // console.log("body1",typeof(geninfo_data));
    // console.log("body1",geninfo_data["recdate"]);
    form_all["data"]["info"] = geninfo_data;
    console.log("form_all form_geninfo",form_all);
    res.json({form_all:form_all});
});

router.get('/move2', function (req, res, next) {
    res.render('move2');
});
router.post('/move2', function (req, res, next) {
    var summary_data = JSON.stringify(req.body);
    summary_data = JSON.parse(summary_data);
    form_all["data"]["summary"] = summary_data;
    console.log("form_all form_summary",form_all);
    res.json({form_all:form_all});
});

router.get('/move3', function (req, res, next) {
    res.render('move3');
});
router.post('/move3', function (req, res, next) {
    var history_data = JSON.stringify(req.body);
    history_data = JSON.parse(history_data);
    form_all["data"]["history"] = history_data;
    console.log("form_all form_history",form_all);
    res.json({form_all:form_all});
});

router.get('/move4', function (req, res, next) {
    res.render('move4');
});
// router.post('/move4', function (req, res, next) {
//     form_all = form_all + req.body.form_relevant;
//     console.log("form_all form_relevant",form_all);
//     res.json({form_all:form_all});
// });
router.post('/move4', function (req, res, next) {
        var url = myconst.apiurl + "o/token/";
        var mobileData = {
            "username": 'prj001-patient@handian.com',
            "password": 'asdf1234',
            "grant_type": "password",
            "scope": myconst.scope_users + " " + myconst.scope_prj001,
            "client_id": myconst.client_id,
            "client_secret": myconst.client_secret
        };
        request.post({url: url, form: mobileData}, function (error, response, body) {
            console.log(">>>mobile.js: Authentication results: ", body);
            if (!error && response.statusCode == 200) {
                var obj = JSON.parse(body); //由JSON字符串转换为JSON对象
                // 请求成功的处理逻辑
                // 登陆成功后将token写入Cookie，maxAge为cookie过期时间
                console.log(">>>mobile.js -> obj: ", obj);
                res.cookie("prj001token", {
                    "access_token": obj.access_token,
                    "refresh_token": obj.refresh_token,
                    "scope": obj.scope,
                    "expires_in": obj.expires_in
                    }, {maxAge: 1000 * 60 * 60 * 8, httpOnly: true}); //cookie 4小时有效时间
                res.cookie("userinfo", {
                    "email": 'prj001-patient@handian.com',
                    "password": 'asdf1234'
                    }, {maxAge: 1000 * 60 * 60 * 8, httpOnly: true});//cookie 4小时有效时间
                // console.log(">>>mobile.js -> Set-Cookie: ", res.get('Set-Cookie'));           
                res.json({status:1, msg:""});  

                var newurl = myconst.apiurl + "prj001/mobile/";
                var authstring = req.cookies.prj001token.access_token;
                //body直接传过来的数据有[Object: null prototype],通过stringify和parse
                //方法可以去掉
                var relevant_data = JSON.stringify(req.body);
                relevant_data = JSON.parse(relevant_data);

                form_all["data"]["relevant"] = relevant_data;
                var options = {
                    form: form_all,
                    url: newurl,
                    headers: {
                        'Authorization': 'Bearer ' + authstring,
                        'Content-Type': 'application/json'
                    }
                };  
                console.log("11111111mobile.js form_all:", typeof(form_all));
                console.log("11111111mobile.js form_all:", form_all);
                // console.log(">>>mobile.js -> options: ", options);
                request.post(options, function (error, response, body) {
                    console.log("response:", body);
                    console.log("response.statusCode: ", response.statusCode);
                    if (!error && response.statusCode == 200) {
                        res.json({status:1, msg:"录入成功"});
                        console.log("?????",form_all);
                        res.json({form_all:form_all});
                    } else {
                        console.log("?????",form_all);
                        res.json({status:0, msg:"录入失败"});
                        // console.log('response.statusCode wrong');
                    }
                })       
            }
            else {
                var err = JSON.parse(body); //由JSON字符串转换为JSON对象
                res.json({status:0, msg:""});
            }
        }); 
})

router.post('/input', function (req, res, next) {
    if (req.cookies.prj001token) {
        var url = myconst.apiurl + "prj001/mobile/";
        var authstring = req.cookies.prj001token.access_token;
        var options = {
            form: req.body.formdata,
            url: url,
            headers: {
                'Authorization': 'Bearer ' + authstring
            }
        };  
        console.log("prj001.js formdata:", req.body.formdata);
        console.log(">>>prj001.js -> options: ", options);
        request.post(options, function (error, response, body) {
            console.log("response:", body);
            // console.log("response.statusCode: ", response.statusCode);
            if (!error && response.statusCode == 200) {
                res.json({status:1, msg:"录入成功"});
                // console.log("prj001.js ajax result:", res);
                //res.render('datainput',{username: req.cookies.userinfo.email});
            } else {
                res.json({status:0, msg:"请输入完整信息"});
                console.log('response.statusCode wrong');
            }
        })
    }
})
module.exports = router;