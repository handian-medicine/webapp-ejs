var request = require("request");
var express = require('express');
var myconst = require("./const");
var router = express.Router();

/* GET login page. */
router.get('/', function (req, res, next) {
    console.log(">>>index.js: begin");
    console.log(">>>index.js: method: ", req.method);
    console.log(">>>index.js: path: ", req.path);
    console.log(">>>index.js: headers: ", req.headers);
    console.log(">>>Clear all cookies");
    res.clearCookie('accountinfo');
    res.clearCookie('userinfo');
    res.clearCookie('usertoken');
    res.clearCookie('prj001token');
    res.render('login', {title: '中医妇科临床流调数据中心'});
});
//Chinese Clinical Investigation Center

/* GET projects list page. */
router.get('/home', function (req, res, next) {
    console.log(">>>Visting home page!");
    if (req.cookies.usertoken) {
        var url = myconst.apiurl + "users/login/";
        var authstring = req.cookies.usertoken.access_token;
        var email = req.cookies.userinfo.email;
        var password = req.cookies.userinfo.password;

        console.log(">>>index.js: user access_token in cookie: " + authstring);
        console.log(">>>index.js: user email: " + email);
        console.log(">>>index.js: user password: " + password);
        
        var options = {
            url: url,
            form:{email:email,password:password},
            headers: {
                'Authorization': 'Bearer ' + authstring
            }
        };
        console.log(">>>index.js: options: ", options);
        request.post(options, function (error, response, body) {
            console.log(">>>index.js: 1.",body);
            var matched_user = JSON.parse(body);
            var userurl = matched_user.url;
            var userid = matched_user.id
            console.log(">>>index.js: matched_user: ", matched_user);
            res.cookie("userid", {"id": userid}, {maxAge: 1000 * 60 * 60 * 4, httpOnly: true});
            //根据用户详情的接口url发起新的请求，获取用户详情，里面包含该用户能访问的项目列表
            var newoptions = {
                url: userurl,
                headers: {
                    'Authorization': 'Bearer ' + authstring
                }
            };
            request(newoptions, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var userobj = JSON.parse(body);
                    console.log(">>>index.js: userobj : ", userobj);

                    // console.log("添加username之前的cookie",res.get('Set-Cookie'));
                    res.cookie("accountinfo", {
                        "email":userobj.email,
                        "phone":userobj.phone,
                        "user_name":userobj.user_name,
                        "sex":userobj.sex,
                        "area":userobj.area,
                        "hospital":userobj.hospital,
                        "address":userobj.address,
                        },{maxAge: 1000 * 60 * 60 * 4, httpOnly: true});
                    // console.log("添加username之后的cookie",res.get('Set-Cookie'));

                    res.render('home', {
                        title: '临床流调项目中心', 
                        prjs: userobj.myprojects, 
                        userobj: userobj,
                        //账户信息
                        account_email:userobj.email,
                        account_phone:userobj.phone,
                        username:userobj.user_name,
                        account_sex:userobj.sex,
                        account_area:userobj.area,
                        account_hospital:userobj.hospital,
                        account_address:userobj.address,
                    });
                }
                else {
                    console.log(">>>index.js: Getting user details met unknown error. "+err.error_description);
                    res.redirect("relogin");
                }
            });
        });
    } else {
        console.log(">>>Failed to find cookie with access token");
        res.redirect("relogin");
    }

});

router.get('/logout', function (req, res, next){
    console.log(">>>Visting logout page!");
    res.clearCookie("userinfo", "prj001token", "usertoken", "userid");
    res.render('logout');
});

router.get('/cipher',  function (req, res, next){
    console.log(">>>修改密码页面");
    res.render('cipher',{
        //账户信息
        account_email:req.cookies.accountinfo.email,
        account_phone:req.cookies.accountinfo.phone,
        username:req.cookies.accountinfo.user_name,
        account_sex:req.cookies.accountinfo.sex,
        account_area:req.cookies.accountinfo.area,
        account_hospital:req.cookies.accountinfo.hospital,
        account_address:req.cookies.accountinfo.address,
    });
});
router.put('/cipher',  function (req, res, next){
    console.log("1看这里", req.headers["cookie"]);
    console.log("2看这里", req.cookies.userid.id)
    var id = req.cookies.userid.id;
    var url = myconst.apiurl + "users/" + id +"/changepassword/";
    var codeData = {
        "old_password": req.body.oldcode,
        "new_password": req.body.newcode,
        // "grant_type": "password",
        // "scope": myconst.scope_users,
        // "client_id": myconst.client_id,
        // "client_secret": myconst.client_secret
    };
    console.log("3看这里", url);
    console.log("4看这里", req.cookies);
    var authstring = req.cookies.usertoken.access_token;
    var options = {
        url: url,
        headers: {
            'Authorization': 'Bearer ' + authstring
        },
        form: codeData
    };
    console.log("5看这里", options);
    request.put(options, function (error, response, body) {
        console.log("6. cipher response.body", body);
        if (!error && response.statusCode == 200) {
            var obj = JSON.parse(body); //由JSON字符串转换为JSON对象
            console.log("7. json body ", obj);
            // res.clearCookie("userinfo", "prj001token", "usertoken");        
            res.json({status:1});
        }
        else {
            var err = JSON.parse(body); //由JSON字符串转换为JSON对象
            console.log("8. json body ", err);
            var msg = '';
            if (err.new_password != undefined) {
                for (var i=0,l=err.new_password.length;i<l;i++) {
                    msg = msg + err.new_password[i];
                }
            } else {
                msg = msg + err.old_password;
            }
            console.log('9. msg', msg);
            res.json({status:0, msg:msg});
        }
    });
});

module.exports = router;
