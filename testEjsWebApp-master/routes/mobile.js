var request = require("request");
var express = require('express');
var myconst = require("./const");

var router = express.Router();
//路由 ../moblie/
router.post('/', function (req, res, next) {
    if (req.cookies.prj001token) {
    }
    var url = myconst.apiurl + "o/token/";
    var loginData = {
        "username": 'prj001-patient@handian.com',
        "password": 'asdf1234',
        "grant_type": "password",
        "scope": myconst.scope_users,
        "client_id": myconst.client_id,
        "client_secret": myconst.client_secret
    };
    request.post({url: url, form: loginData}, function (error, response, body) {
        console.log(">>>mobile.js: Authentication results: ", body);
        if (!error && response.statusCode == 200) {
            var obj = JSON.parse(body); //由JSON字符串转换为JSON对象
            // 请求成功的处理逻辑
            // 登陆成功后将token写入Cookie，maxAge为cookie过期时间
            console.log(">>>users.js -> obj: ", obj);
            res.cookie("usertoken", {
                "access_token": obj.access_token,
                "refresh_token": obj.refresh_token,
                "scope": obj.scope,
                "expires_in": obj.expires_in
            }, {maxAge: 1000 * 60 * 60 * 4, httpOnly: true});//cookie 4小时有效时间
            res.cookie("userinfo", {
                "email": 'prj001-patient@handian.com',
                "password": 'asdf1234'
            }, {maxAge: 1000 * 60 * 60 * 4, httpOnly: true});//cookie 4小时有效时间
            console.log(">>>users.js -> Set-Cookie: ", res.get('Set-Cookie'));           

            // 返回成功代码，转到项目列表页面
            res.json({status:1, msg:"登录成功"});
        }
        else {
            var err = JSON.parse(body); //由JSON字符串转换为JSON对象
            res.json({status:0, msg:"密码或账户错误"});
        }
    });

})

module.exports = router;