var request = require("request");
var express = require('express');
var myconst = require("./const");

var router = express.Router();
//路由 ../moblie/
// 'use strict';
// var form_all = {};

router.get('/move', function (req, res, next) {
    console.log("基本信息");
    res.render('move');
});
router.post('/move', function (req, res, next) {
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
        console.log(">>>move8 mobile.js: Authentication results: ", body);
        if (!error && response.statusCode == 200) {
            var obj = JSON.parse(body); //由JSON字符串转换为JSON对象
            // 请求成功的处理逻辑
            // 登陆成功后将token写入Cookie，maxAge为cookie过期时间
            console.log(">>>move8 mobile.js -> obj: ", obj);
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
            // res.json({status:1, msg:""});  

            var newurl = myconst.apiurl + "prj001/mobile/";
            var authstring = obj.access_token;
            //body直接传过来的数据有[Object: null prototype],通过stringify和parse
            //方法可以去掉
            // var results_data = JSON.stringify(req.body);//JSON.stringify()从一个对象中解析出字符串
            // results_data = JSON.parse(results_data);//JSON.parse() 从一个字符串中解析出json对象
            // console.log("results_data:",results_data);
            
            var form_data = req.body;
            // var mydata = '{"info":{"name":"我","telephone":"12345678901","age":"12","address":"北京北京","entrance":"病房","owner":"874174345@qq.com"}}';
            // console.log("mydata类型:", typeof(mydata));
            console.log("form_data:",form_data);
            var options = {
                // form: {data:JSON.stringify(all_form)},
                form: {data:form_data.all_data},
                url: newurl,
                headers: {
                    'Authorization': 'Bearer ' + authstring,
                    'Content-Type': 'application/json'
                }
            };  
            request.post(options, function (error, response, body) {
                console.log("JSON.parse(body).msg:", JSON.parse(body).msg);
                console.log("response.statusCode: ", response.statusCode);
                var mobile_body = JSON.parse(body);
                if (!error && response.statusCode == 200) {
                    if (mobile_body.msg == "信息提交成功") {
                        res.json({status:1, msg:mobile_body.msg});
                    } else {
                        res.json({status:1, msg:mobile_body.msg});
                    }    
                    //res.json()不能用在太前面，否则会调用res.send()
                    //res.render and res.json will both call res.end() 
                    //which is basically like trying to send a response twice to the client
                } else {
                    console.log("有未填写信息response:", mobile_body.msg);
                    res.json({status:0, msg:mobile_body.msg});
                    // console.log('response.statusCode wrong');
                }
            })       
        }
        else {
            var err = JSON.parse(body); //由JSON字符串转换为JSON对象
            res.json({status:2, msg:""});
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