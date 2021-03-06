var request = require("request");
var express = require('express');
var myconst = require("./const");
var url_pack = require("url");
var router = express.Router();
//路由 ../moblie/
// 'use strict';
// var form_all = {};
//move1?code=project001
var prj_code = "";
var mobileData = {
    "username": 'prj001-patient@handian.com',
    "password": 'asdf1234',
    "grant_type": "password",
    "scope": myconst.scope_users + " " + myconst.scope_prj001,
    "client_id": myconst.client_id,
    "client_secret": myconst.client_secret
};

router.get('/', function (req, res, next) {
    var params = url_pack.parse(req.url, true).query;
    prj_code = params["code"];
    console.log("基本信息,项目代号",params["code"]);
    var url = myconst.apiurl + "o/token/";
    
    switch (prj_code) {
        case "project001":
        mobileData.username = 'prj001-patient@handian.com';//根据需要更改字段信息
        break;
        case "project999":
        mobileData.username = 'prj001-patient@handian.com';//根据需要更改字段信息
        break;
    }
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
            switch (prj_code) {
                case "project001":
                res.render('project001/mobile'); 
                break;
                case "project999":  
                res.render('project999/mobile');
                break;
            };           
            
        } else {
                var err = JSON.parse(body); //由JSON字符串转换为JSON对象
                res.json({status:2, msg:""});
        }
    })
    
});
router.post('/', function (req, res, next) {
    var newurl = myconst.apiurl + "prj001/mobile/";
    var authstring = req.cookies.prj001token.access_token;
    //body直接传过来的数据有[Object: null prototype],通过stringify和parse方法可以去掉
    // var results_data = JSON.stringify(req.body);//JSON.stringify()从一个对象中解析出字符串
    // results_data = JSON.parse(results_data);//JSON.parse() 从一个字符串中解析出json对象
    
    var form_data = req.body;
    // var mydata = '{"info":{"name":"我","telephone":"12345678901","age":"12","address":"北京北京","entrance":"病房","owner":"874174345@qq.com"}}';
    console.log("手机端authstring:",authstring);
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
            console.log("if-1");
            // if (mobile_body.msg == "信息提交成功") {}
                res.json({status:1, msg:mobile_body.msg});
            //res.json()不能用在太前面，否则会调用res.send()
            //res.render and res.json will both call res.end() 
            //which is basically like trying to send a response twice to the client
        } else {
            if (response.statusCode==400) {
                console.log("if-2");
                res.json({status:2, msg:mobile_body.msg});
                //"错误信息:账号不存在"
            } else {
                console.log("else-1");
                res.json({status:3, msg:mobile_body.msg});
            }
            // console.log('response.statusCode wrong');
        }
    })    
})

router.get('/area',function (req, res, next) {
    console.log(req.cookies.prj001token);
    if (req.cookies.prj001token) {
        var area_url = myconst.apiurl + "users/area-list/";
        // var authstring = req.cookies.access_token;
        var authstring = req.cookies.prj001token.access_token;
        var options = {
            form: {prj_code:prj_code},
            url: area_url,
            headers: {
                'Authorization': 'Bearer ' + authstring,
                'Content-Type': 'application/json'
            }
        };  
        request.post(options, function (error, response, body) {
            console.log("获取地区信息,访问users/area-list/", body);
            var area_data = JSON.parse(body);
            console.log("长度：",area_data.length)
            res.json({area_data:area_data,area_length:area_data.length});
            return false;
        })

    }
})
router.post('/hospital',function (req, res, next) {
    console.log(req.cookies.prj001token);
    if (req.cookies.prj001token) {
        var area_url = myconst.apiurl + "users/area/";
        // var authstring = req.cookies.access_token;
        var authstring = req.cookies.prj001token.access_token;
        var area = req.body.area;
        // console.log("-----",area);
        var options = {
            form: {
                area:area,
                prj_code:prj_code
            },
            url: area_url,
            headers: {
                'Authorization': 'Bearer ' + authstring,
                'Content-Type': 'application/json'
            }
        };  
        request.post(options, function (error, response, body) {
            console.log("获取医院信息,访问users/area/", body);
            var hospital_data = JSON.parse(body);
            console.log("长度：",hospital_data.length)
            res.json({hospital_data:hospital_data, hospital_length:hospital_data.length});
            return false;
        })

    }
})
router.post('/owner',function (req, res, next) {
    console.log(req.cookies.prj001token);
    if (req.cookies.prj001token) {
        var area_url = myconst.apiurl + "users/area/";
        // var authstring = req.cookies.access_token;
        var authstring = req.cookies.prj001token.access_token;
        var hospital = req.body.hospital;
        // console.log("-----",area);
        var options = {
            form: {
                hospital:hospital,
                prj_code:prj_code
            },
            url: area_url,
            headers: {
                'Authorization': 'Bearer ' + authstring,
                'Content-Type': 'application/json'
            }
        };  
        request.put(options, function (error, response, body) {
            console.log("获取owner信息,访问users/area/", body);
            var owner_data = JSON.parse(body);
            console.log("长度：",owner_data.length)
            res.json({owner_data:owner_data, owner_length:owner_data.length});
            return false;
        })

    }
})


module.exports = router;