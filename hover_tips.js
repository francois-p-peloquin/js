$(document).ready(function() {
	$('.special_box').show();
	
	//Blurbs Blurb Show momentarily to position
	$('.blurbs_blurb').show();
	
	//Position Elements
	
	$('.blurbs_blurb_left_top, .blurbs_blurb_right_top').each(function() {
		var height = $(this).outerHeight(true);
		$(this).css('top',  -(height + 5));
	});
	
	//Above Blurb Positions
	$('.blurbs_blurb_top_right, .blurbs_blurb_top_left').each(function() {
		var height = $(this).outerHeight(true);
		$(this).css('top',  -(height + 5 + 100));
	});

	//General Blurb Margin Removal
	$('.blurbs_blurb').each(function() { 
		var height = $(this).outerHeight(true);
		$(this).css('margin-bottom',  -height);
	});

	//Vertical Alignment
	$('.height_adjuster').each(function() {
		var height = $(this).outerHeight(true);
		var position = (80 - height) / 2;
		$(this).css('margin-top',  position);
	});
	
	//Vertical Alignment
	$('.column h4 span').each(function() {
		var height = $(this).outerHeight(true);
		var position = (34 - height) / 2;
		$(this).css('margin-top',  position);
	});
	


	//Hide Elements
	$('.blurbs_blurb').hide();
	
	
	//Add Cursor to Blurbs
	$('.height_adjuster').css('cursor', 'pointer');
	
	//Fade in and Out & Give Shadow
	$('.height_adjuster').hover(function() {
		$('.height_adjuster').stop(true,true);
		$(this).stop(true,true).parent().next('.blurbs_blurb').fadeIn('fast');
	}, function() {
		$(this).stop(true,true).parent().next('.blurbs_blurb').fadeOut('fast');
	});
});