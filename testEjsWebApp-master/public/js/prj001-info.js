    $(document).ready(function () {
        // alert(window.length);
        var set_input = document.getElementsByTagName('input');
		for(var i=0;i<set_input.length;i++){
			set_input[i].focus();
        }

        //基本信息
        $(".geninfoBtn").click(function () {
            $.ajax({
                url: "/prj001/geninfo_save",
                type: "PUT",
                dataType: "json",
                data: {
                    geninfo_url: $(this).attr("geninfoBtn-url"),
                    form_geninfo: $('#form-geninfo').serialize(),
                },
                success:function (result) {
                    
                    //403,用户除了自己,对于其它用户只有查看权限,不能修改
                    if (result.status == 200 || result.status == 201) {
                        alert("保存成功！")
                        window.location.href = '/prj001' + '/?page=' + curpage_global;
                    } else {
                        if (result.status == 403) {
                            // alert("您无法修改此条信息, 请联系用户 " + result.user_geninfo.name)
                            alert("" + result.user_geninfo.detail);
                        } else {
                            if (result.status == 1400){
                                alert("您有未填字段");
                            }
                        }
                    }
                },
                error: function (result) {
                        alert("保存失败" + result.status)
                },
            })
        });
        $(".geninfo").click(function () {
            document.getElementById("form-geninfo").reset();
            //判断是否审核状态,未审核false则disable掉geninfoBtn
            if ($(this).attr("checked-info") == "no") {
                $(".geninfoBtn").attr("disabled", true);
            } else {
                $(".geninfoBtn").removeAttr("disabled");
            }
            $.ajax({
                url: "/prj001/geninfo",
                type: "POST",
                data: {geninfo_url: $(this).attr("geninfo-url")},
                success: function(result){
                    if (result !== null) {
                        $('#geninfoBtn').attr("geninfoBtn-url", result["url"]);
                        //填空
                        $('#serial').val(result["serial"]);
                        $('#name').val(result["name"]);
                        $('#recdate').val(result["recdate"]);
                        $('#hospital').val(result["hospital"]);
                        $('#telephone').val(result["telephone"]);
                        $('#expert').val(result["expert"]);
                        
                        $('#age').val(result["age"]);
                        $('#height').val(result["height"]);
                        
                        $('#weight').val(result["weight"]);
                        $('#waistline').val(result["waistline"]);
                        $('#hipline').val(result["hipline"]);
                        
                        $('#address').val(result["address"]);
                        
                        //单选
                        $("input[name='title'][value='"+result["title"]+"']").prop("checked",true);
                        $("input[name='blood_type'][value='"+result["blood_type"]+"']").prop("checked",true);
                        $("input[name='nation'][value='"+result["nation"]+"']").prop("checked",true);
                        $("input[name='career'][value='"+result["career"]+"']").prop("checked",true);
                        
                        $("input[name='entrance'][value='"+result["entrance"]+"']").prop("checked",true);
                        $("input[name='culture'][value='"+result["culture"]+"']").prop("checked",true);
                        $("input[name='marriage'][value='"+result["marriage"]+"']").prop("checked",true);
                        
                        //多选
                        $("input:checkbox[name='wuteshu']").prop('checked',result["wuteshu"]);
                        $("input:checkbox[name='sushi']").prop('checked',result["sushi"]);
                        $("input:checkbox[name='suan']").prop('checked',result["suan"]);
                        $("input:checkbox[name='tian']").prop('checked',result["tian"]);
                        $("input:checkbox[name='xian']").prop('checked',result["xian"]);
                        $("input:checkbox[name='xinla']").prop('checked',result["xinla"]);
                        $("input:checkbox[name='you']").prop('checked',result["you"]);
                        $("input:checkbox[name='shengleng']").prop('checked',result["shengleng"]);
                        $("input:checkbox[name='kafei']").prop('checked',result["kafei"]);
                        $("input:checkbox[name='qita']").prop('checked',result["qita"]);
                        
                        $("input:checkbox[name='gaowen']").prop('checked',result["gaowen"]);
                        $("input:checkbox[name='diwen']").prop('checked',result["diwen"]);
                        $("input:checkbox[name='yeban']").prop('checked',result["yeban"]);
                        $("input:checkbox[name='zaosheng']").prop('checked',result["zaosheng"]);
                        $("input:checkbox[name='fushe']").prop('checked',result["fushe"]);
                        $("input:checkbox[name='huagongyinran']").prop('checked',result["huagongyinran"]);
                        $("input:checkbox[name='julieyundong']").prop('checked',result["julieyundong"]);
                        $("input:checkbox[name='qiyou']").prop('checked',result["qiyou"]);
                        $("input:checkbox[name='gaokong']").prop('checked',result["gaokong"]);
                        $("input:checkbox[name='wu']").prop('checked',result["wu"]);
                    } else {
                        alert("result.status wrong");
                    }
                },
                error: function () {
                    alert("请求失败！");
                    window.location.href = '/prj001';
                }
            });
        });
        //病情概要
        //<input type="hidden" class="person" name="person" id="person-summary"/>
        $(".summaryBtn").click(function () {
            var temp_geninfourl = $('#person-summary').val();
            $('#person-summary').val(temp_geninfourl);//如果url不为空，api服务器返回的数据有person字段
            $.ajax({
                url: "/prj001/summary_save",
                type: "PUT",
                dataType: "json",
                data: {
                    summary_url: $(this).attr("summaryBtn-url"),
                    form_summary: $('#form-summary').serialize(),
                    // form_summary: $('#form-summary').ghostsf_serialize()
                },
                success:function (result) {
                    //403,用户除了自己,对于其它用户只有查看权限,不能修改
                    if (result.status == 200 || result.status == 201) {
                        alert("保存成功！")
                        window.location.href = '/prj001' + '/?page=' + curpage_global;
                    } else {
                        if (result.status == 403) {
                            alert("" + result.user_summary.detail)
                        } else {
                            alert("保存失败" + result.status)
                        }
                    }
                },
                error: function () {
                    alert("保存失败")
                },
            })

        });
        $(".summary").click(function () {
            document.getElementById("form-summary").reset();

            //判断是否审核状态,未审核false则disable掉geninfoBtn
            if ($(this).attr("checked-info") == "no") {
                $(".summaryBtn").attr("disabled", true);
            } else {
                $(".summaryBtn").removeAttr("disabled");
            }

            var tempFlag = $(this).attr("summary-url");
            var temp_geninfourl = $(this).attr("geninfo-url");
            if (tempFlag == "") {
                alert("准备创建病情概要");
                $('#person-summary').val(temp_geninfourl);//如果url不为空，api服务器返回的数据有person字段
            } else {
                $.ajax({
                    url: "/prj001/summary",//路由，用来处理ajax请求的函数的所在地址
                    method: "POST",
                    data: {summary_url: $(this).attr("summary-url")},
                    success: function(result){
                        $('#person-summary').val(result["person"]);
                        if (result !== null) {
                            var set_input = document.getElementsByTagName('input');
                            for(var i=0;i<set_input.length;i++){
                                set_input[i].focus();
                            }
                            $('#summaryBtn').attr("summaryBtn-url", result["url"]); 

                            $('#owner_buguize').val(result["owner_buguize"]);
                            $('#owner_suoduan').val(result["owner_suoduan"]);
                            $('#owner_yanchang').val(result["owner_yanchang"]);
                            $('#owner_liangduo').val(result["owner_liangduo"]);
                            $('#owner_pailuan').val(result["owner_pailuan"]);
                            $('#owner_qita').val(result["owner_qita"]);
                            /* 出血量 */
                            $("input[name='blood_cond'][value='"+result["blood_cond"]+"']").prop("checked",true);
                            /* 出血颜色 */
                            $("input[name='blood_color'][value='"+result["blood_color"]+"']").prop("checked",true);
                            /* 出血质地 */
                            $("input[name='blood_quality'][value='"+result["blood_quality"]+"']").prop("checked",true);
                            /* 出血特点 */
                            $("input[name='blood_character'][value='"+result["blood_character"]+"']").prop("checked",true);

                            /* 精神情绪 */
                            $("input:checkbox[name='spirit_jinglichongpei']").prop('checked',result["spirit_jinglichongpei"]);	
                            $("input:checkbox[name='spirit_shenpifali']").prop('checked',result["spirit_shenpifali"]);	
                            $("input:checkbox[name='spirit_jianwang']").prop('checked',result["spirit_jianwang"]);	
                            $("input:checkbox[name='spirit_yalida']").prop('checked',result["spirit_yalida"]);	
                            $("input:checkbox[name='spirit_jiaolv']").prop('checked',result["spirit_jiaolv"]);	
                            $("input:checkbox[name='spirit_yiyu']").prop('checked',result["spirit_yiyu"]);
                            $("input:checkbox[name='spirit_xinu']").prop('checked',result["spirit_xinu"]);	
                            $("input:checkbox[name='spirit_yinu']").prop('checked',result["spirit_yinu"]);	
                            $("input:checkbox[name='spirit_beishangyuku']").prop('checked',result["spirit_beishangyuku"]);	
                            $("input:checkbox[name='spirit_qita']").prop('checked',result["spirit_qita"]);	

                            /* 寒热及汗出 */
                            $("input:checkbox[name='sweat_zhengchang']").prop('checked',result["sweat_zhengchang"]);	
                            $("input:checkbox[name='sweat_weihan']").prop('checked',result["sweat_weihan"]);	
                            $("input:checkbox[name='sweat_weire']").prop('checked',result["sweat_weire"]);	
                            $("input:checkbox[name='sweat_wuxin']").prop('checked',result["sweat_wuxin"]);	
                            $("input:checkbox[name='sweat_chaore']").prop('checked',result["sweat_chaore"]);	
                            $("input:checkbox[name='sweat_dire']").prop('checked',result["sweat_dire"]);	
                            $("input:checkbox[name='sweat_dongze']").prop('checked',result["sweat_dongze"]);
                            $("input:checkbox[name='sweat_yewo']").prop('checked',result["sweat_yewo"]);
                            $("input:checkbox[name='sweat_hongre']").prop('checked',result["sweat_hongre"]);
                            $("input:checkbox[name='sweat_qita']").prop('checked',result["sweat_qita"]);

                            /* 面色 */
                            $("input:checkbox[name='face_zhengchang']").prop('checked',result["face_zhengchang"]);	
                            $("input:checkbox[name='face_danbaiwuhua']").prop('checked',result["face_danbaiwuhua"]);	
                            $("input:checkbox[name='face_cangbai']").prop('checked',result["face_cangbai"]);	
                            $("input:checkbox[name='face_qingbai']").prop('checked',result["face_qingbai"]);	
                            $("input:checkbox[name='face_baierfuzhong']").prop('checked',result["face_baierfuzhong"]);	
                            $("input:checkbox[name='face_weihuang']").prop('checked',result["face_weihuang"]);	
                            $("input:checkbox[name='face_huangzhong']").prop('checked',result["face_huangzhong"]);	
                            $("input:checkbox[name='face_chaohong']").prop('checked',result["face_chaohong"]);	
                            $("input:checkbox[name='face_huian']").prop('checked',result["face_huian"]);	
                            $("input:checkbox[name='face_mianmulihei']").prop('checked',result["face_mianmulihei"]);	
                            $("input:checkbox[name='face_qita']").prop('checked',result["face_qita"]);

                            /* 头面部 */
                            $("input:checkbox[name='head_zhengchang']").prop('checked',result["head_zhengchang"]);	
                            $("input:checkbox[name='head_touyun']").prop('checked',result["head_touyun"]);	
                            $("input:checkbox[name='head_toutong']").prop('checked',result["head_toutong"]);	
                            $("input:checkbox[name='head_touchenzhong']").prop('checked',result["head_touchenzhong"]);
                            $("input:checkbox[name='eyes_muxuan']").prop('checked',result["eyes_muxuan"]);	
                            $("input:checkbox[name='eyes_muse']").prop('checked',result["eyes_muse"]);	
                            $("input:checkbox[name='eyes_yanhua']").prop('checked',result["eyes_yanhua"]);		
                            $("input:checkbox[name='eyes_muyang']").prop('checked',result["eyes_muyang"]);
                            $("input:checkbox[name='eyes_chenqifz']").prop('checked',result["eyes_chenqifz"]);		
                            $("input:checkbox[name='ear_erming']").prop('checked',result["ear_erming"]);	
                            $("input:checkbox[name='ear_erlong']").prop('checked',result["ear_erlong"]);	
                            $("input:checkbox[name='ear_chongfu']").prop('checked',result["ear_chongfu"]);
                            $("input:checkbox[name='ear_xiajiang']").prop('checked',result["ear_xiajiang"]);
                            $("input:checkbox[name='e_qita']").prop('checked',result["e_qita"]);

                            /* 口咽部 */
                            $("input:checkbox[name='throat_yantong']").prop('checked',result["throat_yantong"]);	
                            $("input:checkbox[name='throat_yanyang']").prop('checked',result["throat_yanyang"]);	
                            $("input:checkbox[name='throat_yiwugan']").prop('checked',result["throat_yiwugan"]);
                            $("input:checkbox[name='breath_wuyiwei']").prop('checked',result["breath_wuyiwei"]);	
                            $("input:checkbox[name='breath_kouku']").prop('checked',result["breath_kouku"]);	
                            $("input:checkbox[name='breath_kougan']").prop('checked',result["breath_kougan"]);	
                            $("input:checkbox[name='breath_kounian']").prop('checked',result["breath_kounian"]);	
                            $("input:checkbox[name='breath_buyuyan']").prop('checked',result["breath_buyuyan"]);	
                            $("input:checkbox[name='breath_qita']").prop('checked',result["breath_qita"])

                            /* 胸胁及语音 */
                            $("input:checkbox[name='sound_zhengchang']").prop('checked',result["sound_zhengchang"]);
                            $("input:checkbox[name='sound_xinhuang']").prop('checked',result["sound_xinhuang"]);
                            $("input:checkbox[name='sound_qiduan']").prop('checked',result["sound_qiduan"]);
                            $("input:checkbox[name='breast_zhangmen']").prop('checked',result["breast_zhangmen"]);
                            $("input:checkbox[name='breast_citong']").prop('checked',result["breast_citong"]);
                            $("input:checkbox[name='breast_yintong']").prop('checked',result["breast_yintong"]);
                            $("input:checkbox[name='breast_biezhang']").prop('checked',result["breast_biezhang"]);
                            $("input:checkbox[name='bre_citong']").prop('checked',result["bre_citong"]);
                            $("input:checkbox[name='bre_zhangtong']").prop('checked',result["bre_zhangtong"]);
                            $("input:checkbox[name='sound_xitanxi']").prop('checked',result["sound_xitanxi"]);
                            $("input:checkbox[name='sound_shaoqi']").prop('checked',result["sound_shaoqi"]);
                            $("input:checkbox[name='s_qita']").prop('checked',result["s_qita"]);

                            /* 腹腰 */
                            $("input:checkbox[name='stomach_zhengchang']").prop('checked',result["stomach_zhengchang"]);
                            $("input:checkbox[name='stomach_zhangtongjuan']").prop('checked',result["stomach_zhangtongjuan"]);
                            $("input:checkbox[name='stomach_yintongxian']").prop('checked',result["stomach_yintongxian"]);
                            $("input:checkbox[name='stomach_xiaofuzhuizhang']").prop('checked',result["stomach_xiaofuzhuizhang"]);
                            $("input:checkbox[name='stomach_xiaofubiezhang']").prop('checked',result["stomach_xiaofubiezhang"]);
                            $("input:checkbox[name='stomach_zhuotong']").prop('checked',result["stomach_zhuotong"]);
                            $("input:checkbox[name='stomach_xiaofulengtong']").prop('checked',result["stomach_xiaofulengtong"]);
                            $("input:checkbox[name='stomach_xiaofucitong']").prop('checked',result["stomach_xiaofucitong"]);$("input:checkbox[name='sound_zhengchang']").prop('checked',result["sound_zhengchang"]);
                            $("input:checkbox[name='stomach_yaosuan']").prop('checked',result["stomach_yaosuan"]);
                            $("input:checkbox[name='stomach_yaoleng']").prop('checked',result["stomach_yaoleng"]);
                            $("input:checkbox[name='stomach_qita']").prop('checked',result["stomach_qita"]);

                            /* 四肢 */
                            $("input:checkbox[name='limb_zhengchang']").prop('checked',result["limb_zhengchang"]);
                            $("input:checkbox[name='limb_wuli']").prop('checked',result["limb_wuli"]);
                            $("input:checkbox[name='limb_mamu']").prop('checked',result["limb_mamu"]);
                            $("input:checkbox[name='limb_kunzhong']").prop('checked',result["limb_kunzhong"]);
                            $("input:checkbox[name='limb_zhileng']").prop('checked',result["limb_zhileng"]);
                            $("input:checkbox[name='limb_fuzhong']").prop('checked',result["limb_fuzhong"]);$("input:checkbox[name='sound_zhengchang']").prop('checked',result["sound_zhengchang"]);
                            $("input:checkbox[name='limb_szxinre']").prop('checked',result["limb_szxinre"]);
                            $("input:checkbox[name='limb_qita']").prop('checked',result["limb_qita"]);

                            /* 饮食 */
                            $("input:checkbox[name='diet_zhengchang']").prop('checked',result["diet_zhengchang"]);
                            $("input:checkbox[name='diet_nadaishishao']").prop('checked',result["diet_nadaishishao"]);
                            $("input:checkbox[name='diet_shiyuws']").prop('checked',result["diet_shiyuws"]);
                            $("input:checkbox[name='diet_xireyin']").prop('checked',result["diet_xireyin"]);
                            $("input:checkbox[name='diet_xilengyin']").prop('checked',result["diet_xilengyin"]);
                            $("input:checkbox[name='diet_shixinla']").prop('checked',result["diet_shixinla"]);
                            $("input:checkbox[name='diet_bushu']").prop('checked',result["diet_bushu"]);$("input:checkbox[name='sound_zhengchang']").prop('checked',result["sound_zhengchang"]);
                            $("input:checkbox[name='diet_qita']").prop('checked',result["diet_qita"]);

                            /* 睡眠 */
                            $("input:checkbox[name='sleep_zhengchang']").prop('checked',result["sleep_zhengchang"]);
                            $("input:checkbox[name='sleep_duomeng']").prop('checked',result["sleep_duomeng"]);
                            $("input:checkbox[name='sleep_yixing']").prop('checked',result["sleep_yixing"]);
                            $("input:checkbox[name='sleep_nanyirumian']").prop('checked',result["sleep_nanyirumian"]);
                            $("input:checkbox[name='sleep_cheyebumian']").prop('checked',result["sleep_cheyebumian"]);
                            $("input:checkbox[name='sleep_shishui']").prop('checked',result["sleep_shishui"]);
                            $("input:checkbox[name='sleep_qita']").prop('checked',result["sleep_qita"]);

                            /* 性欲 */
                            $("input:checkbox[name='sex_zhengchang']").prop('checked',result["sex_zhengchang"]);$("input:checkbox[name='sound_zhengchang']").prop('checked',result["sound_zhengchang"]);
                            $("input:checkbox[name='sex_xywangsheng']").prop('checked',result["sex_xywangsheng"]);
                            $("input:checkbox[name='sex_xyjiantui']").prop('checked',result["sex_xyjiantui"]);

                            /* 大便 */
                            $("input:checkbox[name='stool_zhengchang']").prop('checked',result["stool_zhengchang"]);
                            $("input:checkbox[name='stool_biangan']").prop('checked',result["stool_biangan"]);
                            $("input:checkbox[name='stool_zhixi']").prop('checked',result["stool_zhixi"]);
                            $("input:checkbox[name='stool_sgsx']").prop('checked',result["stool_sgsx"]);
                            $("input:checkbox[name='stool_xiexie']").prop('checked',result["stool_xiexie"]);
                            $("input:checkbox[name='stool_tlzqxiexie']").prop('checked',result["stool_tlzqxiexie"]);
                            $("input:checkbox[name='stool_zhinian']").prop('checked',result["stool_zhinian"]);$("input:checkbox[name='sound_zhengchang']").prop('checked',result["sound_zhengchang"]);
                            $("input:checkbox[name='stool_weixiaohua']").prop('checked',result["stool_weixiaohua"]);
                            $("input:checkbox[name='stool_qita']").prop('checked',result["stool_qita"]);

                            /* 小便 */
                            $("input:checkbox[name='urine_zhengchang']").prop('checked',result["urine_zhengchang"]);
                            $("input:checkbox[name='urine_duanhuang']").prop('checked',result["urine_duanhuang"]);
                            $("input:checkbox[name='urine_qingchang']").prop('checked',result["urine_qingchang"]);
                            $("input:checkbox[name='urine_xbpinshu']").prop('checked',result["urine_xbpinshu"]);
                            $("input:checkbox[name='urine_niaoji']").prop('checked',result["urine_niaoji"]);
                            $("input:checkbox[name='urine_niaotong']").prop('checked',result["urine_niaotong"]);
                            $("input:checkbox[name='urine_shaoniao']").prop('checked',result["urine_shaoniao"]);$("input:checkbox[name='sound_zhengchang']").prop('checked',result["sound_zhengchang"]);
                            $("input:checkbox[name='urine_yulibujin']").prop('checked',result["urine_yulibujin"]);
                            $("input:checkbox[name='urine_yeniaopin']").prop('checked',result["urine_yeniaopin"]);
                            $("input:checkbox[name='urine_qita']").prop('checked',result["urine_qita"]);

                            /* 舌质 */
                            $("input:checkbox[name='texture_danhong']").prop('checked',result["texture_danhong"]);
                            $("input:checkbox[name='texture_danbai']").prop('checked',result["texture_danbai"]);
                            $("input:checkbox[name='texture_pianhong']").prop('checked',result["texture_pianhong"]);
                            $("input:checkbox[name='texture_shenhong']").prop('checked',result["texture_shenhong"]);
                            $("input:checkbox[name='texture_zihong']").prop('checked',result["texture_zihong"]);
                            $("input:checkbox[name='texture_anhong']").prop('checked',result["texture_anhong"]);$("input:checkbox[name='sound_zhengchang']").prop('checked',result["sound_zhengchang"]);
                            $("input:checkbox[name='texture_danan']").prop('checked',result["texture_danan"]);
                            $("input:checkbox[name='texture_zian']").prop('checked',result["texture_zian"]);
                            $("input:checkbox[name='texture_yudian']").prop('checked',result["texture_yudian"]);
                            $("input:checkbox[name='texture_jianhong']").prop('checked',result["texture_jianhong"]);
                            $("input:checkbox[name='texture_qita']").prop('checked',result["texture_qita"]);

                            /* 舌苔 */
                            $("input:checkbox[name='coating_bai']").prop('checked',result["coating_bai"]);
                            $("input:checkbox[name='coating_huang']").prop('checked',result["coating_huang"]);
                            $("input:checkbox[name='coating_bo']").prop('checked',result["coating_bo"]);
                            $("input:checkbox[name='coating_hou']").prop('checked',result["coating_hou"]);
                            $("input:checkbox[name='coating_ni']").prop('checked',result["coating_ni"]);
                            $("input:checkbox[name='coating_run']").prop('checked',result["coating_run"]);
                            $("input:checkbox[name='coating_hua']").prop('checked',result["coating_hua"]);
                            $("input:checkbox[name='coating_gan']").prop('checked',result["coating_gan"]);
                            $("input:checkbox[name='coating_shaotai']").prop('checked',result["coating_shaotai"]);
                            $("input:checkbox[name='coating_huabo']").prop('checked',result["coating_huabo"]);
                            $("input:checkbox[name='coating_wutai']").prop('checked',result["coating_wutai"]);
                            $("input:checkbox[name='coating_qita']").prop('checked',result["coating_qita"]);

                            /* 舌体 */
                            $("input:checkbox[name='tongue_zhengchang']").prop('checked',result["tongue_zhengchang"]);
                            $("input:checkbox[name='tongue_shouxiao']").prop('checked',result["tongue_shouxiao"]);
                            $("input:checkbox[name='tongue_pangda']").prop('checked',result["tongue_pangda"]);
                            $("input:checkbox[name='tongue_youchihen']").prop('checked',result["tongue_youchihen"]);
                            $("input:checkbox[name='tongue_zhongyouliewen']").prop('checked',result["tongue_zhongyouliewen"]);
                            $("input:checkbox[name='tongue_qita']").prop('checked',result["tongue_qita"]);

                            /* 脉象 */
                            $("input:checkbox[name='pulse_fu']").prop('checked',result["pulse_fu"]);
                            $("input:checkbox[name='pulse_chen']").prop('checked',result["pulse_chen"]);
                            $("input:checkbox[name='pulse_hua']").prop('checked',result["pulse_hua"]);
                            $("input:checkbox[name='pulse_shu']").prop('checked',result["pulse_shu"]);
                            $("input:checkbox[name='pulse_xian']").prop('checked',result["pulse_xian"]);
                            $("input:checkbox[name='pulse_xi']").prop('checked',result["pulse_xi"]);
                            $("input:checkbox[name='pulse_ruo']").prop('checked',result["pulse_ruo"]);
                            $("input:checkbox[name='pulse_huan']").prop('checked',result["pulse_huan"]);
                            $("input:checkbox[name='pulse_chi']").prop('checked',result["pulse_chi"]);
                            $("input:checkbox[name='pulse_se']").prop('checked',result["pulse_se"]);
                            $("input:checkbox[name='pulse_jin']").prop('checked',result["pulse_jin"]);
                            $("input:checkbox[name='pulse_qita']").prop('checked',result["pulse_qita"]);
                        }else {
                            alert("result.status wrong");
                        }
                    },
                    error: function () {
                        alert("请求失败！");
                        window.location.href = '/prj001';
                    }
                });
            };
        })
        //患者病史
        //<input type="hidden" class="person" name="person" id="person-history"/>
        $(".historyBtn").click(function () {
            var temp_geninfourl = $('#person-history').val();
            $('#person-history').val(temp_geninfourl);//如果url不为空，api服务器返回的数据有person字段
            $.ajax({
                url: "/prj001/history_save",
                type: "PUT",
                dataType: "json",
                data: {
                    history_url: $(this).attr("historyBtn-url"),
                    form_history: $('#form-history').serialize(),
                    // form_history: $('#form-history').ghostsf_serialize()
                },
                success:function (result) {
                    //403,用户除了自己,对于其它用户只有查看权限,不能修改
                    if (result.status == 200 || result.status == 201) {
                        alert("保存成功！")
                        window.location.href = '/prj001' + '/?page=' + curpage_global;
                    } else {
                        if (result.status == 403) {
                            alert("" + result.user_history.detail)
                        } else {
                            alert("保存失败" + result.status)
                        }
                    }
                },
                error: function () {
                    alert("保存失败")
                },
            })

        });
        $(".history").click(function () {
            document.getElementById("form-history").reset();

            //判断是否审核状态,未审核false则disable掉geninfoBtn
            if ($(this).attr("checked-info") == "no") {
                $(".historyBtn").attr("disabled", true);
            } else {
                $(".historyBtn").removeAttr("disabled");
            }

            var tempFlag = $(this).attr("history-url");
            var temp_geninfourl = $(this).attr("geninfo-url");
            if (tempFlag == "") {
                alert("准备创建患者病史");
                $('#person-history').val(temp_geninfourl);//如果url不为空，api服务器返回的数据有person字段
            } else {
                $.ajax({
                    url: "/prj001/history",//路由，用来处理ajax请求的函数的所在地址
                    method: "POST",
                    data: {history_url: $(this).attr("history-url")},
                    success: function(result){
                        $('#person-history').val(result["person"]);
                        if (result !== null) {
                            var set_input = document.getElementsByTagName('input');
                            for(var i=0;i<set_input.length;i++){
                                set_input[i].focus();
                            }
                            $('#historyBtn').attr("historyBtn-url", result["url"]);
                                
                            /* 出血量 */
                            $("input[name='blood_cond'][value='"+result["blood_cond"]+"']").prop("checked",true);
                            /* 出血颜色 */
                            $("input[name='blood_color'][value='"+result["blood_color"]+"']").prop("checked",true);
                            /* 出血质地 */
                            $("input[name='blood_quality'][value='"+result["blood_quality"]+"']").prop("checked",true);
                            /* 出血特点 */
                            $("input[name='blood_character'][value='"+result["blood_character"]+"']").prop("checked",true);
                            $("input[name='first_time'][value='"+result["first_time"]+"']").prop("checked",true);
                            $("input[name='normal'][value='"+result["normal"]+"']").prop("checked",true);
                            $("input[name='abnormal'][value='"+result["abnormal"]+"']").prop("checked",true);
                            $("input[name='cyclicity_sum'][value='"+result["cyclicity_sum"]+"']").prop("checked",true);
                            
                            $("input[name='menstruation_is_accompany'][value='"+result["menstruation_is_accompany"]+"']").prop("checked",true);
                            
                            $("input[name='spirit_shenpi'][value='"+result["spirit_shenpi"]+"']").prop("checked",true);
                            $("input[name='spirit_qiduan'][value='"+result["spirit_qiduan"]+"']").prop("checked",true);
                            $("input[name='spirit_yiyu'][value='"+result["spirit_yiyu"]+"']").prop("checked",true);
                            $("input[name='spirit_tanxi'][value='"+result["spirit_tanxi"]+"']").prop("checked",true);
                            $("input[name='spirit_yinu'][value='"+result["spirit_yinu"]+"']").prop("checked",true);
                            $('#spirit_qita').val(result["spirit_qita"]);
                            
                            $("input:checkbox[name='body_fat']").prop('checked',result["body_fat"]);
                            $("input:checkbox[name='body_thin']").prop('checked',result["body_thin"]);
                            $("input:checkbox[name='body_skin']").prop('checked',result["body_skin"]);
                            $("input:checkbox[name='body_cold']").prop('checked',result["body_cold"]);
                            $("input:checkbox[name='body_hot']").prop('checked',result["body_hot"]);
                            $("input:checkbox[name='body_leg']").prop('checked',result["body_leg"]);
                            $("input:checkbox[name='body_waist']").prop('checked',result["body_waist"]);
                            $('#body_qita').val(result["body_qita"]);
                            
                            $("input:checkbox[name='face_head_cangbai']").prop("checked",result["face_head_cangbai"]);
                            $("input:checkbox[name='face_head_huangbai']").prop("checked",result["face_head_huangbai"]);
                            $("input:checkbox[name='face_head_weihuang']").prop("checked",result["face_head_weihuang"]);
                            $("input:checkbox[name='face_head_huian']").prop("checked",result["face_head_huian"]);
                            $("input:checkbox[name='face_head_anban']").prop("checked",result["face_head_anban"]);
                            $("input:checkbox[name='face_head_zhizhong']").prop("checked",result["face_head_zhizhong"]);
                            $("input:checkbox[name='face_head_chunhong']").prop("checked",result["face_head_chunhong"]);
                            $("input:checkbox[name='face_head_kouku']").prop("checked",result["face_head_kouku"]);
                            $("input:checkbox[name='face_head_erming']").prop("checked",result["face_head_erming"]);
                            $("input:checkbox[name='face_head_yanghua']").prop("checked",result["face_head_yanghua"]);
                            $('#face_head_qita').val(result["face_head_qita"]);
                            
                            $("input[name='belly_fanmen'][value='"+result["belly_fanmen"]+"']").prop("checked",true);
                            $("input[name='belly_rufangzhangtong'][value='"+result["belly_rufangzhangtong"]+"']").prop("checked",true);
                            $("input[name='belly_xiongxiezhangtong'][value='"+result["belly_xiongxiezhangtong"]+"']").prop("checked",true);
                            $("input[name='belly_shaofuzhangtong'][value='"+result["belly_shaofuzhangtong"]+"']").prop("checked",true);
                            $("input[name='belly_kongzhui'][value='"+result["belly_kongzhui"]+"']").prop("checked",true);
                            $("input[name='belly_kongtong'][value='"+result["belly_kongtong"]+"']").prop("checked",true);
                            $("input[name='belly_citong'][value='"+result["belly_citong"]+"']").prop("checked",true);
                            $("input[name='belly_zhangtong'][value='"+result["belly_zhangtong"]+"']").prop("checked",true);
                            $("input[name='belly_lengtong'][value='"+result["belly_lengtong"]+"']").prop("checked",true);
                            $("input[name='belly_yintong'][value='"+result["belly_yintong"]+"']").prop("checked",true);
                            $("input[name='belly_juan'][value='"+result["belly_juan"]+"']").prop("checked",true);
                            $("input[name='belly_xian'][value='"+result["belly_xian"]+"']").prop("checked",true);
                            $("input[name='belly_deretongjian'][value='"+result["belly_deretongjian"]+"']").prop("checked",true);
                            $("input[name='belly_tongjian'][value='"+result["belly_tongjian"]+"']").prop("checked",true);
                            $('#belly_qita').val(result["belly_qita"]);
                            
                            $("input[name='diet_exin'][value='"+result["diet_exin"]+"']").prop("checked",true);
                            $("input[name='diet_shishao'][value='"+result["diet_shishao"]+"']").prop("checked",true);
                            $("input[name='diet_zhangman'][value='"+result["diet_zhangman"]+"']").prop("checked",true);
                            $("input[name='diet_bujia'][value='"+result["diet_bujia"]+"']").prop("checked",true);
                            $("input[name='diet_lengyin'][value='"+result["diet_lengyin"]+"']").prop("checked",true);
                            $("input[name='diet_kouzao'][value='"+result["diet_kouzao"]+"']").prop("checked",true);
                            $("input[name='diet_qita'][value='"+result["diet_qita"]+"']").prop("checked",true);
                            $("input[name='sleep_shimian'][value='"+result["sleep_shimian"]+"']").prop("checked",true);
                            $("input[name='sleep_buning'][value='"+result["sleep_buning"]+"']").prop("checked",true);
                            $("input[name='sleep_mengduo'][value='"+result["sleep_mengduo"]+"']").prop("checked",true);
                            $('#sleep_qita').val(result["sleep_qita"]);
                            
                            $("input:checkbox[name='erbian_zaojie']").prop('checked',result["erbian_zaojie"]);
                            $("input:checkbox[name='erbian_tangbo']").prop('checked',result["erbian_tangbo"]);
                            $("input:checkbox[name='erbian_pinshu']").prop('checked',result["erbian_pinshu"]);
                            $("input:checkbox[name='erbian_duanchi']").prop('checked',result["erbian_duanchi"]);
                            $("input:checkbox[name='erbian_qingchang']").prop('checked',result["erbian_qingchang"]);
                            $('#erbian_qita').val(result["erbian_qita"]);
                            
                            $("input[name='jingqi_yundong'][value='"+result["jingqi_yundong"]+"']").prop("checked",true);
                            $("input[name='jingqi_ganmao'][value='"+result["jingqi_ganmao"]+"']").prop("checked",true);
                            $("input[name='jingqi_tongfang'][value='"+result["jingqi_tongfang"]+"']").prop("checked",true);
                            $("input[name='jingqi_zhaoliang'][value='"+result["jingqi_zhaoliang"]+"']").prop("checked",true);
                            
                            $('#last_time').val(result["last_time"]);
                            
                            $("input:checkbox[name='leucorrhea_liangke']").prop('checked',result["leucorrhea_liangke"]);
                            $("input:checkbox[name='leucorrhea_liangshao']").prop('checked',result["leucorrhea_liangshao"]);
                            $("input:checkbox[name='leucorrhea_liangduo']").prop('checked',result["leucorrhea_liangduo"]);
                            $("input:checkbox[name='leucorrhea_touming']").prop('checked',result["leucorrhea_touming"]);
                            $("input:checkbox[name='leucorrhea_sehuang']").prop('checked',result["leucorrhea_sehuang"]);
                            $("input:checkbox[name='leucorrhea_sebai']").prop('checked',result["leucorrhea_sebai"]);
                            $("input:checkbox[name='leucorrhea_seqing']").prop('checked',result["leucorrhea_seqing"]);
                            $("input:checkbox[name='leucorrhea_zhiqingxi']").prop('checked',result["leucorrhea_zhiqingxi"]);
                            $("input:checkbox[name='leucorrhea_zhinianchou']").prop('checked',result["leucorrhea_zhinianchou"]);
                            $("input:checkbox[name='marriage_nosex']").prop('checked',result["marriage_nosex"]);
                            $("input:checkbox[name='marriage_havesex']").prop('checked',result["marriage_havesex"]);
                            $("input:checkbox[name='marriage_tongju']").prop('checked',result["marriage_tongju"]);
                            $("input:checkbox[name='marriage_fenju']").prop('checked',result["marriage_fenju"]);
                            $("input:checkbox[name='marriage_lihun']").prop('checked',result["marriage_lihun"]);
                            $("input:checkbox[name='marriage_sangou']").prop('checked',result["marriage_sangou"]);
                            
                            $("input[name='pastpreg_yuncount'][value='"+result["pastpreg_yuncount"]+"']").prop("checked",true);
                            $("input[name='pastpreg_shunchan'][value='"+result["pastpreg_shunchan"]+"']").prop("checked",true);
                            $("input[name='pastpreg_pougong'][value='"+result["pastpreg_pougong"]+"']").prop("checked",true);
                            $("input[name='pastpreg_yaoliu'][value='"+result["pastpreg_yaoliu"]+"']").prop("checked",true);
                            $("input[name='pastpreg_renliu'][value='"+result["pastpreg_renliu"]+"']").prop("checked",true);
                            $("input[name='pastpreg_ziranliu'][value='"+result["pastpreg_ziranliu"]+"']").prop("checked",true);
                            $("input[name='pastpreg_zaochan'][value='"+result["pastpreg_zaochan"]+"']").prop("checked",true);
                            $("input[name='pastpreg_yiweirenshen'][value='"+result["pastpreg_yiweirenshen"]+"']").prop("checked",true);
                            $("input[name='pastpreg_qinggongshu'][value='"+result["pastpreg_qinggongshu"]+"']").prop("checked",true);
                            $('#pastpreg_qita').val(result["pastpreg_qita"]);
                            
                            $("input:checkbox[name='prevent_jieza']").prop('checked',result["prevent_jieza"]);
                            $("input:checkbox[name='prevent_jieyuqi']").prop('checked',result["prevent_jieyuqi"]);
                            $("input:checkbox[name='prevent_biyuntao']").prop('checked',result["prevent_biyuntao"]);
                            $("input:checkbox[name='prevent_biyunyao']").prop('checked',result["prevent_biyunyao"]);
                            
                            $("input[name='pastfamily_womb_blood'][value='"+result["pastfamily_womb_blood"]+"']").prop("checked",true);
                            $("input[name='pastfamily_ovulation'][value='"+result["pastfamily_ovulation"]+"']").prop("checked",true);
                            
                            $("input:checkbox[name='pastfamily_wu']").prop('checked',result["pastfamily_wu"]);
                            $("input:checkbox[name='pastfamily_xinzangbing']").prop('checked',result["pastfamily_xinzangbing"]);
                            $("input:checkbox[name='pastfamily_duonangluanchao']").prop('checked',result["pastfamily_duonangluanchao"]);
                            $("input:checkbox[name='pastfamily_tangniaobing']").prop('checked',result["pastfamily_tangniaobing"]);
                            $("input:checkbox[name='pastfamily_buxiang']").prop('checked',result["pastfamily_buxiang"]);
                            $('#pastfamily_qita').val(result["pastfamily_qita"]);
                            
                            $("input:checkbox[name='pasthistory_yindaoyan']").prop('checked',result["pasthistory_yindaoyan"]);
                            $("input:checkbox[name='pasthistory_zigongneimoyan']").prop('checked',result["pasthistory_zigongneimoyan"]);
                            $("input:checkbox[name='pasthistory_zigongneimoyiwei']").prop('checked',result["pasthistory_zigongneimoyiwei"]);
                            $("input:checkbox[name='pasthistory_zigongxianjizheng']").prop('checked',result["pasthistory_zigongxianjizheng"]);
                            $("input:checkbox[name='pasthistory_penqiangyan']").prop('checked',result["pasthistory_penqiangyan"]);
                            $("input:checkbox[name='pasthistory_zigongjiliu']").prop('checked',result["pasthistory_zigongjiliu"]);
                            $("input:checkbox[name='pasthistory_luancaonangzhong']").prop('checked',result["pasthistory_luancaonangzhong"]);
                            $("input:checkbox[name='pasthistory_ruxianzengsheng']").prop('checked',result["pasthistory_ruxianzengsheng"]);
                            $("input:checkbox[name='pasthistory_shengzhiyichang']").prop('checked',result["pasthistory_shengzhiyichang"]);
                            $("input:checkbox[name='pasthistory_jiazhuangxian']").prop('checked',result["pasthistory_jiazhuangxian"]);
                            $("input:checkbox[name='pasthistory_shenshangxian']").prop('checked',result["pasthistory_shenshangxian"]);
                            $("input:checkbox[name='pasthistory_xueye']").prop('checked',result["pasthistory_xueye"]);
                            $("input:checkbox[name='pasthistory_naochuitiliu']").prop('checked',result["pasthistory_naochuitiliu"]);
                            $("input:checkbox[name='pasthistory_tangniaobing']").prop('checked',result["pasthistory_tangniaobing"]);
                            $("input:checkbox[name='pasthistory_feipang']").prop('checked',result["pasthistory_feipang"]);
                            $("input:checkbox[name='pasthistory_ganyan']").prop('checked',result["pasthistory_ganyan"]);
                            $("input:checkbox[name='pasthistory_jiehe']").prop('checked',result["pasthistory_jiehe"]);
                            $('#pasthistory_qita').val(result["pasthistory_qita"]);
                            
                            $("input:checkbox[name='hobbies_wu']").prop('checked',result["hobbies_wu"]);
                            $("input:checkbox[name='hobbies_xiyan']").prop('checked',result["hobbies_xiyan"]);
                            $("input:checkbox[name='hobbies_yinjiu']").prop('checked',result["hobbies_yinjiu"]);
                            $("input:checkbox[name='hobbies_aoye']").prop('checked',result["hobbies_aoye"]);
                            $('#hobbies_qita').val(result["hobbies_qita"]);
                            
                            $("input[name='body_cond'][value='"+result["body_cond"]+"']").prop("checked",true);
                            $("input[name='career_labor'][value='"+result["career_labor"]+"']").prop("checked",true);
                            $("input[name='phycial_exercise'][value='"+result["phycial_exercise"]+"']").prop("checked",true);
                            
                            $("input:checkbox[name='reducefat_ever']").prop('checked',result["reducefat_ever"]);
                            $('#reducefat_persist').val(result["reducefat_persist"]);
                            
                            $("input:checkbox[name='reducefat_yundong']").prop('checked',result["reducefat_yundong"]);
                            $("input:checkbox[name='reducefat_jieshi']").prop('checked',result["reducefat_jieshi"]);
                            $("input:checkbox[name='reducefat_yaowu']").prop('checked',result["reducefat_yaowu"]);
                            $('#reducefat_qita').val(result["reducefat_qita"]);
                        } else {
                            alert("result.status wrong");
                        }
                    },
                    error: function () {
                        alert("请求失败！");
                        window.location.href = '/prj001';
                    }
                });
            };
        })
        //相关检查
        //<input type="hidden" class="person" name="person" id="person-relevant"/>
        $(".relevantBtn").click(function () {
            var temp_geninfourl = $('#person-relevant').val();
            $('#person-relevant').val(temp_geninfourl);//如果url不为空，api服务器返回的数据有person字段
            $.ajax({
                url: "/prj001/relevant_save",
                type: "PUT",
                dataType: "json",
                data: {
                    relevant_url: $(this).attr("relevantBtn-url"),
                    form_relevant: $('#form-relevant').serialize(),
                    // form_relevant: $('#form-relevant').ghostsf_serialize()
                },
                success:function (result) {
                    //403,用户除了自己,对于其它用户只有查看权限,不能修改
                    if (result.status == 200 || result.status == 201) {
                        alert("保存成功！")
                        window.location.href = '/prj001' + '/?page=' + curpage_global;
                    } else {
                        if (result.status == 403) {
                            alert("" + result.user_relevant.detail)
                        } else {
                            alert("保存失败" + result.status)
                        }
                    }
                },
                error: function () {
                    alert("保存失败")
                },
            })

        });
        $(".relevant").click(function () {
            document.getElementById("form-relevant").reset();

            //判断是否审核状态,未审核false则disable掉geninfoBtn
            if ($(this).attr("checked-info") == "no") {
                $(".relevantBtn").attr("disabled", true);
            } else {
                $(".relevantBtn").removeAttr("disabled");
            }

            var tempFlag = $(this).attr("relevant-url");
            var temp_geninfourl = $(this).attr("geninfo-url");
            if (tempFlag == "") {
                alert("准备创建相关检查");
                $('#person-relevant').val(temp_geninfourl);//如果url不为空，api服务器返回的数据有person字段
            } else {
                $.ajax({
                    url: "/prj001/relevant",//路由，用来处理ajax请求的函数的所在地址
                    method: "POST",
                    data: {relevant_url: $(this).attr("relevant-url")},
                    success: function(result){
                        $('#person-relevant').val(result["person"]);
                        if (result !== null) {
                            var set_input = document.getElementsByTagName('input');
                            for(var i=0;i<set_input.length;i++){
                                set_input[i].focus();
                            }
                            $('#relevantBtn').attr("relevantBtn-url", result["url"]);
                            
                            $("input:checkbox[name='menstruation_check']").prop('checked',result["menstruation_check"]);
                            $("input:checkbox[name='body_check']").prop('checked',result["body_check"]);
                            $("input:checkbox[name='accessory_chaosheng']").prop('checked',result["accessory_chaosheng"]);
                            $("input:checkbox[name='accessory_quanxuexibaojishu']").prop('checked',result["accessory_quanxuexibaojishu"]);

                            $("input:checkbox[name='accessory_ningxue']").prop('checked',result["accessory_ningxue"]);
                            $("input:checkbox[name='accessory_niaorenshen']").prop('checked',result["accessory_niaorenshen"]);
                            $("input:checkbox[name='accessory_jichutiwen']").prop('checked',result["accessory_jichutiwen"]);
                            $("input:checkbox[name='accessory_neifenmi']").prop('checked',result["accessory_neifenmi"]);
                            $("input:checkbox[name='accessory_zuzhi']").prop('checked',result["accessory_zuzhi"]);
                            $("input:checkbox[name='accessory_gongqiangjing']").prop('checked',result["accessory_gongqiangjing"]);
                            $("input:checkbox[name='accessory_jiejing']").prop('checked',result["accessory_jiejing"]);
                            $('#accessory_qita').val(result["accessory_qita"]);
                        }else {
                            alert("result.status wrong");
                        }
                    },
                    error: function () {
                        alert("请求失败！");
                        window.location.href = '/prj001';
                    }
                });
            };
        })
        //临床诊断
        //<input type="hidden" class="person" name="person" id="person-cc"/>
        $(".ccBtn").click(function () {
            var temp_geninfourl = $('#person-cc').val();
            $('#person-cc').val(temp_geninfourl);//如果url不为空，api服务器返回的数据有person字段
            $.ajax({
                url: "/prj001/cc_save",
                type: "PUT",
                dataType: "json",
                data: {
                    cc_url: $(this).attr("ccBtn-url"),
                    form_cc: $('#form-cc').serialize(),
                    // form_cc: $('#form-cc').ghostsf_serialize()
                },
                success:function (result) {
                    //403,用户除了自己,对于其它用户只有查看权限,不能修改
                    if (result.status == 200 || result.status == 201) {
                        alert("保存成功！")
                        window.location.href = '/prj001' + '/?page=' + curpage_global;
                    } else {
                        if (result.status == 403) {
                            alert("" + result.user_cc.detail)
                        } else {
                            alert("保存失败" + result.status)
                        }
                    }
                },
                error: function () {
                    alert("保存失败")
                },
            })

        });
        $(".cc").click(function () {
            document.getElementById("form-cc").reset();

            //判断是否审核状态,未审核false则disable掉geninfoBtn
            if ($(this).attr("checked-info") == "no") {
                $(".ccBtn").attr("disabled", true);
            } else {
                $(".ccBtn").removeAttr("disabled");
            }

            var tempFlag = $(this).attr("cc-url");
            var temp_geninfourl = $(this).attr("geninfo-url");
            if (tempFlag == "") {
                alert("准备创建临床诊断");
                $('#person-cc').val(temp_geninfourl);//如果url不为空，api服务器返回的数据有person字段
            } else {
                $.ajax({
                    url: "/prj001/cc",//路由，用来处理ajax请求的函数的所在地址
                    method: "POST",
                    data: {cc_url: $(this).attr("cc-url")},
                    success: function(result){
                        $('#person-cc').val(result["person"]);
                        if (result !== null) {
                            var set_input = document.getElementsByTagName('input');
                            for(var i=0;i<set_input.length;i++){
                                set_input[i].focus();
                            }
                            $('#ccBtn').attr("ccBtn-url", result["url"]); 

                            $("input:checkbox[name='yuejingxianqi']").prop('checked',result["yuejingxianqi"]);
                            $("input:checkbox[name='yuejinghouqi']").prop('checked',result["yuejinghouqi"]);
                            $("input:checkbox[name='yuejingwudingqi']").prop('checked',result["yuejingwudingqi"]);
                            $("input:checkbox[name='yuejingguoduo']").prop('checked',result["yuejingguoduo"]);
                            $("input:checkbox[name='yuejingguoshao']").prop('checked',result["yuejingguoshao"]);
                            $("input:checkbox[name='jingqiyanchang']").prop('checked',result["jingqiyanchang"]);
                            $("input:checkbox[name='jingjianqichuxie']").prop('checked',result["jingjianqichuxie"]);
                            $("input:checkbox[name='benglou']").prop('checked',result["benglou"]);
                            $('#yuejing_qita').val(result["yuejing_qita"]);

                            $("input:checkbox[name='shenxu']").prop('checked',result["shenxu"]);
                            $("input:checkbox[name='shenyin']").prop('checked',result["shenyin"]);
                            $("input:checkbox[name='shenyang']").prop('checked',result["shenyang"]);
                            $("input:checkbox[name='qixu']").prop('checked',result["qixu"]);
                            $("input:checkbox[name='xuexu']").prop('checked',result["xuexu"]);
                            $("input:checkbox[name='xuhan']").prop('checked',result["xuhan"]);
                            $("input:checkbox[name='xure']").prop('checked',result["xure"]);
                            $("input:checkbox[name='pixu']").prop('checked',result["pixu"]);
                            $("input:checkbox[name='xinpiliangxu']").prop('checked',result["xinpiliangxu"]);
                            $("input:checkbox[name='pishenyangxu']").prop('checked',result["pishenyangxu"]);
                            $("input:checkbox[name='qixuekuixu']").prop('checked',result["qixuekuixu"]);
                            $("input:checkbox[name='ganshenyinxu']").prop('checked',result["ganshenyinxu"]);
                            $('#qita_asthenic').val(result["qita_asthenic"]);

                            $("input:checkbox[name='ganyuxuere']").prop('checked',result["ganyuxuere"]);
                            $("input:checkbox[name='yangshengxuere']").prop('checked',result["yangshengxuere"]);
                            $("input:checkbox[name='shire']").prop('checked',result["shire"]);
                            $("input:checkbox[name='tanshi']").prop('checked',result["tanshi"]);
                            $("input:checkbox[name='qizhi']").prop('checked',result["qizhi"]);
                            $("input:checkbox[name='qizhixueyu']").prop('checked',result["qizhixueyu"]);
                            $("input:checkbox[name='shihan']").prop('checked',result["shihan"]);
                            $("input:checkbox[name='xuehan']").prop('checked',result["xuehan"]);
                            $("input:checkbox[name='hanningxueyu']").prop('checked',result["hanningxueyu"]);
                            $("input:checkbox[name='tanyuzuzhi']").prop('checked',result["tanyuzuzhi"]);
                            $('#qita_demonstration').val(result["qita_demonstration"]);

                            $("input:checkbox[name='yinxuxuere']").prop('checked',result["yinxuxuere"]);
                            $("input:checkbox[name='yangxuxuere']").prop('checked',result["yangxuxuere"]);
                            $("input:checkbox[name='shenxuxueyu']").prop('checked',result["shenxuxueyu"]);
                            $("input:checkbox[name='shenxuyure']").prop('checked',result["shenxuyure"]);
                            $("input:checkbox[name='shenxuganyu']").prop('checked',result["shenxuganyu"]);
                            $("input:checkbox[name='yinxuhuowang']").prop('checked',result["yinxuhuowang"]);
                            $("input:checkbox[name='qixuxueyu']").prop('checked',result["qixuxueyu"]);
                            $('#qita_def_ex').val(result["qita_def_ex"]);

                            $("input:checkbox[name='zigongchuxue']").prop('checked',result["zigongchuxue"]);
                            $('#qita_west').val(result["qita_west"]);
                        }else {
                            alert("result.status wrong");
                        }
                    },
                    error: function () {
                        alert("请求失败！");
                        window.location.href = '/prj001';
                    }
                });
            };
        })
        //中西治疗
        //<input type="hidden" class="person" name="person" id="person-cure"/>
        $(".cureBtn").click(function () {
            var temp_geninfourl = $('#person-cure').val();
            $('#person-cure').val(temp_geninfourl);//如果url不为空，api服务器返回的数据有person字段
            $.ajax({
                url: "/prj001/cure_save",
                type: "PUT",
                dataType: "json",
                data: {
                    cure_url: $(this).attr("cureBtn-url"),
                    form_cure: $('#form-cure').serialize(),
                    // form_cure: $('#form-cure').ghostsf_serialize()
                },
                success:function (result) {
                    //403,用户除了自己,对于其它用户只有查看权限,不能修改
                    if (result.status == 200 || result.status == 201) {
                        alert("保存成功！")
                        window.location.href = '/prj001' + '/?page=' + curpage_global;
                    } else {
                        if (result.status == 403) {
                            alert("" + result.user_cure.detail)
                        } else {
                            alert("保存失败" + result.status)
                        }
                    }
                },
                error: function () {
                    alert("保存失败")
                },
            })

        });
        $(".cure").click(function () {
            document.getElementById("form-cure").reset();

            //判断是否审核状态,未审核false则disable掉geninfoBtn
            if ($(this).attr("checked-info") == "no") {
                $(".cureBtn").attr("disabled", true);
            } else {
                $(".cureBtn").removeAttr("disabled");
            }

            var tempFlag = $(this).attr("cure-url");
            var temp_geninfourl = $(this).attr("geninfo-url");
            if (tempFlag == "") {
                alert("准备创建中西治疗");
                $('#person-cure').val(temp_geninfourl);//如果url不为空，api服务器返回的数据有person字段
            } else {
                $.ajax({
                    url: "/prj001/cure",//路由，用来处理ajax请求的函数的所在地址
                    method: "POST",
                    data: {cure_url: $(this).attr("cure-url")},
                    success: function(result){
                        $('#person-cure').val(result["person"]);
                        if (result !== null) {
                            var set_input = document.getElementsByTagName('input');
                            for(var i=0;i<set_input.length;i++){
                                set_input[i].focus();
                            }
                            $('#cureBtn').attr("cureBtn-url", result["url"]); 

                            $("input[name='to_cure'][value='"+result["to_cure"]+"']").prop("checked",true);

                            $("input:checkbox[name='xuzheng_bupi']").prop('checked',result["xuzheng_bupi"]);
                            $("input:checkbox[name='xuzheng_bushen']").prop('checked',result["xuzheng_bushen"]);
                            $("input:checkbox[name='xuzheng_buxue']").prop('checked',result["xuzheng_buxue"]);
                            $("input:checkbox[name='xuzheng_fuyang']").prop('checked',result["xuzheng_fuyang"]);
                            $("input:checkbox[name='xuzheng_buqi']").prop('checked',result["xuzheng_buqi"]);
                            $("input:checkbox[name='xuzheng_yangyin']").prop('checked',result["xuzheng_yangyin"]);
                            $("input:checkbox[name='xuzheng_zishen']").prop('checked',result["xuzheng_zishen"]);
                            $("input:checkbox[name='xuzheng_zhuyang']").prop('checked',result["xuzheng_zhuyang"]);
                            $('#xuzheng_qita').val(result["xuzheng_qita"]);

                            $("input:checkbox[name='shizheng_sanhan']").prop('checked',result["shizheng_sanhan"]);
                            $("input:checkbox[name='shizheng_jieyu']").prop('checked',result["shizheng_jieyu"]);
                            $("input:checkbox[name='shizheng_jianghuo']").prop('checked',result["shizheng_jianghuo"]);
                            $("input:checkbox[name='shizheng_huatan']").prop('checked',result["shizheng_huatan"]);
                            $("input:checkbox[name='shizheng_qingre']").prop('checked',result["shizheng_qingre"]);
                            $("input:checkbox[name='shizheng_liqi']").prop('checked',result["shizheng_liqi"]);
                            $("input:checkbox[name='shizheng_huayu']").prop('checked',result["shizheng_huayu"]);
                            $("input:checkbox[name='shizheng_chushi']").prop('checked',result["shizheng_chushi"]);
                            $("input:checkbox[name='shizheng_lishi']").prop('checked',result["shizheng_lishi"]);
                            $('#shizheng_qita').val(result["shizheng_qita"]);

                            $("input:checkbox[name='xushi_yangyin']").prop('checked',result["xushi_yangyin"]);
                            $("input:checkbox[name='xushi_jianghuo']").prop('checked',result["xushi_jianghuo"]);
                            $('#yuejing_qita').val(result["yuejing_qita"]);

                            $("input:checkbox[name='pre_xu_yiqi']").prop('checked',result["pre_xu_yiqi"]);
                            $("input:checkbox[name='pre_xu_guyin']").prop('checked',result["pre_xu_guyin"]);
                            $("input:checkbox[name='pre_xu_yuanjian']").prop('checked',result["pre_xu_yuanjian"]);
                            $("input:checkbox[name='pre_xu_dihuang']").prop('checked',result["pre_xu_dihuang"]);
                            $("input:checkbox[name='pre_xu_yangrong']").prop('checked',result["pre_xu_yangrong"]);
                            $("input:checkbox[name='pre_xu_daying']").prop('checked',result["pre_xu_daying"]);
                            $("input:checkbox[name='pre_xu_wenjing']").prop('checked',result["pre_xu_wenjing"]);
                            $("input:checkbox[name='pre_xu_guipi']").prop('checked',result["pre_xu_guipi"]);
                            $("input:checkbox[name='pre_xu_anchong']").prop('checked',result["pre_xu_anchong"]);
                            $("input:checkbox[name='pre_xu_guishen']").prop('checked',result["pre_xu_guishen"]);
                            $("input:checkbox[name='pre_xu_zixue']").prop('checked',result["pre_xu_zixue"]);
                            $("input:checkbox[name='pre_xu_jianyuan']").prop('checked',result["pre_xu_jianyuan"]);
                            $("input:checkbox[name='pre_xu_qingxue']").prop('checked',result["pre_xu_qingxue"]);
                            $("input:checkbox[name='pre_xu_liangdi']").prop('checked',result["pre_xu_liangdi"]);
                            $("input:checkbox[name='pre_xu_jiajian']").prop('checked',result["pre_xu_jiajian"]);
                            $("input:checkbox[name='pre_xu_liuwei']").prop('checked',result["pre_xu_liuwei"]);
                            $("input:checkbox[name='pre_xu_zuogui']").prop('checked',result["pre_xu_zuogui"]);
                            $("input:checkbox[name='pre_xu_yougui']").prop('checked',result["pre_xu_yougui"]);
                            $("input:checkbox[name='pre_xu_guchong']").prop('checked',result["pre_xu_guchong"]);
                            $("input:checkbox[name='pre_xu_guben']").prop('checked',result["pre_xu_guben"]);
                            $('#pre_xu_qita').val(result["pre_xu_qita"]);

                            $("input:checkbox[name='pre_shi_xiaoyao']").prop('checked',result["pre_shi_xiaoyao"]);
                            $("input:checkbox[name='pre_shi_qingjing']").prop('checked',result["pre_shi_qingjing"]);
                            $("input:checkbox[name='pre_shi_wenjing']").prop('checked',result["pre_shi_wenjing"]);
                            $("input:checkbox[name='pre_shi_wuyao']").prop('checked',result["pre_shi_wuyao"]);
                            $("input:checkbox[name='pre_shi_erchen']").prop('checked',result["pre_shi_erchen"]);
                            $("input:checkbox[name='pre_shi_daotan']").prop('checked',result["pre_shi_daotan"]);
                            $("input:checkbox[name='pre_shi_baoyin']").prop('checked',result["pre_shi_baoyin"]);
                            $("input:checkbox[name='pre_shi_taohong']").prop('checked',result["pre_shi_taohong"]);
                            $("input:checkbox[name='pre_shi_siwu']").prop('checked',result["pre_shi_siwu"]);
                            $("input:checkbox[name='pre_shi_tongyu']").prop('checked',result["pre_shi_tongyu"]);
                            $("input:checkbox[name='pre_shi_cangfu']").prop('checked',result["pre_shi_cangfu"]);
                            $("input:checkbox[name='pre_shi_yangxue']").prop('checked',result["pre_shi_yangxue"]);
                            $("input:checkbox[name='pre_shi_liangdi']").prop('checked',result["pre_shi_liangdi"]);
                            $("input:checkbox[name='pre_shi_zongpu']").prop('checked',result["pre_shi_zongpu"]);
                            $("input:checkbox[name='pre_shi_qinggan']").prop('checked',result["pre_shi_qinggan"]);
                            $("input:checkbox[name='pre_shi_zuyu']").prop('checked',result["pre_shi_zuyu"]);
                            $("input:checkbox[name='pre_shi_qingre']").prop('checked',result["pre_shi_qingre"]);
                            $("input:checkbox[name='pre_shi_zhibeng']").prop('checked',result["pre_shi_zhibeng"]);
                            $('#pre_shi_qita').val(result["pre_shi_qita"]);

                            $("input:checkbox[name='pre_xushi_liangdi']").prop('checked',result["pre_xushi_liangdi"]);
                            $("input:checkbox[name='pre_xushi_qingjing']").prop('checked',result["pre_xushi_qingjing"]);
                            $('#pre_xushi_qita').val(result["pre_xushi_qita"]);

                            $("input:checkbox[name='zhong_xu_buzhong']").prop('checked',result["zhong_xu_buzhong"]);
                            $("input:checkbox[name='zhong_xu_renshen']").prop('checked',result["zhong_xu_renshen"]);
                            $("input:checkbox[name='zhong_xu_zhixue']").prop('checked',result["zhong_xu_zhixue"]);
                            $("input:checkbox[name='zhong_xu_ankun']").prop('checked',result["zhong_xu_ankun"]);
                            $("input:checkbox[name='zhong_xu_fufang']").prop('checked',result["zhong_xu_fufang"]);
                            $("input:checkbox[name='zhong_xu_gujing']").prop('checked',result["zhong_xu_gujing"]);
                            $("input:checkbox[name='zhong_xu_dabu']").prop('checked',result["zhong_xu_dabu"]);
                            $("input:checkbox[name='zhong_xu_kuntai']").prop('checked',result["zhong_xu_kuntai"]);
                            $("input:checkbox[name='zhong_xu_wuji']").prop('checked',result["zhong_xu_wuji"]);
                            $("input:checkbox[name='zhong_xu_dingkun']").prop('checked',result["zhong_xu_dingkun"]);
                            $("input:checkbox[name='zhong_xu_zanyu']").prop('checked',result["zhong_xu_zanyu"]);
                            $("input:checkbox[name='zhong_xu_aifu']").prop('checked',result["zhong_xu_aifu"]);
                            $("input:checkbox[name='zhong_xu_ejiao']").prop('checked',result["zhong_xu_ejiao"]);
                            $("input:checkbox[name='zhong_xu_liuwei']").prop('checked',result["zhong_xu_liuwei"]);
                            $("input:checkbox[name='zhong_xu_erzhi']").prop('checked',result["zhong_xu_erzhi"]);
                            $("input:checkbox[name='zhong_xu_fuke']").prop('checked',result["zhong_xu_fuke"]);
                            $('#zhong_xu_qita').val(result["zhong_xu_qita"]);

                            $("input:checkbox[name='zhong_shi_xuening']").prop('checked',result["zhong_shi_xuening"]);
                            $("input:checkbox[name='zhong_shi_duanxue']").prop('checked',result["zhong_shi_duanxue"]);
                            $("input:checkbox[name='zhong_shi_jiawei']").prop('checked',result["zhong_shi_jiawei"]);
                            $("input:checkbox[name='zhong_shi_qianzhi']").prop('checked',result["zhong_shi_qianzhi"]);
                            $("input:checkbox[name='zhong_shi_angong']").prop('checked',result["zhong_shi_angong"]);
                            $("input:checkbox[name='zhong_shi_yunnan']").prop('checked',result["zhong_shi_yunnan"]);
                            $("input:checkbox[name='zhong_shi_fuan']").prop('checked',result["zhong_shi_fuan"]);
                            $("input:checkbox[name='zhong_shi_fuxue']").prop('checked',result["zhong_shi_fuxue"]);
                            $("input:checkbox[name='zhong_shi_gongning']").prop('checked',result["zhong_shi_gongning"]);
                            $("input:checkbox[name='zhong_shi_zhixue']").prop('checked',result["zhong_shi_zhixue"]);
                            $("input:checkbox[name='zhong_shi_ankun']").prop('checked',result["zhong_shi_ankun"]);
                            $("input:checkbox[name='zhong_shi_shaofu']").prop('checked',result["zhong_shi_shaofu"]);
                            $("input:checkbox[name='zhong_shi_xuefu']").prop('checked',result["zhong_shi_xuefu"]);
                            $("input:checkbox[name='zhong_shi_qizhi']").prop('checked',result["zhong_shi_qizhi"]);
                            $("input:checkbox[name='zhong_shi_xiaoyao']").prop('checked',result["zhong_shi_xiaoyao"]);
                            $('#zhong_shi_qita').val(result["zhong_shi_qita"]);

                            $("input:checkbox[name='zhong_xushi_zhixue']").prop('checked',result["zhong_xushi_zhixue"]);
                            $("input:checkbox[name='zhong_xushi_gujing']").prop('checked',result["zhong_xushi_gujing"]);
                            $("input:checkbox[name='zhong_xushi_nvjin']").prop('checked',result["zhong_xushi_nvjin"]);
                            $("input:checkbox[name='zhong_xushi_zhibo']").prop('checked',result["zhong_xushi_zhibo"]);
                            $('#zhong_xushi_qita').val(result["zhong_xushi_qita"]);

                            $("input:checkbox[name='hormone_yun']").prop('checked',result["hormone_yun"]);
                            $("input:checkbox[name='hormone_ci']").prop('checked',result["hormone_ci"]);
                            $("input:checkbox[name='hormone_fufang']").prop('checked',result["hormone_fufang"]);
                            $("input:checkbox[name='hormone_kou']").prop('checked',result["hormone_kou"]);
                            $("input:checkbox[name='hormone_gn']").prop('checked',result["hormone_gn"]);
                            $('#hormone_qita').val(result["hormone_qita"]);

                            $('#guagongshu').val(result["guagongshu"]);
                            $("input:checkbox[name='zhou_yun']").prop('checked',result["zhou_yun"]);
                            $("input:checkbox[name='zhou_kou']").prop('checked',result["zhou_kou"]);
                            $("input:checkbox[name='zhou_ci']").prop('checked',result["zhou_ci"]);
                            $("input:checkbox[name='zhou_zuo']").prop('checked',result["zhou_zuo"]);
                            $('#zhou_qita').val(result["zhou_qita"]);

                            $("input:checkbox[name='cu_mifen']").prop('checked',result["cu_mifen"]);
                            $("input:checkbox[name='cu_rongmao']").prop('checked',result["cu_rongmao"]);
                            $("input:checkbox[name='cu_niao']").prop('checked',result["cu_niao"]);
                            $("input:checkbox[name='cu_luan']").prop('checked',result["cu_luan"]);
                            $("input:checkbox[name='cu_lai']").prop('checked',result["cu_lai"]);
                            $("input:checkbox[name='cu_cu']").prop('checked',result["cu_cu"]);
                            $('#cu_qita').val(result["cu_qita"]);

                            $("input:checkbox[name='shu_neimo']").prop('checked',result["shu_neimo"]);
                            $("input:checkbox[name='shu_qiechu']").prop('checked',result["shu_qiechu"]);
                            $('#shu_qita').val(result["shu_qita"]);
                        }else {
                            alert("result.status wrong");
                        }
                    },
                    error: function () {
                        alert("请求失败！");
                        window.location.href = '/prj001';
                    }
                });
            };
        })
        //疗效情况
        //<input type="hidden" class="person" name="person" id="person-results"/>
        $(".resultsBtn").click(function () {
            var temp_geninfourl = $('#person-results').val();
            $('#person-results').val(temp_geninfourl);//如果url不为空，api服务器返回的数据有person字段
            $.ajax({
                url: "/prj001/results_save",
                type: "PUT",
                dataType: "json",
                data: {
                    results_url: $(this).attr("resultsBtn-url"),
                    form_results: $('#form-results').serialize(),
                    // form_results: $('#form-results').ghostsf_serialize()
                },
                success:function (result) {
                    //403,用户除了自己,对于其它用户只有查看权限,不能修改
                    if (result.status == 200 || result.status == 201) {
                        alert("保存成功！")
                        window.location.href = '/prj001' + '/?page=' + curpage_global;
                    } else {
                        if (result.status == 403) {
                            alert("" + result.user_results.detail)
                        } else {
                            alert("保存失败" + result.status)
                        }
                    }
                },
                error: function () {
                    alert("保存失败")
                },
            })

        });
        $(".results").click(function () {
            document.getElementById("form-results").reset();

            //判断是否审核状态,未审核false则disable掉geninfoBtn
            if ($(this).attr("checked-info") == "no") {
                $(".resultsBtn").attr("disabled", true);
            } else {
                $(".resultsBtn").removeAttr("disabled");
            }

            var tempFlag = $(this).attr("results-url");
            var temp_geninfourl = $(this).attr("geninfo-url");
            if (tempFlag == "") {
                alert("准备创建疗效情况");
                $('#person-results').val(temp_geninfourl);//如果url不为空，api服务器返回的数据有person字段
            } else {
                $.ajax({
                    url: "/prj001/results",//路由，用来处理ajax请求的函数的所在地址
                    method: "POST",
                    data: {results_url: $(this).attr("results-url")},
                    success: function(result){
                        $('#person-results').val(result["person"]);
                        if (result !== null) {
                            var set_input = document.getElementsByTagName('input');
                            for(var i=0;i<set_input.length;i++){
                                set_input[i].focus();
                            }
                            $('#resultsBtn').attr("resultsBtn-url", result["url"]); 

                            $('#last_result').val(result["last_result"]);
                            $('#far_result').val(result["far_result"]);
                            $('#far_month_result').val(result["far_month_result"]);
                        }else {
                            alert("result.status wrong");
                        }
                    },
                    error: function () {
                        alert("请求失败！");
                        window.location.href = '/prj001';
                    }
                });
            };
        })
        //审核
})