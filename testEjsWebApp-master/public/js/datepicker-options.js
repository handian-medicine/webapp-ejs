//  日期控件格式调整
    $(function(){
        $('#recdate').datepicker({
            format:"yyyy-mm-dd",
            autoclose:true,
            language:'zh-CN',
        });
        $('#birth').datepicker({
            format:"yyyy-mm",
            // changeMonth: true,
            // changeYear: true, 
            autoclose: true,  
            language:'zh-CN',
            // yearRange: '1950:2013',
            viewMode: "months", 
            minViewMode: "months"
        });
        $('#last_time').datepicker({
            format:"yyyy-mm-dd",
            autoclose:true,
            language:'zh-CN',
        })
    })  