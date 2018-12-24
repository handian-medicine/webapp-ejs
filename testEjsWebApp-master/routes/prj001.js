//加搜索功能
var request = require("request");
var express = require('express');
var myconst = require("./const");
var mutipart= require('connect-multiparty');
var fs = require("fs");
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

        /*  分页测试  */
        console.log(">>>1. req url: " + req.url);
        var params = url_pack.parse(req.url, true).query;
        console.log(">>>2. req url params: " + params["page"] + ", " + params["keyword"]);
        var workurl = "";
        if ( (params["page"] == undefined) || (params["page"] == "") ) {
            workurl = myconst.apiurl + "prj001/geninfo/";
        }
        else {
            workurl = myconst.apiurl + "prj001/geninfo/?page=" + params["page"];
        }

        if ( (params["keyword"] == undefined) || (params["keyword"] == "") ) {
            workurl = workurl;
        } else {
            if ( (params["page"] == undefined) || (params["page"] == "") ) {
                workurl = workurl + "?search=" + params["keyword"];
            }
            else {
                workurl = workurl + "&search=" + params["keyword"];
            }
        }
        /*  分页测试  */

        var authstring = req.cookies.prj001token.access_token;
        console.log("3. workurl:", workurl);
        var enurl=encodeURI(workurl);
        var d1url=encodeURI(enurl);
        console.log("3. d1url:", d1url);
        var options = {
            url: d1url,
            headers: {
                'Authorization': 'Bearer ' + authstring
            }
        };

        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var archiveobjs = JSON.parse(body);
                console.log(">>>4. prj001.js -> archiveobjs", archiveobjs);

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
                    var nextPage = parseInt(curPageNumber) + 1 ;//如果不转换类型，"1" + 1="11"
                } else {
                    var nextPage = curPageNumber;
                }

                var i = 0, len = archiveobjs.results.length;
                for (; i < len; i++) {
                    var tmpobj = archiveobjs.results[i];
                    console.log(">>>5. current retrieving results: " + tmpobj["name"]);
                }

                var retschname = "";
                if ( (params["keyword"] == undefined) || (params["keyword"] =="") ) {
                    retschname = "";
                    res.render('prj001', {
                        title: '流调项目-排卵障碍性异常子宫出血',
                        archives: archiveobjs.results,
                        username: req.cookies.userinfo.email,
                        totalpagenumber: archiveobjs.total_pages,
                        curpage: curPageNumber,
                        previouspage: previousPage,
                        nextpage: nextPage,
                        totalCount: archiveobjs.totalCount,
                        searchname: retschname
                    });
                } else {
                    retschname = params["keyword"];
                    res.render('prj001', {
                        title: '流调项目-排卵障碍性异常子宫出血',
                        archives: archiveobjs.results,
                        username: req.cookies.userinfo.email,
                        totalpagenumber: archiveobjs.total_pages,
                        curpage: curPageNumber,
                        previouspage: previousPage,
                        nextpage: nextPage,
                        totalCount: archiveobjs.totalCount,
                        searchname: retschname
                    });
                }
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

                    /*  分页测试  */
                    console.log(">>> req url: " + req.url);
                    var params = url_pack.parse(req.url, true).query;
                    console.log(">>> req url params: " + params["page"] + ", " + params["keyword"]);
                    var workurl = "";
                    if (params["page"] == undefined) {
                        workurl = myconst.apiurl + "prj001/geninfo/";
                    }
                    else {
                        workurl = myconst.apiurl + "prj001/geninfo/?page=" + params["page"];
                    }
                
                    if (params["keyword"] == undefined) {
                        workurl = workurl;
                    } else {
                        if (params["page"] == undefined) {
                            workurl = workurl + "?search=" + params["keyword"];
                        }
                        else {
                            workurl = workurl + "&search=" + params["keyword"];
                        }
                    }
                    /*  分页测试  */
                    
                    var authstring = obj.access_token;
                    console.log(">>> prj001 access_token: " + authstring);
                    console.log("6. workurl:", workurl);
                    var enurl=encodeURI(workurl);
                    var d2url=encodeURI(enurl);
                    console.log("7. d1url:", d2url);
                    var options = {
                        url: d2url,
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
                                var nextPage = parseInt(curPageNumber) + 1 ;
                            } else {
                                var nextPage = curPageNumber;
                            }
                            
                            var i = 0, len = archiveobjs.results.length;
                            for (; i < len; i++) {
                                var tmpobj = archiveobjs.results[i];
                                console.log(">>> current retrieving results: " + tmpobj["name"]);
                            }

                            var retschname = "";
                            if (params["keyword"] == undefined) {
                                retschname = "";
                                res.render('prj001', {
                                    title: '流调项目-排卵障碍性异常子宫出血',
                                    archives: archiveobjs.results,
                                    username: req.cookies.userinfo.email,
                                    totalpagenumber: archiveobjs.total_pages,
                                    curpage: curPageNumber,
                                    previouspage: previousPage,
                                    nextpage: nextPage,
                                    totalCount: archiveobjs.totalCount,
                                    searchname: retschname
                                });
                            } else {
                                retschname = params["keyword"];
                                res.render('prj001', {
                                    title: '流调项目-排卵障碍性异常子宫出血',
                                    archives: archiveobjs.results,
                                    username: req.cookies.userinfo.email,
                                    totalpagenumber: archiveobjs.total_pages,
                                    curpage: curPageNumber,
                                    previouspage: previousPage,
                                    nextpage: nextPage,
                                    totalCount: archiveobjs.totalCount,
                                    searchname: retschname
                                });
                            }
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
            console.log("response:", response.body);
            // console.log("response.statusCode: ", response.statusCode);
            if (!error && response.statusCode == 201) {
                res.json({status:1, msg:"录入成功"});
                // console.log("prj001.js ajax result:", res);
                //res.render('datainput',{username: req.cookies.userinfo.email});
            } else {
                console.log('response.statusCode wrong');
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

/* 前段请求 一般信息 */
router.post('/geninfo', function (req, res, next){
    console.log(">>>prj001.js post method:", req.body.geninfo_url);
    //if (req.cookies.prj001token) {
        //var userid = req.body.userid;
        // var url = myconst.apiurl + "/prj001/geninfo/" + req.body.userid;
        var geninfo_url = req.body.geninfo_url;
        var authstring = req.cookies.prj001token.access_token;
        var options = {
            url: geninfo_url,
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
/* 前端请求保存 一般信息 修改 */
router.put('/geninfo_save', function (req, res, next){
    console.log(">>>prj001.js put method:", req.body.geninfo_url);
    //if (req.cookies.prj001token) {
        var geninfo_url = req.body.geninfo_url;
        var authstring = req.cookies.prj001token.access_token;
        var options = {
            url: geninfo_url,
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
                res.json({user_geninfo: user_geninfo, status: 200});
            } else {
                if (response.statusCode == 403) {
                    var user_geninfo = JSON.parse(body);
                    console.log(">>>prj001.js put方法-> body: ", body);
                    res.json({user_geninfo:user_geninfo, status:403});
                }
                //console.log(">>>Getting archives met unknown error. " + error.error_description);
                else {
                    console.log(">>>其它错误码的body: ", body);
                }
            }
        });
    //}
});

/* 前段请求 月经情况 */
router.post('/menstruation', function (req, res, next){
    console.log("look here",req.body);
        var menstruation_url = req.body.menstruation_url;
        var authstring = req.cookies.prj001token.access_token;
        var options = {
            url: menstruation_url,
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
/* 前端请求保存 月经情况 修改 */
router.put('/menstruation_save', function (req, res, next){
    if (req.body.menstruation_url != undefined) {
        console.log("url不为空");
        var menstruation_url = req.body.menstruation_url;
        var authstring = req.cookies.prj001token.access_token;
        var options = {
            url: menstruation_url,
            headers: {
                'Authorization': 'Bearer ' + authstring
            },
            form: req.body.form_menstruation
        };
            console.log(">>>prj001.js put options: ", options);
            request.put(options, function (error, response, body) {
                console.log(">>>prj001.js put method response.statusCode: ", response.statusCode);
                if (!error && response.statusCode == 200) {
                    var user_menstruation = JSON.parse(body);
                    console.log(">>>prj001.js put方法-> body: ", body);
                    res.json({user_menstruation:user_menstruation, status: 200});
                } else {
                    if (response.statusCode == 403) {
                        var user_menstruation = JSON.parse(body);
                        console.log(">>>prj001.js put方法-> body: ", body);
                        res.json({user_menstruation:user_menstruation, status: 403});
                    }
                    //console.log(">>>Getting archives met unknown error. " + error.error_description);
                    else {
                        console.log(">>>其它错误码的body: ", body);
                    }
                    
                }
            });
    } 
    else 
    {
        console.log("url为空");
        var menstruation_url = myconst.apiurl + "prj001/menstruation/";
        var authstring = req.cookies.prj001token.access_token;
        var options = {
            url: menstruation_url,
            headers: {
                'Authorization': 'Bearer ' + authstring
            },
            form: req.body.form_menstruation
        };
        console.log(">>>prj001.js put options: ", options);
        request.post(options, function (error, response, body) {
            console.log(">>>prj001.js put method response.statusCode: ", response.statusCode);
            if (!error && response.statusCode == 201) {
                var user_menstruation = JSON.parse(body);
                console.log(">>>prj001.js put方法-> body: ", body);
                res.json({user_menstruation:user_menstruation, status: 201});
            } else {
                if (response.statusCode == 403) {
                    var user_menstruation = JSON.parse(body);
                    console.log(">>>prj001.js put方法-> body: ", body);
                    res.json({user_menstruation:user_menstruation, status: 403});
                }
                //console.log(">>>Getting archives met unknown error. " + error.error_description);
                else {
                    console.log(">>>其它错误码的body: ", body);
                }
            }
        });
    }
})

/* 前段请求 全身症状 */
router.post('/symptom', function (req, res, next){
        var symptom_url = req.body.symptom_url;
        var authstring = req.cookies.prj001token.access_token;
        var options = {
            url: symptom_url,
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
/* 前端请求保存 全身症状 修改 */
router.put('/symptom_save', function (req, res, next){
    if (req.body.symptom_url != undefined) {
        console.log("url不为空");
        var symptom_url = req.body.symptom_url;
        var authstring = req.cookies.prj001token.access_token;
        var options = {
            url: symptom_url,
            headers: {
                'Authorization': 'Bearer ' + authstring
            },
            form: req.body.form_symptom,
        };
        console.log(">>>prj001.js options: ", options);
        request.put(options, function (error, response, body) {
            console.log(">>>prj001.js put method response.statusCode: ", response.statusCode);
            if (!error && response.statusCode == 200) {
                var user_symptom = JSON.parse(body);
                console.log(">>>prj001.js put方法-> body: ", body);
                    // res.json({status:response.statusCode});                
                res.json({user_symptom:user_symptom, status: 200});
            } else {
                if (response.statusCode == 403) {
                    var user_symptom = JSON.parse(body);
                    console.log(">>>prj001.js put方法-> body: ", body);
                    res.json({user_symptom:user_symptom, status: 403});
                }
                //console.log(">>>Getting archives met unknown error. " + error.error_description);
                else {
                    console.log(">>>其它错误码的body: ", body);
                }
            }
        });
    } 
    else 
    {
        console.log("url为空");
        var symptom_url = myconst.apiurl + "prj001/symptom/";
        var authstring = req.cookies.prj001token.access_token;
        var options = {
            url: symptom_url,
            headers: {
                'Authorization': 'Bearer ' + authstring
            },
            form: req.body.form_symptom
        };
        console.log(">>>prj001.js put options: ", options);
        request.post(options, function (error, response, body) {
            console.log(">>>prj001.js put method response.statusCode: ", response.statusCode);
            if (!error && response.statusCode == 201) {
                var user_symptom = JSON.parse(body);
                console.log(">>>prj001.js put方法-> body: ", body);
                res.json({user_symptom:user_symptom, status: 201});
            } else {
                if (response.statusCode == 403) {
                    var user_symptom = JSON.parse(body);
                    console.log(">>>prj001.js put方法-> body: ", body);
                    res.json({user_symptom:user_symptom, status: 403});
                }
                //console.log(">>>Getting archives met unknown error. " + error.error_description);
                else {
                    console.log(">>>其它错误码的body: ", body);
                }
            }
        });
    }
});

/* 前段请求 其它情况 */
router.post('/other', function (req, res, next){
        var other_url = req.body.other_url;
        var authstring = req.cookies.prj001token.access_token;
        var options = {
            url: other_url,
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
/* 前端请求保存 其它情况 修改 */
router.put('/other_save', function (req, res, next){
    if (req.body.other_url != undefined) {
        var other_url = req.body.other_url;
        var authstring = req.cookies.prj001token.access_token;
        var options = {
            url: other_url,
            headers: {
                'Authorization': 'Bearer ' + authstring
            },
            form: req.body.form_other,
        };
        console.log(">>>prj001.js options: ", options);
        request.put(options, function (error, response, body) {
            console.log(">>>prj001.js put method response.statusCode: ", response.statusCode);
            if (!error && response.statusCode == 200) {
                var user_other = JSON.parse(body);
                console.log(">>>prj001.js -> body: ", body);
                res.json({user_other:user_other, status: 200});
            } else {
                if (response.statusCode == 403) {
                    var user_other = JSON.parse(body);
                    console.log(">>>prj001.js put方法-> body: ", body);
                    res.json({user_other:user_other, status: 403});
                }
                //console.log(">>>Getting archives met unknown error. " + error.error_description);
                else {
                    console.log(">>>其它错误码的body: ", body);
                }
            }
        });
    } 
    else 
    {
        console.log("url为空");
        var other_url = myconst.apiurl + "prj001/other/";
        var authstring = req.cookies.prj001token.access_token;
        var options = {
            url: other_url,
            headers: {
                'Authorization': 'Bearer ' + authstring
            },
            form: req.body.form_other
        };
        console.log(">>>prj001.js put options: ", options);
        request.post(options, function (error, response, body) {
            console.log(">>>prj001.js put method response.statusCode: ", response.statusCode);
            if (!error && response.statusCode == 201) {
                var user_other = JSON.parse(body);
                console.log(">>>prj001.js put方法-> body: ", body);
                res.json({user_other:user_other, status: 201});
            } else {
                if (response.statusCode == 403) {
                    var user_other = JSON.parse(body);
                    console.log(">>>prj001.js put方法-> body: ", body);
                    res.json({user_other:user_other, status: 403});
                }
                //console.log(">>>Getting archives met unknown error. " + error.error_description);
                else {
                    console.log(">>>其它错误码的body: ", body);
                }
            }
        });
    }
});

/* 前段请求 临床诊断 */
router.post('/cc', function (req, res, next){
        var cc_url = req.body.cc_url;
        var authstring = req.cookies.prj001token.access_token;
        var options = {
            url: cc_url,
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
/* 前端请求保存 临床诊断 修改 */
router.put('/cc_save', function (req, res, next){
    console.log(">>>prj001.js put method:", req.body.cc_url);
    if ( req.body.cc_url != undefined) {
        console.log("url不为空");
        console.log(">>>prj001.js put method:", req.body.cc_url);
        var cc_url = req.body.cc_url;
        var authstring = req.cookies.prj001token.access_token;
        var options = {
            url: cc_url,
            headers: {
                'Authorization': 'Bearer ' + authstring
            },
            form: req.body.form_cc
        };
            console.log(">>>prj001.js put options: ", options);
            request.put(options, function (error, response, body) {
                console.log(">>>prj001.js put method response.statusCode: ", response.statusCode);
                if (!error && response.statusCode == 200) {
                    var user_cc = JSON.parse(body);
                    console.log(">>>prj001.js put方法-> body: ", body);
                    res.json({user_cc:user_cc, status: 200});
                } else {
                    if (response.statusCode == 403) {
                        var user_cc = JSON.parse(body);
                        console.log(">>>prj001.js put方法-> body: ", body);
                        res.json({user_cc:user_cc, status: 403});
                    }
                    //console.log(">>>Getting archives met unknown error. " + error.error_description);
                    else {
                        console.log(">>>其它错误码的body: ", body);
                    }
                    
                }
            });
    }
    else 
    {
        console.log("url为空");
        var cc_url = myconst.apiurl + "prj001/cc/";
        var authstring = req.cookies.prj001token.access_token;
        var options = {
            url: cc_url,
            headers: {
                'Authorization': 'Bearer ' + authstring
            },
            form: req.body.form_cc
        };
        console.log(">>>prj001.js put options: ", options);
        request.post(options, function (error, response, body) {
            console.log(">>>prj001.js put method response.statusCode: ", response.statusCode);
            if (!error && response.statusCode == 201) {
                var user_cc = JSON.parse(body);
                console.log(">>>prj001.js put方法-> body: ", body);
                res.json({user_cc:user_cc, status: 201});
            } else {
                if (response.statusCode == 403) {
                    var user_cc = JSON.parse(body);
                    console.log(">>>prj001.js put方法-> body: ", body);
                    res.json({user_cc:user_cc, status: 403});
                }
                //console.log(">>>Getting archives met unknown error. " + error.error_description);
                else {
                    console.log(">>>其它错误码的body: ", body);
                }
            }
        });
    }
});

/* 数据搜索 */
router.post('/search', function (req, res, next) {
    console.log("s1. In the search: req.cookies.prj001token", req.cookies.prj001token);
    if (req.cookies.prj001token) {
        // console.log(">>>/search: Complete url" + req.url);
        // console.log(">>>/search: Search contents: req.query.search: ", req.query.search);

        var keyword = req.body.keyword;
        var page = req.body.page;
        console.log(">>>s2. req body params: " + page + ", " + keyword);

        var search_url = "";
        if (page == null) {
            search_url = myconst.apiurl + "prj001/geninfo/";
        }
        else {
            search_url = myconst.apiurl + "prj001/geninfo/?page=" + page;
        }
        if (keyword == null) {
            search_url = search_url;
        } else {
            if (page == null) {
                search_url = search_url + "?search=" + keyword;
            }
            else {
                search_url = search_url + "&search=" + keyword;
            }
        }

        var enurl=encodeURI(search_url);
        var srch_url=encodeURI(enurl);
        console.log(">>>s1 encoded api url: " + srch_url);
        var authstring = req.cookies.prj001token.access_token;
        var options = {
            url: srch_url,
            headers: {
                'Authorization': 'Bearer ' + authstring
            }
        };

        request(options, function (error, response, body) {
            console.log("In the search body:", body);
            if (!error && response.statusCode == 200) {
                var archiveobjs = JSON.parse(body);
                console.log(">>>In the search prj001.js -> archiveobjs", archiveobjs);

                var totalPageNumber = archiveobjs.total_pages;
                var curPageNumber = 1;

                if (page == undefined) {
                    curPageNumber = 1;
                }else {
                    curPageNumber = page;
                }

                if (curPageNumber > 1){
                    var previousPage = curPageNumber - 1;
                } else {
                    var previousPage = 1;
                }

                if (curPageNumber < archiveobjs.total_pages) {
                    var nextPage = parseInt(curPageNumber) + 1 ;//如果不转换类型，"1" + 1="11"
                } else {
                    var nextPage = curPageNumber;
                }

                var i = 0, len = archiveobjs.results.length;
                for (; i < len; i++) {
                    var tmpobj = archiveobjs.results[i];
                    console.log(">>> search1 retrieving results: " + tmpobj["name"]);
                }

                var retschname = keyword;
                res.json({
                    title: '流调项目-排卵障碍性异常子宫出血',
                    archives:archiveobjs.results, 
                    username: req.cookies.userinfo.email,
                    totalpagenumber: totalPageNumber,
                    curpage: curPageNumber,
                    previouspage: previousPage,
                    nextpage: nextPage,
                    searchname: retschname
                });
                // console.log("do sth after render");
            } else {
                console.log("hhhhh");
                console.log(">>>Getting archives met unknown error. " + err.error_description);
                res.redirect("login");
            }
        })
    } else {
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

                    var keyword = req.body.keyword;
                    var page = req.body.page;
                    console.log(">>> req body params: " + page + ", " + keyword);
            
                    var search_url = "";
                    if (page == null) {
                        search_url = myconst.apiurl + "prj001/geninfo/";
                    }
                    else {
                        search_url = myconst.apiurl + "prj001/geninfo/?page=" + page;
                    }
                    if (keyword == null) {
                        search_url = search_url;
                    } else {
                        if (page == null) {
                            search_url = search_url + "?search=" + keyword;
                        }
                        else {
                            search_url = search_url + "&search=" + keyword;
                        }
                    }
            
                    var enurl=encodeURI(search_url);
                    var srch_url=encodeURI(enurl);
                    console.log(">>>s2 encoded api url: " + srch_url);
                    var authstring = req.cookies.prj001token.access_token;
                    var options = {
                        url: srch_url,
                        headers: {
                            'Authorization': 'Bearer ' + authstring
                        }
                    };
                    
                    request(options, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            var archiveobjs = JSON.parse(body);
                            console.log(">>>In the search prj001.js -> archiveobjs", archiveobjs);
            
                            var totalPageNumber = archiveobjs.total_pages;
                            var curPageNumber = 1;
            
                            if (params["page"] == undefined) {
                                curPageNumber = 1;
                            } else {
                                curPageNumber = params["page"];
                            }
            
                            if (curPageNumber > 1){
                                var previousPage = curPageNumber - 1;
                            } else {
                                var previousPage = 1;
                            }
            
                            if (curPageNumber < archiveobjs.total_pages) {
                                var nextPage = parseInt(curPageNumber) + 1 ;//如果不转换类型，"1" + 1="11"
                            } else {
                                var nextPage = curPageNumber;
                            }
            
                            var i = 0, len = archiveobjs.results.length;
                            for (; i < len; i++) {
                                var tmpobj = archiveobjs.results[i];
                                console.log(">>> search1 retrieving results: " + tmpobj["name"]);
                            }
            
                            var retschname = keyword;
                            res.json({
                                title: '流调项目-排卵障碍性异常子宫出血',
                                archives:archiveobjs.results, 
                                username: req.cookies.userinfo.email,
                                totalpagenumber: totalPageNumber,
                                curpage: curPageNumber,
                                previouspage: previousPage,
                                nextpage: nextPage,
                                searchname: retschname
                            });
                        } else {
                            console.log("hhhhh");
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

// router.get('/patientInfo', function (req, res, next){
//     if (req.cookies.prj001token) {
//         var patient_id = "295";
//         var patient_url;
//         patient_url = myconst.apiurl + "prj001/patientInfo/" + patient_id;
//         var authstring = req.cookies.prj001token.access_token;
//         var options = {
//             url: search_url,
//             headers: {
//                 'Authorization': 'Bearer ' + authstring
//             }
//         };
    

//         var authstring = req.cookies.prj001token.access_token;
//         var options = {
//             url: d1url,
//             headers: {
//                 'Authorization': 'Bearer ' + authstring
//             }
//         };

//         request(options, function (error, response, body) {
//             if (!error && response.statusCode == 200) {
//                 var archiveobjs = JSON.parse(body);
//                 console.log(">>>4. prj001.js -> archiveobjs", archiveobjs);
//                 // var retschname = "";
//                     res.render('prj001', {
//                         title: '流调项目-排卵障碍性异常子宫出血',
//                         archives: archiveobjs.results,
//                         username: req.cookies.userinfo.email,
//                         totalpagenumber: archiveobjs.total_pages,
//                         curpage: curPageNumber,
//                         previouspage: previousPage,
//                         nextpage: nextPage,
//                         totalCount: archiveobjs.totalCount,
//                         searchname: retschname
//                     });
//             }
//         })
//     }
// });
module.exports = router;