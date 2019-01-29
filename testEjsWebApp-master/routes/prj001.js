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
            workurl = myconst.apiurl + "prj001/info/";
        }
        else {
            workurl = myconst.apiurl + "prj001/info/?page=" + params["page"];
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
                        totalCount: archiveobjs.count,
                        searchname: retschname,
                        code: archiveobjs.code
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
                        totalCount: archiveobjs.count,
                        searchname: retschname,
                        code: archiveobjs.code
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
                        workurl = myconst.apiurl + "prj001/info/";
                    }
                    else {
                        workurl = myconst.apiurl + "prj001/info/?page=" + params["page"];
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
                                    totalCount: archiveobjs.count,
                                    searchname: retschname,
                                    code: archiveobjs.code
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
                                    totalCount: archiveobjs.count,
                                    searchname: retschname,
                                    code: archiveobjs.code
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
        var url = myconst.apiurl + "prj001/info/create/";
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
            if (!error && response.statusCode == 201) {
                res.json({status:1, msg:"录入成功"});
                // console.log("prj001.js ajax result:", res);
                //res.render('datainput',{username: req.cookies.userinfo.email});
            } else {
                res.json({status:0, msg:"请检查信息是否完整或序列号重复"});
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
        console.log("上传文件: response.statusCode:", response.statusCode);
        if (!err && response.statusCode == 200) {
            console.log('Upload successful!  Server responded with:', body);
            //给浏览器返回一个成功提示。
            var upload_info = JSON.parse(body);
            console.log(">>>上传信息 -> upload_info: ", upload_info);
            // alert("haha",response.statusCode);
            console.log("haha",response.statusCode);
            
            if (upload_info.code == 403) {
                res.json(upload_info);//权限问题
            }  else {
                res.redirect("/prj001");//上传成功
            }
        }
        else {
            // alert("err",response.statusCode);
            console.log("err",response.statusCode);
            return console.error('upload failed:', err);
            res.send('上传失败!');
        }
    });

});

/*        数据展示        */
/* 一般信息 查看*/
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
        };
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(">>>prj001.js options: ", options)
                var all_data = JSON.parse(body);
                console.log(">>>prj001.js -> user_geninfo: ", all_data);
                res.json(all_data.info);
            } else {
                //console.log(">>>Getting archives met unknown error. " + error.error_description);
                res.redirect("/prj001");
            }
        });
    //}
});
/* 一般信息 修改 */
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
            // var dict = myconst.dict_table;
            console.log(">>>prj001.js put method response.statusCode: ", response.statusCode);
            var user_geninfo = JSON.parse(body);            
            if (!error && response.statusCode == 200) {
                res.json({user_geninfo: user_geninfo, status: 200});
            } else {
                if (response.statusCode == 403) {
                    console.log(">>>prj001.js put方法-> body: ", user_geninfo);
                    res.json({user_geninfo:user_geninfo, status:403});
                }
                //console.log(">>>Getting archives met unknown error. " + error.error_description);
                else {
                    console.log(">>>其它错误码的body: ", user_geninfo);
                    // var info_cn = {};
                    // for (var i in user_geninfo) {
                    //     info_cn[dict[i]] = user_geninfo[i][0];
                    // }
                    res.json({user_geninfo: user_geninfo, status:1400});
                }
            }
        });
    //}
});

//病情概要
router.post('/summary', function (req, res, next){
    var summary_url = req.body.summary_url;
    var authstring = req.cookies.prj001token.access_token;
    var options = {
        url: summary_url,
        headers: {
            'Authorization': 'Bearer ' + authstring
        }
    };
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(">>>prj001.js options: ", options)
            var user_summary = JSON.parse(body);
            console.log(">>>prj001.js -> user_summary: ", user_summary);
            res.json(user_summary);
        } else {
            //console.log(">>>Getting archives met unknown error. " + error.error_description);
            res.redirect("/prj001");
        }
    });
});
router.put('/summary_save', function (req, res, next){
    console.log(">>>prj001.js put method:", req.body.summary_url);
    if ( req.body.summary_url != undefined) {
        console.log("url不为空");
        console.log(">>>prj001.js put method:", req.body.summary_url);
        var summary_url = req.body.summary_url;
        var authstring = req.cookies.prj001token.access_token;
        var options = {
            url: summary_url,
            headers: {
                'Authorization': 'Bearer ' + authstring
            },
            form: req.body.form_summary
        };
            console.log(">>>prj001.js put options: ", options);
            request.put(options, function (error, response, body) {
                console.log(">>>prj001.js put method response.statusCode: ", response.statusCode);
                if (!error && response.statusCode == 200) {
                    var user_summary = JSON.parse(body);
                    console.log(">>>prj001.js put方法-> body: ", body);
                    res.json({user_summary:user_summary, status: 200});
                } else {
                    if (response.statusCode == 403) {
                        var user_summary = JSON.parse(body);
                        console.log(">>>prj001.js put方法-> body: ", body);
                        res.json({user_summary:user_summary, status: 403});
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
        var summary_url = myconst.apiurl + "prj001/summary/";
        var authstring = req.cookies.prj001token.access_token;
        var options = {
            url: summary_url,
            headers: {
                'Authorization': 'Bearer ' + authstring
            },
            form: req.body.form_summary
        };
        console.log(">>>prj001.js put options: ", options);
        request.post(options, function (error, response, body) {
            console.log(">>>prj001.js put method response.statusCode: ", response.statusCode);
            if (!error && response.statusCode == 201) {
                var user_summary = JSON.parse(body);
                console.log(">>>prj001.js put方法-> body: ", body);
                res.json({user_summary:user_summary, status: 201});
            } else {
                if (response.statusCode == 403) {
                    var user_summary = JSON.parse(body);
                    console.log(">>>prj001.js put方法-> body: ", body);
                    res.json({user_summary:user_summary, status: 403});
                }
                //console.log(">>>Getting archives met unknown error. " + error.error_description);
                else {
                    console.log(">>>其它错误码的body: ", body);
                }
            }
        });
    }
    });

//患者病史
router.post('/history', function (req, res, next){
    var history_url = req.body.history_url;
    var authstring = req.cookies.prj001token.access_token;
    var options = {
        url: history_url,
        headers: {
            'Authorization': 'Bearer ' + authstring
        }
    };
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(">>>prj001.js options: ", options)
            var user_history = JSON.parse(body);
            console.log(">>>prj001.js -> user_history: ", user_history);
            res.json(user_history);
        } else {
            //console.log(">>>Getting archives met unknown error. " + error.error_description);
            res.redirect("/prj001");
        }
    });
});
router.put('/history_save', function (req, res, next){
    console.log(">>>prj001.js put method:", req.body.history_url);
    if ( req.body.history_url != undefined) {
        console.log("url不为空");
        console.log(">>>prj001.js put method:", req.body.history_url);
        var history_url = req.body.history_url;
        var authstring = req.cookies.prj001token.access_token;
        var options = {
            url: history_url,
            headers: {
                'Authorization': 'Bearer ' + authstring
            },
            form: req.body.form_history
        };
            console.log(">>>prj001.js put options: ", options);
            request.put(options, function (error, response, body) {
                console.log(">>>prj001.js put method response.statusCode: ", response.statusCode);
                if (!error && response.statusCode == 200) {
                    var user_history = JSON.parse(body);
                    console.log(">>>prj001.js put方法-> body: ", body);
                    res.json({user_history:user_history, status: 200});
                } else {
                    if (response.statusCode == 403) {
                        var user_history = JSON.parse(body);
                        console.log(">>>prj001.js put方法-> body: ", body);
                        res.json({user_history:user_history, status: 403});
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
        var history_url = myconst.apiurl + "prj001/history/";
        var authstring = req.cookies.prj001token.access_token;
        var options = {
            url: history_url,
            headers: {
                'Authorization': 'Bearer ' + authstring
            },
            form: req.body.form_history
        };
        console.log(">>>prj001.js put options: ", options);
        request.post(options, function (error, response, body) {
            console.log(">>>prj001.js put method response.statusCode: ", response.statusCode);
            if (!error && response.statusCode == 201) {
                var user_history = JSON.parse(body);
                console.log(">>>prj001.js put方法-> body: ", body);
                res.json({user_history:user_history, status: 201});
            } else {
                if (response.statusCode == 403) {
                    var user_history = JSON.parse(body);
                    console.log(">>>prj001.js put方法-> body: ", body);
                    res.json({user_history:user_history, status: 403});
                }
                //console.log(">>>Getting archives met unknown error. " + error.error_description);
                else {
                    console.log(">>>其它错误码的body: ", body);
                }
            }
        });
    }
    });

//相关检查
router.post('/relevant', function (req, res, next){
    var relevant_url = req.body.relevant_url;
    var authstring = req.cookies.prj001token.access_token;
    var options = {
        url: relevant_url,
        headers: {
            'Authorization': 'Bearer ' + authstring
        }
    };
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(">>>prj001.js options: ", options)
            var user_relevant = JSON.parse(body);
            console.log(">>>prj001.js -> user_relevant: ", user_relevant);
            res.json(user_relevant);
        } else {
            //console.log(">>>Getting archives met unknown error. " + error.error_description);
            res.redirect("/prj001");
        }
    });
});
router.put('/relevant_save', function (req, res, next){
    console.log(">>>prj001.js put method:", req.body.relevant_url);
    if ( req.body.relevant_url != undefined) {
        console.log("url不为空");
        console.log(">>>prj001.js put method:", req.body.relevant_url);
        var relevant_url = req.body.relevant_url;
        var authstring = req.cookies.prj001token.access_token;
        var options = {
            url: relevant_url,
            headers: {
                'Authorization': 'Bearer ' + authstring
            },
            form: req.body.form_relevant
        };
            console.log(">>>prj001.js put options: ", options);
            request.put(options, function (error, response, body) {
                console.log(">>>prj001.js put method response.statusCode: ", response.statusCode);
                if (!error && response.statusCode == 200) {
                    var user_relevant = JSON.parse(body);
                    console.log(">>>prj001.js put方法-> body: ", body);
                    res.json({user_relevant:user_relevant, status: 200});
                } else {
                    if (response.statusCode == 403) {
                        var user_relevant = JSON.parse(body);
                        console.log(">>>prj001.js put方法-> body: ", body);
                        res.json({user_relevant:user_relevant, status: 403});
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
        var relevant_url = myconst.apiurl + "prj001/relevant/";
        var authstring = req.cookies.prj001token.access_token;
        var options = {
            url: relevant_url,
            headers: {
                'Authorization': 'Bearer ' + authstring
            },
            form: req.body.form_relevant
        };
        console.log(">>>prj001.js put options: ", options);
        request.post(options, function (error, response, body) {
            console.log(">>>prj001.js put method response.statusCode: ", response.statusCode);
            if (!error && response.statusCode == 201) {
                var user_relevant = JSON.parse(body);
                console.log(">>>prj001.js put方法-> body: ", body);
                res.json({user_relevant:user_relevant, status: 201});
            } else {
                if (response.statusCode == 403) {
                    var user_relevant = JSON.parse(body);
                    console.log(">>>prj001.js put方法-> body: ", body);
                    res.json({user_relevant:user_relevant, status: 403});
                }
                //console.log(">>>Getting archives met unknown error. " + error.error_description);
                else {
                    console.log(">>>其它错误码的body: ", body);
                }
            }
        });
    }
    });

//临床诊断 
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
});
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

//中西治疗
router.post('/cure', function (req, res, next){
    var cure_url = req.body.cure_url;
    var authstring = req.cookies.prj001token.access_token;
    var options = {
        url: cure_url,
        headers: {
            'Authorization': 'Bearer ' + authstring
        }
    };
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(">>>prj001.js options: ", options)
            var user_cure = JSON.parse(body);
            console.log(">>>prj001.js -> user_cure: ", user_cure);
            res.json(user_cure);
        } else {
            //console.log(">>>Getting archives met unknown error. " + error.error_description);
            res.redirect("/prj001");
        }
    });
});
router.put('/cure_save', function (req, res, next){
    console.log(">>>prj001.js put method:", req.body.cure_url);
    if ( req.body.cure_url != undefined) {
        console.log("url不为空");
        console.log(">>>prj001.js put method:", req.body.cure_url);
        var cure_url = req.body.cure_url;
        var authstring = req.cookies.prj001token.access_token;
        var options = {
            url: cure_url,
            headers: {
                'Authorization': 'Bearer ' + authstring
            },
            form: req.body.form_cure
        };
            console.log(">>>prj001.js put options: ", options);
            request.put(options, function (error, response, body) {
                console.log(">>>prj001.js put method response.statusCode: ", response.statusCode);
                if (!error && response.statusCode == 200) {
                    var user_cure = JSON.parse(body);
                    console.log(">>>prj001.js put方法-> body: ", body);
                    res.json({user_cure:user_cure, status: 200});
                } else {
                    if (response.statusCode == 403) {
                        var user_cure = JSON.parse(body);
                        console.log(">>>prj001.js put方法-> body: ", body);
                        res.json({user_cure:user_cure, status: 403});
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
        var cure_url = myconst.apiurl + "prj001/cure/";
        var authstring = req.cookies.prj001token.access_token;
        var options = {
            url: cure_url,
            headers: {
                'Authorization': 'Bearer ' + authstring
            },
            form: req.body.form_cure
        };
        console.log(">>>prj001.js put options: ", options);
        request.post(options, function (error, response, body) {
            console.log(">>>prj001.js put method response.statusCode: ", response.statusCode);
            if (!error && response.statusCode == 201) {
                var user_cure = JSON.parse(body);
                console.log(">>>prj001.js put方法-> body: ", body);
                res.json({user_cure:user_cure, status: 201});
            } else {
                if (response.statusCode == 403) {
                    var user_cure = JSON.parse(body);
                    console.log(">>>prj001.js put方法-> body: ", body);
                    res.json({user_cure:user_cure, status: 403});
                }
                //console.log(">>>Getting archives met unknown error. " + error.error_description);
                else {
                    console.log(">>>其它错误码的body: ", body);
                }
            }
        });
    }
    });

//疗效情况
router.post('/results', function (req, res, next){
    var results_url = req.body.results_url;
    var authstring = req.cookies.prj001token.access_token;
    var options = {
        url: results_url,
        headers: {
            'Authorization': 'Bearer ' + authstring
        }
    };
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(">>>prj001.js options: ", options)
            var user_results = JSON.parse(body);
            console.log(">>>prj001.js -> user_results: ", user_results);
            res.json(user_results);
        } else {
            //console.log(">>>Getting archives met unknown error. " + error.error_description);
            res.redirect("/prj001");
        }
    });
});
router.put('/results_save', function (req, res, next){
    console.log(">>>prj001.js put method:", req.body.results_url);
    if ( req.body.results_url != undefined) {
        console.log("url不为空");
        console.log(">>>prj001.js put method:", req.body.results_url);
        var results_url = req.body.results_url;
        var authstring = req.cookies.prj001token.access_token;
        var options = {
            url: results_url,
            headers: {
                'Authorization': 'Bearer ' + authstring
            },
            form: req.body.form_results
        };
            console.log(">>>prj001.js put options: ", options);
            request.put(options, function (error, response, body) {
                console.log(">>>prj001.js put method response.statusCode: ", response.statusCode);
                if (!error && response.statusCode == 200) {
                    var user_results = JSON.parse(body);
                    console.log(">>>prj001.js put方法-> body: ", body);
                    res.json({user_cresults:user_results, status: 200});
                } else {
                    if (response.statusCode == 403) {
                        var user_results = JSON.parse(body);
                        console.log(">>>prj001.js put方法-> body: ", body);
                        res.json({user_results:user_results, status: 403});
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
        var results_url = myconst.apiurl + "prj001/results/";
        var authstring = req.cookies.prj001token.access_token;
        var options = {
            url: results_url,
            headers: {
                'Authorization': 'Bearer ' + authstring
            },
            form: req.body.form_results
        };
        console.log(">>>prj001.js put options: ", options);
        request.post(options, function (error, response, body) {
            console.log(">>>prj001.js put method response.statusCode: ", response.statusCode);
            if (!error && response.statusCode == 201) {
                var user_results = JSON.parse(body);
                console.log(">>>prj001.js put方法-> body: ", body);
                res.json({user_results:user_results, status: 201});
            } else {
                if (response.statusCode == 403) {
                    var user_results = JSON.parse(body);
                    console.log(">>>prj001.js put方法-> body: ", body);
                    res.json({user_results:user_results, status: 403});
                }
                //console.log(">>>Getting archives met unknown error. " + error.error_description);
                else {
                    console.log(">>>其它错误码的body: ", body);
                }
            }
        });
    }
    });


/* 病例详细信息 */
router.get('/patientInfo', function (req, res, next){
    if (req.cookies.prj001token) {
        var id = req.query.id;
        // var id = req.params.id; //router.get('/patientInfo/:id'...
        console.log("id", id);
        var patient_url = myconst.apiurl + "prj001/info/" + id +'/';
    
        var authstring = req.cookies.prj001token.access_token;
        var options = {
            url: patient_url,
            headers: {
                'Authorization': 'Bearer ' + authstring
            }
        };

        request(options, function (error, response, body) {
            // console.log("10. response.statusCode:", response.statusCode)
            if (!error && response.statusCode == 200) {
                var archiveobjs = JSON.parse(body);
                // archiveobjs = archiveobjs[0];//提交代码这行要删掉！
                archiveobjs.geninfo = {};
                // console.log("11. 病例所有信息", archiveobjs);
                // console.log("12. 类型", typeof(archiveobjs["recdate"]));
                // console.log("13. 类型", typeof(archiveobjs["menstruation"]));

                //把一般信息打包到geninfo
                for (var i in archiveobjs) {
                    // console.log(typeof(archiveobjs[i]));
                    if ( typeof(archiveobjs[i]) != "object") {
                        archiveobjs.geninfo[i] = archiveobjs[i];
                        delete archiveobjs[i];
                    }
                }

                var dict_table = {
                    "recdate": '日期',
                    "serial": '问卷编码',
                    "hospital": '医院名称',
                    "expert": '填表专家姓名',
                    "title": '职称',
                    "name": '患者姓名',
                    "telephone": '电话',
                    "age": '年龄',
                    "height": '身高cm',
                    "weight": '体重kg',
                    "blood_type": '血型',
                    "nation": '民族',
                    "career": '职业',
                    "gaokong": '高空',
                    "diwen": '低温',
                    "zaosheng": '噪声',
                    "fushe": '辐射',
                    "huagongyinran": '化工印染',
                    "julieyundong": '剧烈运动',
                    "qiyou": '汽油',
                    "wu": '无',
                    "address": '病人现住址',
                    "entrance": '病人来源',
                    "culture": '文化程度',
                    "marriage": '婚姻状况',
                    "wuteshu": '无特殊',
                    "sushi": '素食',
                    "suan": '酸',
                    "tian": '甜',
                    "xian": '咸',
                    "xinla": '辛辣',
                    "you": '油',
                    "shengleng": '生冷',
                    "kafei": '含咖啡因食物或饮品',
                    "qita": '其它',
                
                    // 月经
                    'first_time': '初潮年龄',
                    'cyclicity': '月经周期是否规律',
                    'normal': '月经周期尚规律的间隔天数',
                    'abnormal': '月经不规律的情况',
                    'blood_cond': '出血所需卫生巾数',
                    'cyclicity_sum': '行经天数',
                    'blood_color': '出血颜色',
                    'blood_quality': '出血质地',
                    'blood_block': '血块',
                    'blood_character': '出血特点',
                
                    // 全身症状
                    'spirit_jinglichongpei': '精力充沛',
                    'spirit_jianwang': '健忘',
                    'spirit_jingshenbujizhong': '精神不集中',
                    'spirit_shenpifali': '神疲乏力',
                    'spirit_yalida': '学习、工作压力大',
                    'spirit_jiaodabiangu': '个人/家庭遭遇较大变故',
                    'spirit_beishangyuku': '悲伤欲哭',
                    'mood_zhengchang': '正常',
                    'mood_leguankailang': '乐观开朗',
                    'mood_silvguodu': '思虑过度',
                    'mood_xinuwuchang': '喜怒无常',
                    'mood_fanzaoyinu': '烦躁易怒',
                    'mood_jiaolv': '焦虑',
                    'mood_beishangyuku': '悲伤欲哭',
                    'mood_yiyu': '抑郁',
                    'mood_duosiduolv': '多思多虑',
                    'mood_qita': '其它',
                    'chillfever_zhengchang': '正常',
                    'chillfever_weihan': '畏寒',
                    'chillfever_wuxinfanre': '五心烦热',
                    'chillfever_wuhouchaore': '午后潮热',
                    'chillfever_direbutui': '低热不退',
                    'sweat_zhengchang': '正常',
                    'sweat_duohan': '多汗',
                    'sweat_mingxian': '稍微活动则汗出明显',
                    'sweat_zihan': '自汗',
                    'sweat_daohan': '盗汗',
                    'sweat_hongre': '烘热汗出',
                    'sweat_chaore': '潮热汗出',
                    'sound_zhengchang': '正常',
                    'sound_qiduan': '气短',
                    'sound_xitanxi': '喜叹息',
                    'sound_shaoqilanyan': '少气懒言',
                    'face_zhengchang': '正常',
                    'face_danbaiwuhua': '淡白无华',
                    'face_cangbai': '苍白',
                    'face_qingbai': '清白',
                    'face_weihuang': '萎黄',
                    'face_huangzhong': '黄肿',
                    'face_chaohong': '潮红',
                    'face_huian': '晦暗',
                    'face_baierfuzhong': '白而浮肿',
                    'face_baierandan': '白而黯淡',
                    'face_mianmulihei': '面目黧黑',
                    'face_shaohua': '少华',
                    'face_wuhua': '无华',
                    'heart_zhengcheng': '正常',
                    'heart_xinfan': '心烦',
                    'heart_xinji': '心悸',
                    'breast_zhengchang': '正常',
                    'breast_biezhang': '憋胀',
                    'breast_citong': '刺痛',
                    'breast_zhangtong': '胀痛',
                    'breast_chutong': '触痛',
                    'chest_zhengchang': '正常',
                    'chest_zhangmen': '胀闷',
                    'chest_yintong': '隐痛',
                    'chest_citong': '刺痛',
                    'waist_zhengchang': '正常',
                    'waist_suantong': '酸痛',
                    'waist_suanruan': '酸软',
                    'waist_suanleng': '酸冷',
                    'waist_lengtong': '冷痛',
                    'waist_yaotongrushe': '腰痛如折',
                    'stomach_zhengchang': '正常',
                    'stomach_zhangtongjuan': '胀痛拒按',
                    'stomach_xiaofuzhuizhang': '小腹坠胀',
                    'stomach_xiaofubiezhang': '小腹憋胀',
                    'stomach_xiaofulengtong': '小腹冷痛',
                    'stomach_xiaofuzhuotong': '小腹灼痛',
                    'stomach_yintongxian': '隐痛喜按',
                    'stomach_dewentongjian': '冷痛，得温痛减',
                    'stomach_tongruzhenci': '小腹结块，痛如针刺',
                    'stomach_kongzhui': '有空坠感',
                    'head_zhengchang': '正常',
                    'head_touyun': '头晕',
                    'head_toutong': '头痛',
                    'head_touchenzhong': '头沉痛',
                    'eyes_zhengchang': '正常',
                    'eyes_muxuan': '目眩',
                    'eyes_muse': '目涩',
                    'eyes_yanhua': '眼花',
                    'eyes_mutong': '目痛',
                    'eyes_muyang': '目痒',
                    'eyes_chenqifz': '晨起眼睑浮肿',
                    'ear_erming': '耳鸣',
                    'ear_erlong': '耳聋',
                    'ear_tinglibq': '听力不清，声音重复',
                    'throat_zhengchang': '正常',
                    'throat_yangan': '咽干',
                    'throat_yantong': '咽痛',
                    'throat_yanyang': '咽痒',
                    'throat_yiwugan': '异物感',
                    'breath_wuyiwei': '口中无异味',
                    'breath_kouku': '口苦',
                    'breath_kougan': '口干',
                    'breath_koudan': '口淡',
                    'breath_kouxian': '口咸',
                    'breath_koutian': '口甜',
                    'breath_kounian': '口粘',
                    'breath_danyuss': '但欲漱水不欲咽',
                    'diet_nadaishishao': '纳呆食少',
                    'diet_shiyuws': '食欲旺盛，多食易饥',
                    'diet_yanshi': '厌食',
                    'diet_xireyin': '喜热饮',
                    'diet_xilengyin': '喜冷饮',
                    'diet_shiyujiantui': '食欲减退，食少',
                    'diet_shihoufuzhang': '食后腹胀',
                    'diet_shixinla': '喜辛辣',
                    'diet_shishengleng': '喜生冷',
                    'diet_kebuduoyin': '渴不多饮',
                    'sleep_zhengchang': '正常',
                    'sleep_yiban': '一般',
                    'sleep_duomengyixing': '多梦易醒',
                    'sleep_nanyirumian': '难以入眠',
                    'sleep_cheyebumian': '彻夜不眠',
                    'sleep_duomeng': '多梦',
                    'sleep_shishui': '嗜睡',
                    'stool_sehuang': '色黄，通畅，成形不干燥',
                    'stool_bianmi': '便秘',
                    'stool_zhixi': '质稀',
                    'stool_sgsx': '时干时稀',
                    'stool_xiexie': '泄泻',
                    'stool_tlzqxiexie': '天亮前泄泻',
                    'stool_zhinian': '质黏，有排不尽之感',
                    'stool_weixiaohua': '大便中夹有未消化食物',
                    'urine_zhengchang': '正常',
                    'urine_duanchi': '短赤',
                    'urine_duanhuang': '短黄',
                    'urine_qingchang': '清长',
                    'urine_yeniaopin': '夜尿频',
                    'urine_xbpinshu': '小便频数',
                    'urine_niaoji': '尿急',
                    'urine_niaotong': '尿痛',
                    'urine_shaoniao': '少尿',
                    'urine_yulibujin': '余沥不尽',
                    'limb_zhengchang': '正常',
                    'limb_wuli': '无力',
                    'limb_mamu': '麻木',
                    'limb_kunzhong': '困重',
                    'limb_zhileng': '肢冷',
                    'limb_bingliang': '冰凉',
                    'limb_szxinre': '手足心热',
                    'limb_fuzhong': '浮肿',
                    'other_wu': '无',
                    'other_czjdanbai': '唇爪甲淡白',
                    'other_xyjiantui': '性欲减退',
                    'texture_danhong': '淡红',
                    'texture_danbai': '淡白',
                    'texture_pianhong': '偏红',
                    'texture_danan': '淡黯',
                    'texture_zian': '紫黯',
                    'texture_yudian': '有瘀点或瘀斑',
                    'coating_bai': '白',
                    'coating_huang': '黄',
                    'coating_ni': '腻',
                    'coating_bo': '薄',
                    'coating_hou': '厚',
                    'coating_run': '润',
                    'coating_hua': '滑',
                    'coating_hhouni': '黄厚腻',
                    'coating_bairun': '白润',
                    'coating_huangcao': '黄糙',
                    'coating_wutai': '无苔',
                    'coating_shaotai': '少苔',
                    'coating_huabo': '花剥',
                    'tongue_shoubo': '瘦薄',
                    'tongue_pangda': '胖大',
                    'tongue_bianjianhong': '边尖红',
                    'tongue_youchihen': '有齿痕',
                    'tongue_zhongyouliewen': '中有裂纹',
                    'pulse_shi': '实',
                    'pulse_fu': '浮',
                    'pulse_chen': '沉',
                    'pulse_chi': '迟',
                    'pulse_huan': '缓',
                    'pulse_xi': '细',
                    'pulse_ruo': '弱',
                    'pulse_shu': '数',
                    'pulse_hua': '滑',
                    'pulse_se': '涩',
                    'pulse_xian': '弦',
                    'pulse_jin': '紧',
                    'pulse_kou': '芤',
                    'pulse_ru': '濡',
                    'pulse_hong': '洪',
                    'pulse_youli': '有力',
                    'pulse_wuli': '无力',
                
                    // 其他
                    'born_zaochan': '早产',
                    'born_zuyuechan': '足月产',
                    'born_yindaofenmian': '阴道分娩',
                    'born_pougongchan': '剖宫产',
                    'hobbies_wu': '无',
                    'hobbies_xiyan': '吸烟',
                    'hobbies_yinjiu': '饮酒',
                    'hobbies_qita': '其他嗜好',
                    'body_cond': '体力状况',
                    'career_labor': '职业体力活动',
                    'poor_blood': '贫血与否',
                    'phycial_exercise': '体育锻炼',
                    'reducefat_ever': '有减肥',
                    'reducefat_yundong': '运动减肥',
                    'reducefat_jieshi': '节食减肥',
                    'reducefat_yaowu': '药物减肥',
                    'reducefat_qita': '其他减肥',
                    'reducefat_persist': '减肥时长',
                    'mens_yundong': '经期运动',
                    'mens_ganmao': '经期感冒',
                    'mens_tongfang': '经期同房',
                    'mens_zhaoliang': '经期着凉',
                    'leucorrhea_liangshao': '带下量少',
                    'leucorrhea_liangke': '带下量可',
                    'leucorrhea_liangduo': '带下量多',
                    'leucorrhea_sehuang': '带下色黄',
                    'leucorrhea_sebai': '带下色白',
                    'leucorrhea_selv': '带下色绿',
                    'leucorrhea_zhiqingxi': '带下质清稀',
                    'leucorrhea_zhinianchou': '带下质粘稠',
                    'pasthistory_wu': '无',
                    'pasthistory_yuejingbutiao': '月经不调',
                    'pasthistory_yindaoyan': '阴道炎',
                    'pasthistory_zigongneimoyan': '子宫内膜炎',
                    'pasthistory_zigongneimoyiwei': '子宫内膜异位症',
                    'pasthistory_zigongxianjizheng': '子宫腺肌症',
                    'pasthistory_penqiangyan': '盆腔炎',
                    'pasthistory_zigongjiliu': '子宫肌瘤',
                    'pasthistory_luancaonangzhong': '卵巢囊肿',
                    'pasthistory_ruxianzengsheng': '乳腺增生',
                    'pasthistory_jiazhuangxian': '甲状腺相关疾病',
                    'pasthistory_shengzhiyichang': '生殖器官发育异常',
                    'pasthistory_naochuitiliu': '脑垂体瘤',
                    'pasthistory_feipang': '肥胖',
                    'pasthistory_ganyan': '肝炎',
                    'pasthistory_jiehe': '结核',
                    'pasthistory_qita': '其他病史',
                    'pastmens_zhouqiwenluan': '月经周期紊乱',
                    'pastmens_liangduo': '月经量多',
                    'pastmens_zhouqisuoduan': '月经周期缩短',
                    'pastmens_yanhou': '月经延后',
                    'pastmens_yanchang': '行经期延长',
                    'pastmens_tingbi': '月经停闭',
                    'pastmens_chuxie': '经间期出血',
                    'womb_blood': '一级亲属（母亲、姐妹、女儿）异常子宫出血史',
                    'ovulation': '是否为排卵障碍性',
                    'pastfamily_wu': '无',
                    'pastfamily_gaoxueya': '高血压',
                    'pastfamily_tangniaobing': '糖尿病',
                    'pastfamily_xinzangbing': '心脏病',
                    'pastfamily_duonangluanchao': '多囊卵巢综合征',
                    'pastfamily_buxiang': '不详',
                    'pastfamily_qita': '其他',
                    'pastpreg_yuncount': '孕次总数',
                    'pastpreg_pougong': '剖宫产次数',
                    'pastpreg_shunchan': '顺产次数',
                    'pastpreg_yaoliu': '药物流产次数',
                    'pastpreg_renliu': '人工流产次数',
                    'pastpreg_ziranliu': '自然流产次数',
                    'pastpreg_shenghuarenshen': '生化妊娠次数',
                    'pastpreg_yiweirenshen': '异位妊娠次数',
                    'pastpreg_taitingyu': '胎停育次数',
                    'pastpreg_qinggongshu': '清宫术次数',
                    'prevent_jieza': '结扎',
                    'prevent_jieyuqi': '宫内节育器',
                    'prevent_biyuntao': '避孕套',
                    'prevent_biyunyao': '口服避孕药',
                    'prevent_biyunyao_time': '末次口服避孕药时间',
                    'prevent_mafulong': '去氧孕烯炔雌片（妈富隆）',
                    'prevent_daying': '炔雌醇环丙孕酮片（达英-35）',
                    'prevent_yousiming': '屈螺酮炔雌醇片（优思明）',
                    'prevent_zuoque': '左炔诺孕酮',
                    'prevent_fufang': '复方左炔诺孕酮',
                    'prevent_qita': '其它口服',
                    'accessory_hgb_value': '血红蛋白值',
                    'accessory_quanxuexibaojishu': '全血细胞计数',
                    'accessory_chuxuexingjibing': '出血性疾病筛查（如女性血管性血友病）',
                    'accessory_ningxue': '凝血功能检查',
                    'accessory_jiazhuangxian': '甲状腺功能检测',
                    'accessory_niaorenshen': '尿妊娠试验',
                    'accessory_penqiangchaosheng': '盆腔超声检查',
                    'accessory_jichutiwen': '基础体温测定',
                    'accessory_jisushuiping': '激素水平测定',
                    'accessory_guagong': '诊断性刮宫或宫腔镜下刮宫',
                    'accessory_qita': '其它辅助检查',
                
                    //cc
                    'benglou': '崩漏',
                    'yuejingguoduo': '月经过多',
                    'yuejingxianqi': '月经先期',
                    'jingqiyanchang': '经期延长',
                    'jingjianqichuxie': '经间期出血',
                    'shenyin': '肾阴虚证',
                    'shenyang': '肾阳虚证',
                    'shenqi': '肾气虚证',
                    'piqi': '脾气虚证',
                    'qixuxiaxian': '气虚下陷证',
                    'xure': '虚热证',
                    'xinpiliangxu': '心脾两虚证',
                    'pishenyangxu': '脾肾阳虚证',
                    'qixuekuixu': '气血亏虚症',
                    'ganshenyinxu': '肝肾阴虚证',
                    'qita_asthenic': '其它虚证',
                    'ganyuxuere': '肝郁血热证',
                    'yangshengxuere': '阳盛血热证',
                    'ganjingshire': '肝经湿热证',
                    'tanreyuzu': '痰热瘀阻证',
                    'tanshizuzhi': '痰热瘀阻证',
                    'tanyuzuzhi': '痰湿阻滞证',
                    'yurehujie': '瘀热互结证',
                    'xueyu': '血瘀证',
                    'qizhixueyu': '气滞血瘀证',
                    'hanningxueyu': '寒凝血淤症',
                    'qita_demonstration': '其它实证',
                    'shenxuxueyu': '肾虚血瘀证',
                    'shenxuyure': '肾虚瘀热证',
                    'shenxuganyu': '肾虚肝郁证',
                    'qixuxueyu': '气虚血瘀证',
                    'yinxuxueyu': '阴虚血瘀证',
                    'yinxuhuowang': '阴虚火旺证',
                    'ganyupixu': '肝郁脾虚证',
                    'qita_def_ex': '其它虚实',
                    'duonangluanchao': '多囊卵巢综合征',
                    'gaomirusu': '高泌乳素血症',
                    'dicuxingxianjisu': '低促行线激素疾病',
                    'qita_west': '其它西医诊断',
                };
                var archiveobjs_empty = {
                    //一般信息
                    geninfo:{
                        recdate: "",
                        serial: "",
                        hospital: "",
                        expert: "",
                        title: "",
                        name: "",
                        telephone: "",
                        age: "",
                        height: "",
                        weight: "",
                        blood_type: "",
                        nation: "",
                        career: "",
                
                        //特殊工种环境
                        special_env:"",
                
                        address: "",
                        entrance: "",
                        culture: "",
                        marriage: "",
                
                        //饮食偏好
                        food_favor:"",
                    },
                    // 月经信息
                    menstruation:{
                        first_time: "",
                        cyclicity: "",
                        normal: "",
                        abnormal: "",
                        blood_cond: "",
                        cyclicity_sum: "",
                        blood_color: "",
                        blood_quality: "",
                        blood_block: "",
                        blood_character: "",
                    },
                    // 全身症状
                    symptom:{
                        spirit_jinglichongpei: '',
                        spirit_jianwang: '',
                        spirit_jingshenbujizhong: '',
                        spirit_shenpifali: '',
                        spirit_yalida: '',
                        spirit_jiaodabiangu: '',
                        spirit_beishangyuku: '',
                        mood_zhengchang: '',
                        mood_leguankailang: '',
                        mood_silvguodu: '',
                        mood_xinuwuchang: '',
                        mood_fanzaoyinu: '',
                        mood_jiaolv: '',
                        mood_beishangyuku: '',
                        mood_yiyu: '',
                        mood_duosiduolv: '',
                        mood_qita: '',
                        chillfever_zhengchang: '',
                        chillfever_weihan: '',
                        chillfever_wuxinfanre: '',
                        chillfever_wuhouchaore: '',
                        chillfever_direbutui: '',
                        sweat_zhengchang: '',
                        sweat_duohan: '',
                        sweat_mingxian: '',
                        sweat_zihan: '',
                        sweat_daohan: '',
                        sweat_hongre: '',
                        sweat_chaore: '',
                        sound_zhengchang: '',
                        sound_qiduan: '',
                        sound_xitanxi: '',
                        sound_shaoqilanyan: '',
                        face_zhengchang: '',
                        face_danbaiwuhua: '',
                        face_cangbai: '',
                        face_qingbai: '',
                        face_weihuang: '',
                        face_huangzhong: '',
                        face_chaohong: '',
                        face_huian: '',
                        face_baierfuzhong: '',
                        face_baierandan: '',
                        face_mianmulihei: '',
                        face_shaohua: '',
                        face_wuhua: '',
                        heart_zhengcheng: '',
                        heart_xinfan: '',
                        heart_xinji: '',
                        breast_zhengchang: '',
                        breast_biezhang: '',
                        breast_citong: '',
                        breast_zhangtong: '',
                        breast_chutong: '',
                        chest_zhengchang: '',
                        chest_zhangmen: '',
                        chest_yintong: '',
                        chest_citong: '',
                        waist_zhengchang: '',
                        waist_suantong: '',
                        waist_suanruan: '',
                        waist_suanleng: '',
                        waist_lengtong: '',
                        waist_yaotongrushe: '',
                        stomach_zhengchang: '',
                        stomach_zhangtongjuan: '',
                        stomach_xiaofuzhuizhang: '',
                        stomach_xiaofubiezhang: '',
                        stomach_xiaofulengtong: '',
                        stomach_xiaofuzhuotong: '',
                        stomach_yintongxian: '',
                        stomach_dewentongjian: '',
                        stomach_tongruzhenci: '',
                        stomach_kongzhui: '',
                        head_zhengchang: '',
                        head_touyun: '',
                        head_toutong: '',
                        head_touchenzhong: '',
                        eyes_zhengchang: '',
                        eyes_muxuan: '',
                        eyes_muse: '',
                        eyes_yanhua: '',
                        eyes_mutong: '',
                        eyes_muyang: '',
                        eyes_chenqifz: '',
                        ear_erming: '',
                        ear_erlong: '',
                        ear_tinglibq: '',
                        throat_zhengchang: '',
                        throat_yangan: '',
                        throat_yantong: '',
                        throat_yanyang: '',
                        throat_yiwugan: '',
                        breath_wuyiwei: '',
                        breath_kouku: '',
                        breath_kougan: '',
                        breath_koudan: '',
                        breath_kouxian: '',
                        breath_koutian: '',
                        breath_kounian: '',
                        breath_danyuss: '',
                        diet_nadaishishao: '',
                        diet_shiyuws: '',
                        diet_yanshi: '',
                        diet_xireyin: '',
                        diet_xilengyin: '',
                        diet_shiyujiantui: '',
                        diet_shihoufuzhang: '',
                        diet_shixinla: '',
                        diet_shishengleng: '',
                        diet_kebuduoyin: '',
                        sleep_zhengchang: '',
                        sleep_yiban: '',
                        sleep_duomengyixing: '',
                        sleep_nanyirumian: '',
                        sleep_cheyebumian: '',
                        sleep_duomeng: '',
                        sleep_shishui: '',
                        stool_sehuang: '',
                        stool_bianmi: '',
                        stool_zhixi: '',
                        stool_sgsx: '',
                        stool_xiexie: '',
                        stool_tlzqxiexie: '',
                        stool_zhinian: '',
                        stool_weixiaohua: '',
                        urine_zhengchang: '',
                        urine_duanchi: '',
                        urine_duanhuang: '',
                        urine_qingchang: '',
                        urine_yeniaopin: '',
                        urine_xbpinshu: '',
                        urine_niaoji: '',
                        urine_niaotong: '',
                        urine_shaoniao: '',
                        urine_yulibujin: '',
                        limb_zhengchang: '',
                        limb_wuli: '',
                        limb_mamu: '',
                        limb_kunzhong: '',
                        limb_zhileng: '',
                        limb_bingliang: '',
                        limb_szxinre: '',
                        limb_fuzhong: '',
                        other_wu: '',
                        other_czjdanbai: '',
                        other_xyjiantui: '',
                        texture_danhong: '',
                        texture_danbai: '',
                        texture_pianhong: '',
                        texture_danan: '',
                        texture_zian: '',
                        texture_yudian: '',
                        coating_bai: '',
                        coating_huang: '',
                        coating_ni: '',
                        coating_bo: '',
                        coating_hou: '',
                        coating_run: '',
                        coating_hua: '',
                        coating_hhouni: '',
                        coating_bairun: '',
                        coating_huangcao: '',
                        coating_wutai: '',
                        coating_shaotai: '',
                        coating_huabo: '',
                        tongue_shoubo: '',
                        tongue_pangda: '',
                        tongue_bianjianhong: '',
                        tongue_youchihen: '',
                        tongue_zhongyouliewen: '',
                        pulse_shi: '',
                        pulse_fu: '',
                        pulse_chen: '',
                        pulse_chi: '',
                        pulse_huan: '',
                        pulse_xi: '',
                        pulse_ruo: '',
                        pulse_shu: '',
                        pulse_hua: '',
                        pulse_se: '',
                        pulse_xian: '',
                        pulse_jin: '',
                        pulse_kou: '',
                        pulse_ru: '',
                        pulse_hong: '',
                        pulse_youli: '',
                        pulse_wuli: '',
                    },
                    // 其他
                    other:{
                        born_zaochan: '',
                        born_zuyuechan: '',
                        born_yindaofenmian: '',
                        born_pougongchan: '',
                        hobbies_wu: '',
                        hobbies_xiyan: '',
                        hobbies_yinjiu: '',
                        hobbies_qita: '',
                        body_cond: '',
                        career_labor: '',
                        poor_blood: '',
                        phycial_exercise: '',
                        reducefat_ever: '',
                        reducefat_yundong: '',
                        reducefat_jieshi: '',
                        reducefat_yaowu: '',
                        reducefat_qita: '',
                        reducefat_persist: '',
                        mens_yundong: '',
                        mens_ganmao: '',
                        mens_tongfang: '',
                        mens_zhaoliang: '',
                        leucorrhea_liangshao: '',
                        leucorrhea_liangke: '',
                        leucorrhea_liangduo: '',
                        leucorrhea_sehuang: '',
                        leucorrhea_sebai: '',
                        leucorrhea_selv: '',
                        leucorrhea_zhiqingxi: '',
                        leucorrhea_zhinianchou: '',
                        pasthistory_wu: '',
                        pasthistory_yuejingbutiao: '',
                        pasthistory_yindaoyan: '',
                        pasthistory_zigongneimoyan: '',
                        pasthistory_zigongneimoyiwei: '',
                        pasthistory_zigongxianjizheng: '',
                        pasthistory_penqiangyan: '',
                        pasthistory_zigongjiliu: '',
                        pasthistory_luancaonangzhong: '',
                        pasthistory_ruxianzengsheng: '',
                        pasthistory_jiazhuangxian: '',
                        pasthistory_shengzhiyichang: '',
                        pasthistory_naochuitiliu: '',
                        pasthistory_feipang: '',
                        pasthistory_ganyan: '',
                        pasthistory_jiehe: '',
                        pasthistory_qita: '',
                        pastmens_zhouqiwenluan: '',
                        pastmens_liangduo: '',
                        pastmens_zhouqisuoduan: '',
                        pastmens_yanhou: '',
                        pastmens_yanchang: '',
                        pastmens_tingbi: '',
                        pastmens_chuxie: '',
                        womb_blood: '',
                        ovulation: '',
                        pastfamily_wu: '',
                        pastfamily_gaoxueya: '',
                        pastfamily_tangniaobing: '',
                        pastfamily_xinzangbing: '',
                        pastfamily_duonangluanchao: '',
                        pastfamily_buxiang: '',
                        pastfamily_qita: '',
                        pastpreg_yuncount: '',
                        pastpreg_pougong: '',
                        pastpreg_shunchan: '',
                        pastpreg_yaoliu: '',
                        pastpreg_renliu: '',
                        pastpreg_ziranliu: '',
                        pastpreg_shenghuarenshen: '',
                        pastpreg_yiweirenshen: '',
                        pastpreg_taitingyu: '',
                        pastpreg_qinggongshu: '',
                        prevent_jieza: '',
                        prevent_jieyuqi: '',
                        prevent_biyuntao: '',
                        prevent_biyunyao: '',
                        prevent_biyunyao_time: '',
                        prevent_mafulong: '',
                        prevent_daying: '',
                        prevent_yousiming: '',
                        prevent_zuoque: '',
                        prevent_fufang: '',
                        prevent_qita: '',
                        accessory_hgb_value: '',
                        accessory_quanxuexibaojishu: '',
                        accessory_chuxuexingjibing: '',
                        accessory_ningxue: '',
                        accessory_jiazhuangxian: '',
                        accessory_niaorenshen: '',
                        accessory_penqiangchaosheng: '',
                        accessory_jichutiwen: '',
                        accessory_jisushuiping: '',
                        accessory_guagong: '',
                        accessory_qita: '',
                    },
                    //临床
                    clinicalconclusion:{
                        benglou: '',
                        yuejingguoduo: '',
                        yuejingxianqi: '',
                        jingqiyanchang: '',
                        jingjianqichuxie: '',
                        shenyin: '',
                        shenyang: '',
                        shenqi: '',
                        piqi: '',
                        qixuxiaxian: '',
                        xure: '',
                        xinpiliangxu: '',
                        pishenyangxu: '',
                        qixuekuixu: '',
                        ganshenyinxu: '',
                        qita_asthenic: '',
                        ganyuxuere: '',
                        yangshengxuere: '',
                        ganjingshire: '',
                        tanreyuzu: '',
                        tanshizuzhi: '',
                        tanyuzuzhi: '',
                        yurehujie: '',
                        xueyu: '',
                        qizhixueyu: '',
                        hanningxueyu: '',
                        qita_demonstration: '',
                        shenxuxueyu: '',
                        shenxuyure: '',
                        shenxuganyu: '',
                        qixuxueyu: '',
                        yinxuxueyu: '',
                        yinxuhuowang: '',
                        ganyupixu: '',
                        qita_def_ex: '',
                        duonangluanchao: '',
                        gaomirusu: '',
                        dicuxingxianjisu: '',
                        qita_west: '',
                    },
                }  
                console.log("12. 病例所有信息", archiveobjs);                                         
                for (var i in archiveobjs) {
                    if (archiveobjs[i]==null) {
                        archiveobjs[i] = archiveobjs_empty[i];
                        // console.log("13.", archiveobjs[i]);
                    } else {
                        for (var j in archiveobjs[i]) {
                            // console.log(excel_key[j]);
                            if ( typeof(archiveobjs[i][j])=="boolean" ) {
                                if (archiveobjs[i][j]==true) {
                                    if (j=="cyclicity") {
                                        archiveobjs[i][j] = "尚规律";
                                    } else {
                                        archiveobjs[i][j] = dict_table[j];
                                    }
                                } else {
                                    if (j=="cyclicity") {
                                        archiveobjs[i][j] = "不规律";
                                    } else {
                                        archiveobjs[i][j] = "";
                                    }
                                }
                            }
                        }
                    }                   
                }
                var patient_archive = {
                    //一般信息
                    geninfo:{
                    "recdate": archiveobjs.geninfo.recdate,
                    "serial": archiveobjs.geninfo.serial,
                    "hospital": archiveobjs.geninfo.hospital,
                    "expert": archiveobjs.geninfo.expert,
                    "title": archiveobjs.geninfo.title,
                    "name": archiveobjs.geninfo.name,
                    "telephone": archiveobjs.geninfo.telephone,
                    "age": archiveobjs.geninfo.age,
                    "height": archiveobjs.geninfo.height,
                    "weight": archiveobjs.geninfo.weight,
                    "blood_type": archiveobjs.geninfo.blood_type,
                    "nation": archiveobjs.geninfo.nation,
                    "career": archiveobjs.geninfo.career,
                
                //特殊工种环境
                    'special_env':
                      archiveobjs.geninfo.gaokong + " "
                    + archiveobjs.geninfo.diwen + " "
                    + archiveobjs.geninfo.zaosheng + " "
                    + archiveobjs.geninfo.fushe + " "
                    + archiveobjs.geninfo.huagongyinran + " "
                    + archiveobjs.geninfo.julieyundong + " "
                    + archiveobjs.geninfo.qiyou + " "
                    + archiveobjs.geninfo.wu + " ",
                
                    "address": archiveobjs.geninfo.address,
                    "entrance": archiveobjs.geninfo.entrance,
                    "culture": archiveobjs.geninfo.culture,
                    "marriage": archiveobjs.geninfo.marriage,
                
                //饮食偏好
                    'food_favor':
                      archiveobjs.geninfo.wuteshu + " "
                    + archiveobjs.geninfo.sushi + " "
                    + archiveobjs.geninfo.suan + " "
                    + archiveobjs.geninfo.tian + " "
                    + archiveobjs.geninfo.xian + " "
                    + archiveobjs.geninfo.xinla + " "
                    + archiveobjs.geninfo.you + " "
                    + archiveobjs.geninfo.shengleng + " "
                    + archiveobjs.geninfo.kafei + " "
                    + archiveobjs.geninfo.qita + " ",
                    },
                    // 月经信息
                    menstruation:{
                    'first_time': archiveobjs.menstruation.first_time,
                    'cyclicity': archiveobjs.menstruation.cyclicity,
                    'normal': archiveobjs.menstruation.normal,
                    'abnormal': archiveobjs.menstruation.abnormal,
                    'blood_cond': archiveobjs.menstruation.blood_cond,
                    'cyclicity_sum': archiveobjs.menstruation.cyclicity_sum,
                    'blood_color': archiveobjs.menstruation.blood_color,
                    'blood_quality': archiveobjs.menstruation.blood_quality,
                    'blood_block': archiveobjs.menstruation.blood_block,
                    'blood_character': archiveobjs.menstruation.blood_character,
                    },
                    // 全身症状
                    symptom:{
                    'spirit':
                      archiveobjs.symptom.spirit_jinglichongpei + " "
                    + archiveobjs.symptom.spirit_jianwang + " "
                    + archiveobjs.symptom.spirit_jingshenbujizhong + " "
                    + archiveobjs.symptom.spirit_shenpifali + " "
                    + archiveobjs.symptom.spirit_yalida + " "
                    + archiveobjs.symptom.spirit_jiaodabiangu + " "
                    + archiveobjs.symptom.spirit_beishangyuku + " ",
                
                    'mood':
                      archiveobjs.symptom.mood_zhengchang + " "
                    + archiveobjs.symptom.mood_leguankailang + " "
                    + archiveobjs.symptom.mood_silvguodu + " "
                    + archiveobjs.symptom.mood_xinuwuchang + " "
                    + archiveobjs.symptom.mood_fanzaoyinu + " "
                    + archiveobjs.symptom.mood_jiaolv + " "
                    + archiveobjs.symptom.mood_beishangyuku + " "
                    + archiveobjs.symptom.mood_yiyu + " "
                    + archiveobjs.symptom.mood_duosiduolv + " "
                    + archiveobjs.symptom.mood_qita + " ",
                
                    'chillfever':
                      archiveobjs.symptom.chillfever_zhengchang + " "
                    + archiveobjs.symptom.chillfever_weihan + " "
                    + archiveobjs.symptom.chillfever_wuxinfanre + " "
                    + archiveobjs.symptom.chillfever_wuhouchaore + " "
                    + archiveobjs.symptom.chillfever_direbutui + " ",
                
                    sweat:
                    archiveobjs.symptom.sweat_zhengchang + " "
                    + archiveobjs.symptom.sweat_duohan + " "
                    + archiveobjs.symptom.sweat_mingxian + " "
                    + archiveobjs.symptom.sweat_zihan + " "
                    + archiveobjs.symptom.sweat_daohan + " "
                    + archiveobjs.symptom.sweat_hongre + " "
                    + archiveobjs.symptom.sweat_chaore + " ",
                
                    sound:
                    archiveobjs.symptom.sound_zhengchang + " "
                    + archiveobjs.symptom.sound_qiduan + " "
                    + archiveobjs.symptom.sound_xitanxi + " "
                    + archiveobjs.symptom.sound_shaoqilanyan + " ",
                
                    face:
                    archiveobjs.symptom.face_zhengchang + " "
                    + archiveobjs.symptom.face_danbaiwuhua + " "
                    + archiveobjs.symptom.face_cangbai + " "
                    + archiveobjs.symptom.face_qingbai + " "
                    + archiveobjs.symptom.face_weihuang + " "
                    + archiveobjs.symptom.face_huangzhong + " "
                    + archiveobjs.symptom.face_chaohong + " "
                    + archiveobjs.symptom.face_huian + " "
                    + archiveobjs.symptom.face_baierfuzhong + " "
                    + archiveobjs.symptom.face_baierandan + " "
                    + archiveobjs.symptom.face_mianmulihei + " "
                    + archiveobjs.symptom.face_shaohua + " "
                    + archiveobjs.symptom.face_wuhua + " ",
                
                    heart:
                    archiveobjs.symptom.heart_zhengcheng + " "
                    + archiveobjs.symptom.heart_xinfan + " "
                    + archiveobjs.symptom.heart_xinji + " ",
                
                    breast:
                    archiveobjs.symptom.breast_zhengchang + " "
                    + archiveobjs.symptom.breast_biezhang + " "
                    + archiveobjs.symptom.breast_citong + " "
                    + archiveobjs.symptom.breast_zhangtong + " "
                    + archiveobjs.symptom.breast_chutong + " ",
                
                    chest:
                    archiveobjs.symptom.chest_zhengchang + " "
                    + archiveobjs.symptom.chest_zhangmen + " "
                    + archiveobjs.symptom.chest_yintong + " "
                    + archiveobjs.symptom.chest_citong + " ",
                
                    waist:
                    archiveobjs.symptom.waist_zhengchang + " "
                    + archiveobjs.symptom.waist_suantong + " "
                    + archiveobjs.symptom.waist_suanruan + " "
                    + archiveobjs.symptom.waist_suanleng + " "
                    + archiveobjs.symptom.waist_lengtong + " "
                    + archiveobjs.symptom.waist_yaotongrushe + " ",
                
                    stomach:
                    archiveobjs.symptom.stomach_zhengchang + " "
                    + archiveobjs.symptom.stomach_zhangtongjuan + " "
                    + archiveobjs.symptom.stomach_xiaofuzhuizhang + " "
                    + archiveobjs.symptom.stomach_xiaofubiezhang + " "
                    + archiveobjs.symptom.stomach_xiaofulengtong + " "
                    + archiveobjs.symptom.stomach_xiaofuzhuotong + " "
                    + archiveobjs.symptom.stomach_yintongxian + " "
                    + archiveobjs.symptom.stomach_dewentongjian + " "
                    + archiveobjs.symptom.stomach_tongruzhenci + " "
                    + archiveobjs.symptom.stomach_kongzhui + " ",
                
                    head:
                    archiveobjs.symptom.head_zhengchang + " "
                    + archiveobjs.symptom.head_touyun + " "
                    + archiveobjs.symptom.head_toutong + " "
                    + archiveobjs.symptom.head_touchenzhong + " ",
                
                    eyes:
                      archiveobjs.symptom.eyes_zhengchang + " "
                    + archiveobjs.symptom.eyes_muxuan + " "
                    + archiveobjs.symptom.eyes_muse + " "
                    + archiveobjs.symptom.eyes_yanhua + " "
                    + archiveobjs.symptom.eyes_mutong + " "
                    + archiveobjs.symptom.eyes_muyang + " "
                    + archiveobjs.symptom.eyes_chenqifz + " ",
                
                    ear:
                    archiveobjs.symptom.ear_erming + " "
                    + archiveobjs.symptom.ear_erlong + " "
                    + archiveobjs.symptom.ear_tinglibq + " ",
                
                    throat:
                    archiveobjs.symptom.throat_zhengchang + " "
                    + archiveobjs.symptom.throat_yangan + " "
                    + archiveobjs.symptom.throat_yantong + " "
                    + archiveobjs.symptom.throat_yanyang + " "
                    + archiveobjs.symptom.throat_yiwugan + " ",
                
                    breath:
                    archiveobjs.symptom.breath_wuyiwei + " "
                    + archiveobjs.symptom.breath_kouku + " "
                    + archiveobjs.symptom.breath_kougan + " "
                    + archiveobjs.symptom.breath_koudan + " "
                    + archiveobjs.symptom.breath_kouxian + " "
                    + archiveobjs.symptom.breath_koutian + " "
                    + archiveobjs.symptom.breath_kounian + " "
                    + archiveobjs.symptom.breath_danyuss + " ",
                
                    diet:
                    archiveobjs.symptom.diet_nadaishishao + " "
                    + archiveobjs.symptom.diet_shiyuws + " "
                    + archiveobjs.symptom.diet_yanshi + " "
                    + archiveobjs.symptom.diet_xireyin + " "
                    + archiveobjs.symptom.diet_xilengyin + " "
                    + archiveobjs.symptom.diet_shiyujiantui + " "
                    + archiveobjs.symptom.diet_shihoufuzhang + " "
                    + archiveobjs.symptom.diet_shixinla + " "
                    + archiveobjs.symptom.diet_shishengleng + " "
                    + archiveobjs.symptom.diet_kebuduoyin + " ",
                
                    sleep:
                    archiveobjs.symptom.sleep_zhengchang + " "
                    + archiveobjs.symptom.sleep_yiban + " "
                    + archiveobjs.symptom.sleep_duomengyixing + " "
                    + archiveobjs.symptom.sleep_nanyirumian + " "
                    + archiveobjs.symptom.sleep_cheyebumian + " "
                    + archiveobjs.symptom.sleep_duomeng + " "
                    + archiveobjs.symptom.sleep_shishui + " ",
                
                    stool:
                    archiveobjs.symptom.stool_sehuang + " "
                    + archiveobjs.symptom.stool_bianmi + " "
                    + archiveobjs.symptom.stool_zhixi + " "
                    + archiveobjs.symptom.stool_sgsx + " "
                    + archiveobjs.symptom.stool_xiexie + " "
                    + archiveobjs.symptom.stool_tlzqxiexie + " "
                    + archiveobjs.symptom.stool_zhinian + " "
                    + archiveobjs.symptom.stool_weixiaohua + " ",
                
                    urine:
                    archiveobjs.symptom.urine_zhengchang + " "
                    + archiveobjs.symptom.urine_duanchi + " "
                    + archiveobjs.symptom.urine_duanhuang + " "
                    + archiveobjs.symptom.urine_qingchang + " "
                    + archiveobjs.symptom.urine_yeniaopin + " "
                    + archiveobjs.symptom.urine_xbpinshu + " "
                    + archiveobjs.symptom.urine_niaoji + " "
                    + archiveobjs.symptom.urine_niaotong + " "
                    + archiveobjs.symptom.urine_shaoniao + " "
                    + archiveobjs.symptom.urine_yulibujin + " ",
                
                    limb:
                    archiveobjs.symptom.limb_zhengchang + " "
                    + archiveobjs.symptom.limb_wuli + " "
                    + archiveobjs.symptom.limb_mamu + " "
                    + archiveobjs.symptom.limb_kunzhong + " "
                    + archiveobjs.symptom.limb_zhileng + " "
                    + archiveobjs.symptom.limb_bingliang + " "
                    + archiveobjs.symptom.limb_szxinre + " "
                    + archiveobjs.symptom.limb_fuzhong + " ",
                
                    other:
                    archiveobjs.symptom.other_wu + " "
                    + archiveobjs.symptom.other_czjdanbai + " "
                    + archiveobjs.symptom.other_xyjiantui + " ",
                
                    texture:
                    archiveobjs.symptom.texture_danhong + " "
                    + archiveobjs.symptom.texture_danbai + " "
                    + archiveobjs.symptom.texture_pianhong + " "
                    + archiveobjs.symptom.texture_danan + " "
                    + archiveobjs.symptom.texture_zian + " "
                    + archiveobjs.symptom.texture_yudian + " ",
                
                    coating:
                    archiveobjs.symptom.coating_bai + " "
                    + archiveobjs.symptom.coating_huang + " "
                    + archiveobjs.symptom.coating_ni + " "
                    + archiveobjs.symptom.coating_bo + " "
                    + archiveobjs.symptom.coating_hou + " "
                    + archiveobjs.symptom.coating_run + " "
                    + archiveobjs.symptom.coating_hua + " "
                    + archiveobjs.symptom.coating_hhouni + " "
                    + archiveobjs.symptom.coating_bairun + " "
                    + archiveobjs.symptom.coating_huangcao + " "
                    + archiveobjs.symptom.coating_wutai + " "
                    + archiveobjs.symptom.coating_shaotai + " "
                    + archiveobjs.symptom.coating_huabo + " ",
                
                    tongue:
                    archiveobjs.symptom.tongue_shoubo + " "
                    + archiveobjs.symptom.tongue_pangda + " "
                    + archiveobjs.symptom.tongue_bianjianhong + " "
                    + archiveobjs.symptom.tongue_youchihen + " "
                    + archiveobjs.symptom.tongue_zhongyouliewen + " ",
                
                    pulse:
                    archiveobjs.symptom.pulse_shi + " "
                    + archiveobjs.symptom.pulse_fu + " "
                    + archiveobjs.symptom.pulse_chen + " "
                    + archiveobjs.symptom.pulse_chi + " "
                    + archiveobjs.symptom.pulse_huan + " "
                    + archiveobjs.symptom.pulse_xi + " "
                    + archiveobjs.symptom.pulse_ruo + " "
                    + archiveobjs.symptom.pulse_shu + " "
                    + archiveobjs.symptom.pulse_hua + " "
                    + archiveobjs.symptom.pulse_se + " "
                    + archiveobjs.symptom.pulse_xian + " "
                    + archiveobjs.symptom.pulse_jin + " "
                    + archiveobjs.symptom.pulse_kou + " "
                    + archiveobjs.symptom.pulse_ru + " "
                    + archiveobjs.symptom.pulse_hong + " "
                    + archiveobjs.symptom.pulse_youli + " "
                    + archiveobjs.symptom.pulse_wuli + " ",
                    },
                    // 其他
                    other:{
                    born:
                    archiveobjs.other.born_zaochan + " "
                    + archiveobjs.other.born_zuyuechan + " "
                    + archiveobjs.other.born_yindaofenmian + " "
                    + archiveobjs.other.born_pougongchan + " ",
                
                    hobbies:
                     archiveobjs.other.hobbies_wu + " "
                    + archiveobjs.other.hobbies_xiyan + " "
                    + archiveobjs.other.hobbies_yinjiu + " "
                    + archiveobjs.other.hobbies_qita + " ",
                
                    'body_cond': archiveobjs.other.body_cond,
                    'career_labor': archiveobjs.other.career_labor,
                    'poor_blood': archiveobjs.other.poor_blood,
                    'phycial_exercise': archiveobjs.other.phycial_exercise,
                
                    reducefat:
                     archiveobjs.other.reducefat_ever + " "
                    + archiveobjs.other.reducefat_yundong + " "
                    + archiveobjs.other.reducefat_jieshi + " "
                    + archiveobjs.other.reducefat_yaowu + " "
                    + archiveobjs.other.reducefat_qita + " ",
                    'reducefat_persist': archiveobjs.other.reducefat_persist,
                
                    'mens_yundong':archiveobjs.other.mens_yundong,
                    'mens_ganmao':archiveobjs.other.mens_ganmao,
                    'mens_tongfang':archiveobjs.other.mens_tongfang,
                    'mens_zhaoliang':archiveobjs.other.mens_zhaoliang,
                
                    leucorrhea:
                     archiveobjs.other.leucorrhea_liangshao + " "
                    + archiveobjs.other.leucorrhea_liangke + " "
                    + archiveobjs.other.leucorrhea_liangduo + " "
                    + archiveobjs.other.leucorrhea_sehuang + " "
                    + archiveobjs.other.leucorrhea_sebai + " "
                    + archiveobjs.other.leucorrhea_selv + " "
                    + archiveobjs.other.leucorrhea_zhiqingxi + " "
                    + archiveobjs.other.leucorrhea_zhinianchou + " ",
                
                    pasthistory:
                     archiveobjs.other.pasthistory_wu + " "
                    + archiveobjs.other.pasthistory_yuejingbutiao + " "
                    + archiveobjs.other.pasthistory_yindaoyan + " "
                    + archiveobjs.other.pasthistory_zigongneimoyan + " "
                    + archiveobjs.other.pasthistory_zigongneimoyiwei + " "
                    + archiveobjs.other.pasthistory_zigongxianjizheng + " "
                    + archiveobjs.other.pasthistory_penqiangyan + " "
                    + archiveobjs.other.pasthistory_zigongjiliu + " "
                    + archiveobjs.other.pasthistory_luancaonangzhong + " "
                    + archiveobjs.other.pasthistory_ruxianzengsheng + " "
                    + archiveobjs.other.pasthistory_jiazhuangxian + " "
                    + archiveobjs.other.pasthistory_shengzhiyichang + " "
                    + archiveobjs.other.pasthistory_naochuitiliu + " "
                    + archiveobjs.other.pasthistory_feipang + " "
                    + archiveobjs.other.pasthistory_ganyan + " "
                    + archiveobjs.other.pasthistory_jiehe + " "
                    + archiveobjs.other.pasthistory_qita + " ",
                
                    pastmens:
                     archiveobjs.other.pastmens_zhouqiwenluan + " "
                    + archiveobjs.other.pastmens_liangduo + " "
                    + archiveobjs.other.pastmens_zhouqisuoduan + " "
                    + archiveobjs.other.pastmens_yanhou + " "
                    + archiveobjs.other.pastmens_yanchang + " "
                    + archiveobjs.other.pastmens_tingbi + " "
                    + archiveobjs.other.pastmens_chuxie + " ",
                
                    'womb_blood': archiveobjs.other.womb_blood,
                    'ovulation': archiveobjs.other.ovulation,
                
                    pastfamily:
                     archiveobjs.other.pastfamily_wu + " "
                    + archiveobjs.other.pastfamily_gaoxueya + " "
                    + archiveobjs.other.pastfamily_tangniaobing + " "
                    + archiveobjs.other.pastfamily_xinzangbing + " "
                    + archiveobjs.other.pastfamily_duonangluanchao + " "
                    + archiveobjs.other.pastfamily_buxiang + " "
                    + archiveobjs.other.pastfamily_qita + " ",
                
                    'pastpreg_yuncount':archiveobjs.other.pastpreg_yuncount,
                    'pastpreg_pougong':archiveobjs.other.pastpreg_pougong,
                    'pastpreg_shunchan':archiveobjs.other.pastpreg_shunchan,
                    'pastpreg_yaoliu':archiveobjs.other.pastpreg_yaoliu,
                    'pastpreg_renliu':archiveobjs.other.pastpreg_renliu,
                    'pastpreg_ziranliu':archiveobjs.other.pastpreg_ziranliu,
                    'pastpreg_shenghuarenshen':archiveobjs.other.pastpreg_shenghuarenshen,
                    'pastpreg_yiweirenshen':archiveobjs.other.pastpreg_yiweirenshen,
                    'pastpreg_taitingyu':archiveobjs.other.pastpreg_taitingyu,
                    'pastpreg_qinggongshu':archiveobjs.other.pastpreg_qinggongshu,
                
                    prevent:
                      archiveobjs.other.prevent_jieza + " "
                    + archiveobjs.other.prevent_jieyuqi + " "
                    + archiveobjs.other.prevent_biyuntao + " "
                    + archiveobjs.other.prevent_biyunyao + " ",
                    'biyunyao_time':archiveobjs.other.prevent_biyunyao_time,
                    'biyunyao':
                      archiveobjs.other.prevent_mafulong + " "
                    + archiveobjs.other.prevent_daying + " "
                    + archiveobjs.other.prevent_yousiming + " "
                    + archiveobjs.other.prevent_zuoque + " "
                    + archiveobjs.other.prevent_fufang + " "
                    + archiveobjs.other.prevent_qita + " ",
                
                    'accessory_hgb_value':archiveobjs.other.accessory_hgb_value,
                    'accessory_quanxuexibaojishu':archiveobjs.other.accessory_quanxuexibaojishu,
                    'accessory_chuxuexingjibing':archiveobjs.other.accessory_chuxuexingjibing,
                    'accessory_ningxue':archiveobjs.other.accessory_ningxue,
                    'accessory_jiazhuangxian':archiveobjs.other.accessory_jiazhuangxian,
                    'accessory_niaorenshen':archiveobjs.other.accessory_niaorenshen,
                    'accessory_penqiangchaosheng':archiveobjs.other.accessory_penqiangchaosheng,
                    'accessory_jichutiwen':archiveobjs.other.accessory_jichutiwen,
                    'accessory_jisushuiping':archiveobjs.other.accessory_jisushuiping,
                    'accessory_guagong':archiveobjs.other.accessory_guagong,
                    'accessory_qita':archiveobjs.other.accessory_qita,
                    },
                    //临床
                    clinicalconclusion:{
                    chinese_medicine:
                     archiveobjs.clinicalconclusion.benglou + " "
                    + archiveobjs.clinicalconclusion.yuejingguoduo + " "
                    + archiveobjs.clinicalconclusion.yuejingxianqi + " "
                    + archiveobjs.clinicalconclusion.jingqiyanchang + " "
                    + archiveobjs.clinicalconclusion.jingjianqichuxie + " ",

                    asthenic:
                    archiveobjs.clinicalconclusion.shenyin + " "
                    + archiveobjs.clinicalconclusion.shenyang + " "
                    + archiveobjs.clinicalconclusion.shenqi + " "
                    + archiveobjs.clinicalconclusion.piqi + " "
                    + archiveobjs.clinicalconclusion.qixuxiaxian + " "
                    + archiveobjs.clinicalconclusion.xure + " "
                    + archiveobjs.clinicalconclusion.xinpiliangxu + " "
                    + archiveobjs.clinicalconclusion.pishenyangxu + " "
                    + archiveobjs.clinicalconclusion.qixuekuixu + " "
                    + archiveobjs.clinicalconclusion.ganshenyinxu + " "
                    + archiveobjs.clinicalconclusion.qita_asthenic + " ",

                    demonstration:
                    archiveobjs.clinicalconclusion.ganyuxuere + " "
                    + archiveobjs.clinicalconclusion.yangshengxuere + " "
                    + archiveobjs.clinicalconclusion.ganjingshire + " "
                    + archiveobjs.clinicalconclusion.tanreyuzu + " "
                    + archiveobjs.clinicalconclusion.tanshizuzhi + " "
                    + archiveobjs.clinicalconclusion.tanyuzuzhi + " "
                    + archiveobjs.clinicalconclusion.yurehujie + " "
                    + archiveobjs.clinicalconclusion.xueyu + " "
                    + archiveobjs.clinicalconclusion.qizhixueyu + " "
                    + archiveobjs.clinicalconclusion.hanningxueyu + " "
                    + archiveobjs.clinicalconclusion.qita_demonstration + " ",

                    def_ex:
                     archiveobjs.clinicalconclusion.shenxuxueyu + " "
                    + archiveobjs.clinicalconclusion.shenxuyure + " "
                    + archiveobjs.clinicalconclusion.shenxuganyu + " "
                    + archiveobjs.clinicalconclusion.qixuxueyu + " "
                    + archiveobjs.clinicalconclusion.yinxuxueyu + " "
                    + archiveobjs.clinicalconclusion.yinxuhuowang + " "
                    + archiveobjs.clinicalconclusion.ganyupixu + " "
                    + archiveobjs.clinicalconclusion.qita_def_ex + " ",

                    west:
                     archiveobjs.clinicalconclusion.duonangluanchao + " "
                    + archiveobjs.clinicalconclusion.gaomirusu + " "
                    + archiveobjs.clinicalconclusion.dicuxingxianjisu + " "
                    + archiveobjs.clinicalconclusion.qita_west + " ",
                    },
                }
                console.log("14. 病例所有信息", archiveobjs);

                res.render('patientInfo', {
                    // title: '流调项目-排卵障碍性异常子宫出血',
                    archives: patient_archive,//archiveobjs,
                    username: req.cookies.userinfo.email,
                });
            }
        })
    }//第一个if结束

});
/* 审核 */
router.get('/check', function (req, res, next){
    var id = req.query.id;
    var page = req.query.page;
    // var id = req.params.id; //router.get('/patientInfo/:id'...
    console.log("id", id);
    var check_url = myconst.apiurl + "prj001/info/" + id +'/checked/';

    var authstring = req.cookies.prj001token.access_token;
    var options = {
        url: check_url,
        headers: {
            'Authorization': 'Bearer ' + authstring
        }
    };
    request.post(options, function (error, response, body) {
        var user_geninfo = JSON.parse(body); 
        console.log("check",response.statusCode)           
        if (!error && response.statusCode == 200) {
            // res.json({user_geninfo: user_geninfo, status: 200});
            res.redirect("/prj001/?page="+page);
        } else {
            if (response.statusCode == 403) {
                console.log(">>>审核 body: ", user_geninfo);
                res.json({user_geninfo:user_geninfo, status:403});
            }
            //console.log(">>>Getting archives met unknown error. " + error.error_description);
            else {
                console.log(">>>其它错误码的body: ", user_geninfo);
                res.json({user_geninfo: user_geninfo, status:1400});
            }
        }
    });
});
module.exports = router;
