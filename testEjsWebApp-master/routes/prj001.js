var request = require("request");
var express = require('express');
var myconst = require("./const");
var mutipart= require('connect-multiparty');
var fs = require("fs");
var math = require("mathjs");
var url_pack = require("url");

var router = express.Router();
var mutipartMiddeware = mutipart();

/* GET prj001 home page. */
router.get('/', function (req, res, next) {
    console.log(">>>Visting prj001 page!");
    console.log(">>>req.cookies.prj001token: ", req.cookies.prj001token);
    //如果cookie里面有prj001的access_token，那么可以直接获取该项目案例
    if (req.cookies.prj001token) {
        //直接发起数据请求，获取所有prj001项目的案例
        // var url = myconst.apiurl + "prj001/geninfo";// 分页测试代码删除后要添加这行

        /*  分页测试  */
        console.log(">>> req url: " + req.url);
        var params = url_pack.parse(req.url, true).query;
        console.log(">>> req url params: " + params["page"]);
        var workurl = "";
        if (params["page"] == undefined) {
            workurl = myconst.apiurl + "prj001/geninfo/";
        }
        else {
            workurl = myconst.apiurl + "prj001/geninfo/?page=" + params["page"];
        }
        /*  分页测试  */

        var authstring = req.cookies.prj001token.access_token;
        var options = {
            // url: url,
            url: workurl,
            headers: {
                'Authorization': 'Bearer ' + authstring
            }
        };
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var archiveobjs = JSON.parse(body);
                console.log(">>>prj001.js -> archiveobjs", archiveobjs);

                /*  分页测试  */
                var curPageNumber = 1;
                if (params["page"] == undefined) {
                    curPageNumber = 1;
                }else {
                    curPageNumber = params["page"];
                }

                if (curPageNumber > 1){
                    var previousPage = curPageNumber - 1;
                } else {
                    var previousPage = 1;
                }

                if (curPageNumber < archiveobjs.total_pages) {
                    var nextPage = curPageNumber + 1 ;
                } else {
                    var nextPage = curPageNumber;
                }

                res.render('prj001', {
                    title: '流调项目-排卵障碍性异常子宫出血',
                    archives: archiveobjs.results,
                    username: req.cookies.userinfo.email,
                    totalpagenumber: archiveobjs.total_pages,
                    curpage: curPageNumber,
                    previouspage: previousPage,
                    nextpage: nextPage
                });
                /*   分页测试  */
            } else {
                console.log(">>>Getting archives met unknown error. " , error.error_description);
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
                // console.log(">>>Page Num is:", page);
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

                    // url = myconst.apiurl + "prj001/geninfo"; //分页测试代码删除后要添加这行
                    
                    /*  分页测试  */
                    console.log(">>> req url: " + req.url);
                    var params = url_pack.parse(req.url, true).query;
                    console.log(">>> req url params: " + params["page"]);
                    var workurl = "";
                    if (params["page"] == undefined) {
                        workurl = myconst.apiurl + "prj001/geninfo/";
                    }
                    else {
                        workurl = myconst.apiurl + "prj001/geninfo/?page=" + params["page"];
                    }
                    /*  分页测试  */
                    
                    var authstring = obj.access_token;
                    console.log(">>> prj001 access_token: " + authstring);
                    var options = {
                        // url: url,
                        url: workurl,
                        headers: {
                            'Authorization': 'Bearer ' + authstring
                        },
                    };
                    
                    request(options, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            var archiveobjs = JSON.parse(body);
                            console.log(">>>prj001.js -> archiveobjs", archiveobjs);
                            /*  分页测试  */
                            var curPageNumber = 1;
                            if (params["page"] == undefined) {
                                curPageNumber = 1;
                            }else {
                                curPageNumber = params["page"];
                            }
                        
                            if (curPageNumber > 1){
                                var previousPage = curPageNumber - 1;
                            } else {
                                var previousPage = 1;
                            }
                        
                            if (curPageNumber < archiveobjs.total_pages) {
                                var nextPage = curPageNumber + 1 ;
                            } else {
                                var nextPage = curPageNumber;
                            }
                        
                            res.render('prj001', {
                                title: '流调项目-排卵障碍性异常子宫出血',
                                archives: archiveobjs.results,
                                username: req.cookies.userinfo.email,
                                totalpagenumber: archiveobjs.total_pages,
                                curpage: curPageNumber,
                                previouspage: previousPage,
                                nextpage: nextPage
                            });
                            /*   分页测试  */

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
/*        分页请求        */
router.post('/', function (req, res, next) {
    console.log(">>>prj001.js router.post方法");
    if (req.cookies.prj001token) {
        //直接发起数据请求，获取所有prj001项目的案例
        var url = myconst.apiurl + "prj001/geninfo/";
        var authstring = req.cookies.prj001token.access_token;
        var page = req.body.page_num;
        console.log(">>> prj001.js access_token: " + authstring);
        console.log(">>>Page Num is:", page, typeof(page));
        var options = {
            url: url,
            headers: {
                'Authorization': 'Bearer ' + authstring
            },
            form: {"page":page}
        };
        request.all(options, function (error, response, body) {
            // console.log(">>>response", response);
            if (!error && response.statusCode == 200) {
                var archiveobjs = JSON.parse(body);
                console.log(">>>prj001.js -> archiveobjs: ", archiveobjs);
                // res.render('error');
                res.render('prj001', {
                    title: '流调项目-排卵障碍性异常子宫出血',
                    archives: archiveobjs.results,
                    username: req.cookies.userinfo.email
                });
            } else {
                console.log(">>>Getting archives met unknown error. " , error.error_description);
                res.redirect("login");
            }
        });
    }
});
/*        数据采集        */
router.get('/datainput', function (req, res, next) {
    console.log(">>>Visting datainput page!");
    res.render('datainput',{username: req.cookies.userinfo.email});
});
router.post('/datainputoptr', function (req, res, next) {
    if (req.cookies.prj001token) {
        var url = myconst.apiurl + "prj001/geninfo/create/";
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
            // console.log("response:", response.body);
            console.log("response.statusCode: ", response.statusCode);
            if (!error && response.statusCode == 201) {
                // res.json({status:1, msg:"录入成功"});
                console.log("prj001.js ajax result:", res);
                //res.render('datainput',{username: req.cookies.userinfo.email});
            }
        })
        }
    })
router.post('/file_upload', mutipartMiddeware, function (req, res, next) {
    console.log(req.files);
    //xlsFileTrans 是前端的form里面input的名称
    if (req.files.xlsFileTrans.originalFilename == "") {
        res.send('请选择文件!');
    }
    const formData = {
        // Pass a simple key-value pair
        name: '测试excel文件',
        // Pass data via Streams
        ivfile: fs.createReadStream(req.files.xlsFileTrans.path),
        // Pass owner
        owner_id: req.cookies.userid.id
    };
    var authstring = req.cookies.prj001token.access_token;
    var options = {
        url: myconst.apiurl+"prj001/upload/",
        headers: {
            'Authorization': 'Bearer ' + authstring
        },
        formData: formData
    };

    request.post(options, function optionalCallback(err, response, body) {
        if (!err && response.statusCode == 200) {
            console.log('Upload successful!  Server responded with:', body);
            //给浏览器返回一个成功提示。
            res.redirect("/prj001");
        }
        else {
            return console.error('upload failed:', err);
            res.send('上传失败!');
        }
    });

});


/*        数据展示        */
/* 一般信息 */
router.post('/geninfo', function (req, res, next){
    console.log(">>>prj001.js post method:", req.body.geninfo_url);
    //if (req.cookies.prj001token) {
        //var userid = req.body.userid;
        // var url = myconst.apiurl + "/prj001/geninfo/" + req.body.userid;
        var url = req.body.geninfo_url;
        var authstring = req.cookies.prj001token.access_token;
        var options = {
            url: url,
            headers: {
                'Authorization': 'Bearer ' + authstring
            }
            // body: {page:}
        };
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(">>>prj001.js options: ", options)
                var user_geninfo = JSON.parse(body);
                console.log(">>>prj001.js -> user_geninfo: ", user_geninfo);
                res.json(user_geninfo);
            } else {
                //console.log(">>>Getting archives met unknown error. " + error.error_description);
                res.redirect("/prj001");
            }
        });
    //}
});
router.put('/geninfo', function (req, res, next){
    console.log(">>>prj001.js put method:", req.body.geninfo_url);
    //if (req.cookies.prj001token) {
        var url = req.body.geninfo_url;
        var authstring = req.cookies.prj001token.access_token;
        var options = {
            url: url,
            headers: {
                'Authorization': 'Bearer ' + authstring
            },
            form: req.body.form_geninfo,
        };
        console.log(">>>prj001.js put options: ", options);
        request.put(options, function (error, response, body) {
            console.log(">>>prj001.js put method response.statusCode: ", response.statusCode);
            if (!error && response.statusCode == 200) {
                var user_geninfo = JSON.parse(body);
                res.json(user_geninfo);
            } else {
                //console.log(">>>Getting archives met unknown error. " + error.error_description);
                res.redirect("/prj001");
            }
        });
    //}
});
/* 月经情况 */
router.post('/menstruation', function (req, res, next){
    console.log(">>>prj001.js post method:", req.body.menstruation_url);
        var url = req.body.menstruation_url;
        var authstring = req.cookies.prj001token.access_token;
        var options = {
            url: url,
            headers: {
                'Authorization': 'Bearer ' + authstring
            }
        };
        request(options, function (error, response, body) {
            console.log("response.statusCode:", response.statusCode);
            if (!error && response.statusCode == 200) {
                console.log(">>>prj001.js options: ", options)
                var user_menstruation = JSON.parse(body);
                console.log(">>>prj001.js -> user_menstruation: ", user_menstruation);
                res.json(user_menstruation);
            } else {
                //console.log(">>>Getting archives met unknown error. " + error.error_description);
                res.redirect("/prj001");
            }
        });
});
router.put('/menstruation', function (req, res, next){
    console.log(">>>prj001.js put method:", req.body.menstruation_url);
    //if (req.cookies.prj001token) {
        var url = req.body.menstruation_url;
        var authstring = req.cookies.prj001token.access_token;
        var options = {
            url: url,
            headers: {
                'Authorization': 'Bearer ' + authstring
            },
            form: req.body.form_menstruation,
        };
        console.log(">>>prj001.js put options: ", options);
        request.put(options, function (error, response, body) {
            console.log(">>>prj001.js put method response.statusCode: ", response.statusCode);
            if (!error && response.statusCode == 200) {
                var user_menstruation = JSON.parse(body);
                console.log(">>>prj001.js put方法-> user_menstruation: ", body);
                res.json(user_menstruation);
            } else {
                //console.log(">>>Getting archives met unknown error. " + error.error_description);
                res.redirect("/prj001");
            }
        });
    //}
});
/* 全身症状 */
router.post('/symptom', function (req, res, next){
    // console.log(">>>prj001.js/symptom/userid:", JSON.parse(req.body.userid))
    //if (req.cookies.prj001token) {
        //var userid = req.body.userid;
        // var url = myconst.apiurl + "/prj001/symptom/" + req.body.userid;
        var url = req.body.symptom_url;
        var authstring = req.cookies.prj001token.access_token;
        var options = {
            url: url,
            headers: {
                'Authorization': 'Bearer ' + authstring
            }
        };
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(">>>prj001.js options: ", options)
                var user_symptom = JSON.parse(body);
                console.log(">>>prj001.js -> user_symptom: ", user_symptom);
                res.json(user_symptom);
            } else {
                //console.log(">>>Getting archives met unknown error. " + error.error_description);
                res.redirect("/prj001");
            }
        });
    //}
});
router.put('/symptom', function (req, res, next){
    console.log(">>>prj001.js put method:", req.body.symptom_url);
    //if (req.cookies.prj001token) {
        var url = req.body.symptom_url;
        var authstring = req.cookies.prj001token.access_token;
        var options = {
            url: url,
            headers: {
                'Authorization': 'Bearer ' + authstring
            },
            form: req.body.form_symptom,
        };
        console.log(">>>prj001.js options: ", options);
        request.put(options, function (error, response, body) {
            console.log(">>>prj001.js put method response.statusCode: ", response.statusCode);
            if (!error && response.statusCode == 200) {
                var user_geninfo = JSON.parse(body);
                console.log(">>>prj001.js -> user_geninfo: ", user_geninfo);
                res.json(user_geninfo);
            } else {
                //console.log(">>>Getting archives met unknown error. " + error.error_description);
                res.redirect("/prj001");
            }
        });
    //}
});
/* 其它情况 */
router.post('/other', function (req, res, next){
    // console.log(">>>prj001.js/other/userid:", JSON.parse(req.body.userid))
    //if (req.cookies.prj001token) {
        //var userid = req.body.userid;
        // var url = myconst.apiurl + "/prj001/other/" + req.body.userid;
        var url = req.body.other_url;
        var authstring = req.cookies.prj001token.access_token;
        var options = {
            url: url,
            headers: {
                'Authorization': 'Bearer ' + authstring
            }
        };
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(">>>prj001.js options: ", options)
                var user_other = JSON.parse(body);
                console.log(">>>prj001.js -> user_other: ", user_other);
                res.json(user_other);
            } else {
                //console.log(">>>Getting archives met unknown error. " + error.error_description);
                res.redirect("/prj001");
            }
        });
    //}
});
router.put('/other', function (req, res, next){
    console.log(">>>prj001.js put method:", req.body.other_url);
    //if (req.cookies.prj001token) {
        var url = req.body.other_url;
        var authstring = req.cookies.prj001token.access_token;
        var options = {
            url: url,
            headers: {
                'Authorization': 'Bearer ' + authstring
            },
            form: req.body.form_other,
        };
        console.log(">>>prj001.js options: ", options);
        request.put(options, function (error, response, body) {
            console.log(">>>prj001.js put method response.statusCode: ", response.statusCode);
            if (!error && response.statusCode == 200) {
                var user_geninfo = JSON.parse(body);
                console.log(">>>prj001.js -> user_geninfo: ", user_geninfo);
                res.json(user_geninfo);
            } else {
                //console.log(">>>Getting archives met unknown error. " + error.error_description);
                res.redirect("/prj001");
            }
        });
    //}
});
/* 临床诊断 */
router.post('/cc', function (req, res, next){
    // console.log(">>>prj001.js/cc/userid:", JSON.parse(req.body.userid))
    //if (req.cookies.prj001token) {
        //var userid = req.body.userid;
        // var url = myconst.apiurl + "/prj001/cc/" + req.body.userid;
        var url = req.body.cc_url;
        var authstring = req.cookies.prj001token.access_token;
        var options = {
            url: url,
            headers: {
                'Authorization': 'Bearer ' + authstring
            }
        };
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(">>>prj001.js options: ", options)
                var user_cc = JSON.parse(body);
                console.log(">>>prj001.js -> user_cc: ", user_cc);
                res.json(user_cc);
            } else {
                //console.log(">>>Getting archives met unknown error. " + error.error_description);
                res.redirect("/prj001");
            }
        });
    //}
});
router.put('/cc', function (req, res, next){
    console.log(">>>prj001.js put method:", req.body.cc_url);
    //if (req.cookies.prj001token) {
        var url = req.body.cc_url;
        var authstring = req.cookies.prj001token.access_token;
        var options = {
            url: url,
            headers: {
                'Authorization': 'Bearer ' + authstring
            },
            form: req.body.form_cc,
        };
        console.log(">>>prj001.js options: ", options);
        request.put(options, function (error, response, body) {
            console.log(">>>prj001.js put method response.statusCode: ", response.statusCode);
            if (!error && response.statusCode == 200) {
                var user_geninfo = JSON.parse(body);
                console.log(">>>prj001.js -> user_geninfo: ", user_geninfo);
                res.json(user_geninfo);
            } else {
                //console.log(">>>Getting archives met unknown error. " + error.error_description);
                res.redirect("/prj001");
            }
        });
    //}
});

module.exports = router;