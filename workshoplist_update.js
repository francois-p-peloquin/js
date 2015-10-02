$(document).ready(function() {
	update_all(); //init
	
	$('.update_item:not(#update_all)').click(function(e) {
		e.preventDefault();
		var link = $(this).attr('href');
		ajax(link,true);
	});
	
	$('#update_all').click(function(e) {
		//prompt("Enter in the password",'')
		update_all(true);
	});
});

function update_all(override) {
	var ovr = typeof override !== 'undefined' ? override : false;
	$('.update_item:not(#update_all)').each(function() {
		var link = $(this).attr('href');
		//alert(link);
		ajax(link,ovr);
	});
}

function ajax(request,override) {
	var ovr = typeof override !== 'undefined' ? override : false;
	$('a[href$="' + request + '"]').addClass('loading').find('.clock').html('');
	$.ajax({
		url: request,
		crossDomain: true,
		type: 'POST',
		data: {
			pass: '888wsy1qz',
			override: ovr,
		},
		cache: false,
		success: function(response) {
			var d = new Date(response * 1000);
			var date = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
			var product = '<span class="time">' + d.toLocaleTimeString() + '</span><span class="date">' + date + '</span>';
			$('a[href$="' + request + '"]').find('.clock').html(product);
			$('a[href$="' + request + '"]').removeClass('loading');
		},
		error:	function(jqXHR,textStatus,errorThrown){
			console.log(jqXHR);
        }
	});
}