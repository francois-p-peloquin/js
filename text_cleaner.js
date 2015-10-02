$(document).ready(function(){	
	var t = $('#in.text_cleaner').val();
	$('#out.text_cleaner').val(text_to_html(t,check_allow_html(),check_add_p())); //launch check
	
	$('#in.text_cleaner').change(function() {
		var t = $('#in.text_cleaner').val();
		$('#out.text_cleaner').val(text_to_html(t,check_allow_html(),check_add_p()));
	});
	
	$('#in.text_cleaner').keyup(function(e) {
		var t = $('#in.text_cleaner').val();
		$('#out.text_cleaner').val(text_to_html(t,check_allow_html(),check_add_p()));
	});
	
	$('input[name="allow_html"], input[name="add_p"]').click(function() {
		var t = $('#in.text_cleaner').val();
		$('#out.text_cleaner').val(text_to_html(t,check_allow_html(),check_add_p())); //launch check
	});
});

function check_allow_html() {
	return $('input[name="allow_html"]').is(':checked');
}
function check_add_p() {
	return $('input[name="add_p"]').is(':checked');
}