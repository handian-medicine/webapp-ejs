var request = require("request");
var express = require('express');
var myconst = require("./const");

var router = express.Router();
//路由 ../moblie/
// 'use strict';
var form_all = {};

//基本信息 
router.get('/move1', function (req, res, next) {
    console.log("基本信息");
    form_all["info"] = {};
    res.render('move1');
});
router.post('/move1', function (req, res, next) {
    // var geninfo_data = JSON.stringify(req.body);
    // geninfo_data = JSON.parse(geninfo_data);
    // form_all["data"]["info"] = geninfo_data;
    form_all["info"] = req.body;
    console.log("form_all form_info",form_all);
    // console.log("类型",typeof(form_all["summary"]))
    res.json({form_all:form_all});
});

//病情概要
router.get('/move2', function (req, res, next) {
    console.log("病情概要");
    form_all["summary"] = {};
    res.render('move2');
});
router.post('/move2', function (req, res, next) {
    form_all["summary"] = req.body;
    console.log("form_all form_summary",form_all);
    res.json({form_all:form_all});
});

//患者病史
router.get('/move3', function (req, res, next) {
    console.log("患者病史");
    form_all["history"] = {};
    res.render('move3');
});
router.post('/move3', function (req, res, next) {
    form_all["history"] = req.body;
    console.log("form_all form_history",form_all);
    res.json({form_all:form_all});
});

//相关检查
router.get('/move4', function (req, res, next) {
    console.log("相关检查");
    form_all["relevant"] = {};
    res.render('move4');
});
router.post('/move4', function (req, res, next) {
    form_all["relevant"] = req.body;
    console.log("form_all form_relevant",form_all);
    res.json({form_all:form_all});
});

//临床诊断 
router.get('/move5', function (req, res, next) {
    console.log("临床诊断");
    form_all["cc"] = {};
    res.render('move5');
});
router.post('/move5', function (req, res, next) {
    form_all["cc"] = req.body;
    console.log("form_all form_cc",form_all);
    res.json({form_all:form_all});
});

//中西治疗
router.get('/move6', function (req, res, next) {
    console.log("中西治疗");
    form_all["cure"] = {};
    res.render('move6');
});
router.post('/move6', function (req, res, next) {
    form_all["cure"] = req.body;
    console.log("form_all form_cure",form_all);
    res.json({form_all:form_all});
});

//疗效情况
router.get('/move7', function (req, res, next) {
    form_all["results"] = {};
    res.render('move7');
});
router.post('/move7', function (req, res, next) {
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
                // res.json({status:1, msg:""});  

                var newurl = myconst.apiurl + "prj001/mobile/";
                var authstring = obj.access_token;
                //body直接传过来的数据有[Object: null prototype],通过stringify和parse
                //方法可以去掉
                // var results_data = JSON.stringify(req.body);
                // results_data = JSON.parse(results_data);
                form_all["results"] = req.body;
                var options = {
                    form: {data:JSON.stringify(form_all)},
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
                    console.log("response:", JSON.parse(body).msg);
                    console.log("response.statusCode: ", response.statusCode);
                    var mobile_body = JSON.parse(body);
                    if (!error && response.statusCode == 200) {
                        if (mobile_body.msg == "信息提交成功") {
                            form_all = {};//信息提交成功后，删除node缓存的信息
                            res.json({status:1, msg:mobile_body.msg});
                        } else {
                            res.json({status:1, msg:mobile_body.msg});
                        }    
                        console.log("status200",form_all);
                        //res.json()不能用在太前面，否则会调用res.send()
                        //res.render and res.json will both call res.end() 
                        //which is basically like trying to send a response twice to the client
                    } else {
                        console.log("response:", mobile_body.msg);
                        console.log("err",form_all);
                        res.json({status:0, msg:mobile_body.msg});
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

router.post('/move8', function (req, res, next) {
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
            
            var form = req.body;
            // var mydata = '{"info":{"name":"我","telephone":"12345678901","age":"12","address":"北京北京","entrance":"病房","owner":"874174345@qq.com"}}';
            console.log("all_form:",form);
            console.log("all_form.info类型:", typeof(form.info));
            console.log("mydata类型:", typeof(mydata));
            // console.log("",JSON.parse(all_form.info));
            // console.log("JSON.stringify(all_form{info:all_form})->", JSON.stringify({info:all_form}));
            // console.log("标签页form提交JSON.parse(all_form)",JSON.parse(all_form));
            var options = {
                // form: {data:JSON.stringify(all_form)},
                form: {data:form.all_data},
                url: newurl,
                headers: {
                    'Authorization': 'Bearer ' + authstring,
                    'Content-Type': 'application/json'
                }
            };  
            request.post(options, function (error, response, body) {
                console.log("response:", JSON.parse(body).msg);
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
                    console.log("response:", mobile_body.msg);
                    res.json({status:0, msg:mobile_body.msg});
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