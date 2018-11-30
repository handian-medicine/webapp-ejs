$(function () {

	$('#box').datetimebox({
		//value : '2015-6-1 11:11:11',
		//showSeconds : false,
		//timeSeparator : '/',
	});
	
	
	//$('#box').datetimebox('setValue', '2015-6-1 11:11:11');
	
	console.log($('#box').datetimebox('spinner').spinner('getValue'));
});



	









