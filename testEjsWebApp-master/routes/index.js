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
        var url = myconst.apiurl + "users/";
        var authstring = req.cookies.usertoken.access_token;
        var useremail = req.cookies.userinfo.email;

        console.log(">>>index.js: user access_token in cookie: " + authstring);
        console.log(">>>index.js: user emain: " + useremail);
        
        var options = {
            url: url,
            headers: {
                'Authorization': 'Bearer ' + authstring
            }
        };

        //第一步请求的回调处理
        function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
                var userobjs = JSON.parse(body);
                var userurl = "";
                //console.log(">>>response: ", response);
                console.log(">>>index.js: userobjs: ", userobjs);
                //从所有用户列表中找到与当前用户email信息匹配的，获取其用户详情的url
                for(var i=0,l=userobjs.count;i<l;i++){
                    /*for(var key in userobjs.results[i]){
                        console.log(key+':'+userobjs.results[i][key]);
                    }*/
                    if (userobjs.results[i]['email'] == useremail ) {
                        console.log(">>>index.js: Found the user! " + userobjs.results[i]['url']);
                        userurl = userobjs.results[i]['url'];
                        res.cookie("userid", {
                            "id": userobjs.results[i]['id']
                        }, {maxAge: 1000 * 60 * 60 * 4, httpOnly: true});//cookie 4小时有效时间
                        break;
                    }
                }

                //2. 根据用户详情的接口url发起新的请求，获取用户详情，里面包含该用户能访问的项目列表
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
                        res.render('home', {title: '临床流调项目中心', prjs: userobj.myprojects, userobj: userobj});
                    }
                    else {
                        console.log(">>>index.js: Getting user details met unknown error. "+err.error_description);
                        res.redirect("login");
                    }
                });
            }
        }

        //1.发起请求，获取所有用户列表，然后比对cookie里面的email，来确定当前用户的接口访问url
        request(options, callback);
    } else {
        console.log(">>>Failed to find cookie with access token");
        res.redirect("login");
    }

});

router.get('/logout', function (req, res, next){
    console.log(">>>Visting logout page!");
    res.clearCookie("userinfo", "prj001token", "usertoken", "userid");
    res.render('logout');
});

router.get('/cipher',  function (req, res, next){
    console.log(">>>修改密码页面");
    res.render('cipher',{username: req.cookies.userinfo.email});
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
            console.log("8. json body ", err, err.new_password.length);
            var msg = '';
            for (var i=0,l=err.new_password.length;i<l;i++) {
                msg = msg + err.new_password[i];
            }
            console.log('9. msg', msg);
            res.json({status:0, msg:msg});
        }
    });
});

module.exports = router;
