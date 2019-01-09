//一般情况
//显示
router.post('/info', function (req, res, next){
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
            var user_geninfo = JSON.parse(body);
            console.log(">>>prj001.js -> user_geninfo: ", user_geninfo);
            res.json(user_geninfo);
        } else {
            //console.log(">>>Getting archives met unknown error. " + error.error_description);
            res.redirect("/prj001");
        }
    });
});
//修改
router.put('/info_save', function (req, res, next){
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

});


//患者病史
router.post('/history', function (req, res, next){

});

//相关检查
router.post('/relevant', function (req, res, next){

});


//临床诊断
router.post('/cc', function (req, res, next){

});

//中西治疗
router.post('/cure', function (req, res, next){

});

//疗效情况
router.post('/results', function (req, res, next){

});
