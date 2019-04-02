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

                if ( (params["keyword"] == undefined) || (params["keyword"] =="") ) {
                    res.render('prj001', {
                        title: '流调项目-排卵障碍性异常子宫出血',
                        is_admin:archiveobjs.is_admin,
                        archives: archiveobjs.results,
                        //账户信息
                        account_email:req.cookies.accountinfo.email,
                        account_phone:req.cookies.accountinfo.phone,
                        username:req.cookies.accountinfo.user_name,
                        account_sex:req.cookies.accountinfo.sex,
                        account_area:req.cookies.accountinfo.area,
                        account_hospital:req.cookies.accountinfo.hospital,
                        account_address:req.cookies.accountinfo.address,

                        totalpagenumber: archiveobjs.total_pages,
                        curpage: curPageNumber,
                        previouspage: previousPage,
                        nextpage: nextPage,
                        totalCount: archiveobjs.count,
                        searchname: '',
                        name: '', address:'', hospital:'', telephone:'',is_checked:'',//用于搜索框保留关键字
                    });
                } else {
                    res.render('prj001', {
                        title: '流调项目-排卵障碍性异常子宫出血',
                        is_admin:archiveobjs.is_admin,
                        archives: archiveobjs.results,
                        //账户信息
                        account_email:req.cookies.accountinfo.email,
                        account_phone:req.cookies.accountinfo.phone,
                        username:req.cookies.accountinfo.user_name,
                        account_sex:req.cookies.accountinfo.sex,
                        account_area:req.cookies.accountinfo.area,
                        account_hospital:req.cookies.accountinfo.hospital,
                        account_address:req.cookies.accountinfo.address,

                        totalpagenumber: archiveobjs.total_pages,
                        curpage: curPageNumber,
                        previouspage: previousPage,
                        nextpage: nextPage,
                        totalCount: archiveobjs.count,
                        //用于搜索框保留关键字
                        name: params["name"], address:params["address"], hospital:params["hospital"], telephone:params["telephone"],is_checked:params["is_checked"],
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

                            if (params["keyword"] == undefined) {
                                res.render('prj001', {
                                    title: '流调项目-排卵障碍性异常子宫出血',
                                    is_admin:archiveobjs.is_admin,
                                    archives: archiveobjs.results,
                                    //账户信息
                                    account_email:req.cookies.accountinfo.email,
                                    account_phone:req.cookies.accountinfo.phone,
                                    username:req.cookies.accountinfo.user_name,
                                    account_sex:req.cookies.accountinfo.sex,
                                    account_area:req.cookies.accountinfo.area,
                                    account_hospital:req.cookies.accountinfo.hospital,
                                    account_address:req.cookies.accountinfo.address,

                                    totalpagenumber: archiveobjs.total_pages,
                                    curpage: curPageNumber,
                                    previouspage: previousPage,
                                    nextpage: nextPage,
                                    totalCount: archiveobjs.count,
                                    searchname: '',
                                    name: '', address:'', hospital:'', telephone:'',is_checked:'',
                                });
                            } else {
                                res.render('prj001', {
                                    title: '流调项目-排卵障碍性异常子宫出血',
                                    is_admin:archiveobjs.is_admin,
                                    archives: archiveobjs.results,
                                    //账户信息
                                    account_email:req.cookies.accountinfo.email,
                                    account_phone:req.cookies.accountinfo.phone,
                                    username:req.cookies.accountinfo.user_name,
                                    account_sex:req.cookies.accountinfo.sex,
                                    account_area:req.cookies.accountinfo.area,
                                    account_hospital:req.cookies.accountinfo.hospital,
                                    account_address:req.cookies.accountinfo.address,

                                    totalpagenumber: archiveobjs.total_pages,
                                    curpage: curPageNumber,
                                    previouspage: previousPage,
                                    nextpage: nextPage,
                                    totalCount: archiveobjs.count,
                                    searchname: params["keyword"],
                                    name: params["name"], address:params["address"], hospital:params["hospital"], telephone:params["telephone"],is_checked:'params["is_checked"]',
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
    res.render('datainput',{
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
                //res.render('datainput',{username: req.cookies.accountinfo.user_name});
            } else {
                res.json({status:0, msg:"请检查信息是否完整"});
                console.log('response.statusCode wrong');
            }
        })
        }
})
router.post('/file_upload', mutipartMiddeware, function (req, res, next) {
    console.log(req.files);
    //xlsFileTrans 是前端的form里面input的名称
    // if (req.files.xlsFileTrans.originalFilename == "") {
    //     res.send('请选择文件!');
    // }
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
        console.log("1上传文件: response.statusCode:", response.statusCode);
        if (!err && response.statusCode == 200) {
            console.log('2Upload successful!  Server responded with:', body);
            //给浏览器返回一个成功提示。
            var upload_info = JSON.parse(body);
            console.log("3>>>上传信息 -> upload_info: ", upload_info);
            // alert("haha",response.statusCode);
            console.log("4haha",response.statusCode);
            
            if (upload_info.code == 403) {
                res.json(upload_info);//权限问题
            }  else {
                res.redirect("/prj001");//上传成功
            }
        }
        else {
            var upload_info = JSON.parse(body);
            console.log("5response.statusCode",response.statusCode);
            if (upload_info.ivfile==undefined) {
                console.log("6upload_info",upload_info);
                res.send(upload_info.msg);
            } else {
                console.log("7upload_info",upload_info);
                res.send(upload_info.ivfile[0]);
            }
            // return console.log('8upload failed:', upload_info);
        }
    });

});

/*     数据分析        */
router.get('/dataana', function (req, res, next) {
    console.log(">>>Visting dataana page!");
    res.render('dataana',{
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
/*     关于        */
router.get('/about', function (req, res, next) {
    console.log(">>>Visting about page!");
    res.render('about',{
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
                var user_info = JSON.parse(body);
                console.log(">>>prj001.js -> user_geninfo: ", user_info);
                res.json(user_info);
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
                var user_summary = JSON.parse(body);
                console.log(">>>prj001.js put method response.statusCode: ", response.statusCode);
                if (!error && response.statusCode == 200) {
                    // var user_summary = JSON.parse(body);
                    console.log(">>>prj001.js put方法-> body: ", user_summary);
                    res.json({user_summary:user_summary, status: 200});
                } else {
                    if (response.statusCode == 403) {
                        // var user_summary = JSON.parse(body);
                        console.log(">>>prj001.js put方法-> body: ", user_summary);
                        res.json({user_summary:user_summary, status: 403});
                    }
                    //console.log(">>>Getting archives met unknown error. " + error.error_description);
                    else {
                        console.log(">>>其它错误码的body: ", user_summary);
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
                        res.json({user_history:user_history});
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

/* 审核 */
router.post('/check', function (req, res, next){
    if (req.cookies.prj001token) {
        // console.log("看这里",JSON.parse(req.body));
        var id = req.body.id;
        var page = req.body.page;
        var check = req.body.check;
        var reason = req.body.reason;
        // var id = req.params.id; //router.get('/patientInfo/:id'...
        console.log("显示id+check"+id+check);
        var check_url = myconst.apiurl + "prj001/info/" + id +'/checked/';

        var authstring = req.cookies.prj001token.access_token;
        var options = {
            url: check_url,
            form:{is_checked:check,id:id,reasons_for_not_passing:reason},
            headers: {
                'Authorization': 'Bearer ' + authstring
            }
        };
        console.log("原因",options);
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
                    // res.redirect("/prj001/?page="+page);
                }
                //console.log(">>>Getting archives met unknown error. " + error.error_description);
                else {
                    console.log(">>>其它错误码的body: ", user_geninfo);
                    res.json({user_geninfo: user_geninfo, status:1400});
                    // res.redirect("/prj001/?page="+page);
                }
            }
        });
    } else {
        res.redirect("/");
    }
});
/* 搜索 导出 */
router.get('/info/search/', function (req, res, next) {
    console.log("表单", req.body, typeof(req.body));
    var authstring = req.cookies.prj001token.access_token;

    /*  解析url搜索关键词  */
    console.log(">>>1. req url: " + req.url);
    // console.log(">>>1. req.query.name: " + req.query.name);//GET方法获取参数
    // console.log(">>>1. req.query.name: " + req.body.name);//POST方法获取参数
    var params = url_pack.parse(req.url, true).query;
    console.log(">>>2. req url params: ", params);
    var search_url = "";
    if ( (params["page"] == undefined) || (params["page"] == "") ) {
        search_url = myconst.apiurl + "prj001/info/search/";
    } else {
        search_url = myconst.apiurl + "prj001/info/search/?page=" + params["page"];
    }

    var formdata = {name:params["name"],address:params["address"],
                    telephone:params["telephone"],hospital:params["hospital"],
                    is_checked:params["is_checked"],types:params["types"]};
    var options = {
        url: encodeURI(search_url),
        form: formdata,//req.body.data,//formdata
        headers: {
            'Authorization': 'Bearer ' + authstring
        }
    };
    console.log("search options:", options);
    /* 直接搜索 */
    if ( params["types"]=='search' ) {
        request.post(options, function (error, response, body) {
            console.log("response:", body);
            console.log("response:", typeof(body));
            console.log("response:", body=="[]");
            if (body != "[]") {    
                if (!error && response.statusCode == 200) {
                var archiveobjs = JSON.parse(body);
            
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
                res.render('prj001', {
                    title: '流调项目-排卵障碍性异常子宫出血',
                    is_admin:archiveobjs.is_admin,
                    archives: archiveobjs.results,
                    //账户信息
                    account_email:req.cookies.accountinfo.email,
                    account_phone:req.cookies.accountinfo.phone,
                    username:req.cookies.accountinfo.user_name,
                    account_sex:req.cookies.accountinfo.sex,
                    account_area:req.cookies.accountinfo.area,
                    account_hospital:req.cookies.accountinfo.hospital,
                    account_address:req.cookies.accountinfo.address,

                    totalpagenumber: archiveobjs.total_pages,
                    curpage: curPageNumber,
                    previouspage: previousPage,
                    nextpage: nextPage,
                    totalCount: archiveobjs.count,
                    name: params["name"], address:params["address"], 
                    hospital:params["hospital"], telephone:params["telephone"],is_checked:params["is_checked"],
                    code: archiveobjs.code
                });
                } else {
                    res.json({status:0, msg:""});
                }
            } else {
                res.render('prj001', {
                title: '流调项目-排卵障碍性异常子宫出血',
                is_admin:false,
                archives: [],
                //账户信息
                account_email:req.cookies.accountinfo.email,
                account_phone:req.cookies.accountinfo.phone,
                username:req.cookies.accountinfo.user_name,
                account_sex:req.cookies.accountinfo.sex,
                account_area:req.cookies.accountinfo.area,
                account_hospital:req.cookies.accountinfo.hospital,
                account_address:req.cookies.accountinfo.address,
                
                totalpagenumber: 0,
                curpage: 1,
                previouspage: null,
                nextpage: null,
                totalCount: 0,
                name: '', address:'', hospital:'', telephone:'',is_checked:'',
                code: null
                });
            }
        })
    
    } 
    /* 导出搜索结果 */
    else {
        request.post(options, function (error, response, body) {
            console.log("response:", body);
            console.log("response:", typeof(body));
            console.log("response:", body=="[]");
            var fileout_body = JSON.parse(body);
            if (body != "[]") {
                console.log("",fileout_body.path);
                res.json({status:1, msg:"ok", data:fileout_body.path});
            } else {
                res.json({status:0, msg:"no"});
            }
        })
    }

});

module.exports = router;
