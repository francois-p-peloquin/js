f_r = {
	current : 0, //I will change honey, I promise
	clicks : 0,
	location : '#figure_image',
	container_height : 350,
	effect_time : 300,
	ajax_url : function() {
		var location = window.location.pathname.split('/')[1];
		return '/ajax/figure_captions/' + location + '/';
	},
	images : new Array(),
	created_images : new Array(),
	created_blurbs : new Array(),
	in_process : new Array(),
	file_sizes : new Array(),
	init : function() {
		// $(this.location).css({ minHeight: this.container_height });
		
		//Show cookies on load
		var cookies = false; //this.check_cookies();
		if (cookies) {
			$('#figure_display').css({background:'none'}).contents().show();
			this.place_image(false);
		}
		else {
			$('#figure_display div.clear').show();
		}
		
		//Sloppy visibility thing
		$('#figure_display').css({background:'none'}).contents().show();
		$('#f_r_prev, #f_r_next, #figure_nav_controls, #figure_image_box, #figure_blurb').css({ visibility:'visible' });
		
		//Add Controls
		$('<a id="f_r_prev" class="active"></a><a id="f_r_next" class="active"></a>').prependTo('#figure_display');
		$('#f_r_prev').bind('click',f_r.prev); 
		$('#f_r_next').bind('click',f_r.next); 
	},
	prev : function() {
		f_r.clicks++;
		f_r.mark_prev();
		f_r.current--;
		f_r.place_image();
	},
	next : function() {
		f_r.clicks++;
		f_r.mark_prev();
		f_r.current++;
		f_r.place_image();
	},
	place_image : function(preload) {
		if (typeof(preload)==='undefined') preload = true;
		//Dissappear
		$('#figure_image_box').addClass('loading').children().hide();
		var figure_number = $('#figure_navi li a[href="' + this.images[this.current] + '"]').text();
		$('#figure_blurb').hide();
		
		this.check_navi();
		this.highlight_current();
		this.accordion();
		
		//Actual image placement is on completion of ajax function now
		this.load_image();
		this.blurb(figure_number,this.place_all,true); //Callback made here in place all, ajax complete
		if (preload) {
			this.preload();
		}
	},
	place_all : function(figure_number) {
		//Actually Action, Image
		$(f_r.location).hide()
			.find('a')
			.attr('href',f_r.images[f_r.current].replace('png','bmp'))
			.find('img')
			.attr('src',f_r.images[f_r.current])
			.attr('alt',f_r.created_blurbs[figure_number])
			.attr('title',($.browser.msie && f_r.created_blurbs[figure_number].length > 509 ? function() { //a bit odd, but ie does not accept title tags longer than 509 characters...this is cleanup
				var tmp_title = f_r.created_blurbs[figure_number].substring(0,509).trim().split(' ');
				var trash = tmp_title.pop();
				tmp_title = tmp_title.join(' ') + '...';
				return tmp_title;
			} : f_r.created_blurbs[figure_number]))
			.ready(function() { 
				$(f_r.location).fadeIn(f_r.effect_time).parent().removeClass('loading');
				
				//Actually Action, Text
				$('#figure_blurb #blurb').text(f_r.created_blurbs[figure_number]);
				var bmp = f_r.images[f_r.current].replace('png','bmp');
				$('#high_res a').attr('href',bmp);
				
				//Set Chapter details,find file size of zip
				var chapter_name = $('#figure_navi li a[href="' + f_r.images[f_r.current] + '"]').parent().parent().prev().text();//figure_number.split('.')[0].split(' ')[1];
				var beg = chapter_name.split(' ')[0];
				var end = chapter_name.split(' ')[1];
				var file = beg + '_' + (isNaN(end) ? end : pad(end,2)) + '.zip';
				var location = bmp.split('/');
				
				//Grab Erl_ETC
				var this_set = location.pop().split('_'); //location pop needed
				this_set.pop();
				this_set = this_set.join('_');
				
				location = location.join('/');
				file = location + '/' + this_set + '_Figure_' + file;
				f_r.file_size(file,'#bundle_size'); //file size
				
				$('#high_res_chapter a').attr('href',file);
				$('#high_res_chapter .chapter_number').text(beg + ' ' + end);
				$('#figure_blurb').fadeIn(f_r.effect_time);
			});
	},
	load_image : function(number) {
		if (typeof(number)==='undefined') number = this.current;

		//Create if we haven't already stored this in the new array
		if (!(number in this.created_images)) {
			var img = new Image();
			img.src = this.images[number];
			this.created_images[number] = img;
			$(this.images[number]).preload();
		}
	},
	blurb : function(figure_number,callback,show) {
		if (typeof(callback)==='undefined') callback = false;
		if (typeof(show)==='undefined') show = false;
		if (!(figure_number in this.created_blurbs) && (f_r.in_process.indexOf(url) == -1)) {
			var url = f_r.ajax_url() + '?figure=' + figure_number;
			$.ajax({
				data : {
					caption : figure_number
				},
				url : url,
				beforeSend : function() {
					f_r.in_process.push(url);
				},
				success : function(response) {
					f_r.created_blurbs[figure_number] = response;
					
					//Show or not
					if (show && callback) {
						callback(figure_number);
					}
				}
			});
			console.log(f_r.created_blurbs);
		}
		else if ((figure_number in this.created_blurbs) && show) {
			callback(figure_number);
		}
	},
	preload : function() {
		var load_around = new Array(1,2,-1,3,-2);
		for ($i = 0; $i < load_around.length; $i++) {
			var new_current = Number(this.current) + load_around[$i];
			if (new_current != this.current && new_current >= 0 && new_current < this.images.length) {
				this.load_image(new_current);
				this.blurb($('#figure_navi li a[href="' + this.images[new_current] + '"]').text(),'');
			}
		}
	},
	set_cookies : function(value) {
		var exdate = new Date();
		exdate.setDate(exdate.getDate() + (1 / 12)); //2 hrs
		document.cookie = 'f_r_cookie' + '=' + value + 'expires=' + exdate.toUTCString();
	},
	get_cookies : function(name) {
		var i,x,y,ARRcookies=document.cookie.split(";");
		for (i=0;i<ARRcookies.length;i++) {
			x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
			y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
			x=x.replace(/^\s+|\s+$/g,"");
			if (x==name) {
				return unescape(y);
			}
		}	
	},
	check_cookies : function () {
		var last_image = this.get_cookies('f_r_cookie');
		if (last_image != null && last_image != '') {
			last_image = last_image.substring(0,last_image.indexOf('expires'));
			this.current = last_image;
			return true;
		}
		else {
			return false;
		}
	},
	mark_prev : function() {
		$('#figure_navi li').removeClass('prev next');
		$('#figure_navi li.current').addClass('prev');
	},
	highlight_current : function() {
		var subject = $('#figure_navi li a[href="' + f_r.images[f_r.current] + '"]');
		$('#figure_navi li.current').removeClass('current').parent().parent().removeClass('current_chapter');
		$(subject).parent().addClass('current').parent().parent().addClass('current_chapter');
	},
	accordion : function() {
		//If Chapter Chante execute
		$('#figure_navi li:not(.current_chapter) ul').slideUp(this.effect_time);	
		$('#figure_navi li.current_chapter ul').slideDown(this.effect_time);
	},
	check_navi : function() {
		//Prev
		if (this.current == 0) {
			$('#f_r_prev').removeClass('active').unbind('click');
		}
		else {
			if (!$('#f_r_prev').hasClass('active')) {
				$('#f_r_prev').addClass('active').bind('click',f_r.prev); 
			}
		}
					
		//Next
		if (this.current == this.images.length - 1) {
			$('#f_r_next').removeClass('active').unbind('click');
		}
		else {
			if (!$('#f_r_next').hasClass('active')) {
				$('#f_r_next').addClass('active').bind('click',f_r.next); 
			}
		}
	},
	file_size : function(file,to_update) {
		if (!(file in this.file_sizes)) { //not there, get via ajax
			$.ajax(file, {
				type: 'HEAD',
				success: function(d,r,xhr) {
					var fileSize = xhr.getResponseHeader('Content-Length');
					fileSize = Math.round((fileSize / 1048576) * 10) / 10;
					$(to_update).text(fileSize);
					f_r.file_sizes[file] = fileSize;
				}
			});
		}
		else { //already in array
			var fileSize = this.file_sizes[file];
			$(to_update).text(fileSize);
		}
	},
	blink: function(subj) {
		$(subj).stop(true,true).css({opacity:'1'}).animate({opacity:'0.7'},200,function() {
			$(this).removeAttr('style');
		});
	}
}

$(document).ready(function() {
	//Hide
	$('#figure_navi ul').hide();
	
	//Slide
	$('#figure_navi li span').click(function() {
		$('#figure_navi li').children('ul').slideUp(f_r.effect_time);    
		if ($(this).siblings('ul').css('display') != 'block') {
			$(this).siblings('ul').slideDown(f_r.effect_time);
		}
	});
	
	//Click
	$('#figure_navi li a').each(function() { //Create array from list
		f_r.images.push($(this).attr('href'));
	}).click(function(e) { //Onclick
		if (f_r.clicks == 0) {
			f_r.init();
		}
		e.preventDefault();
		var link = $(this).attr('href');
		
		f_r.mark_prev(); //Mark prev before change
		f_r.current = f_r.images.indexOf(link);
		f_r.place_image();
		f_r.clicks++;
	});
	//alert(f_r.images.length);
	
	//Set cookie on window close
	$(window).unload(function() {
		f_r.set_cookies(f_r.current);
	});
});

//Type
$(document).keyup(function(e) {
	if (f_r.clicks != 0) {
		if ((e.keyCode == 37 || e.keyCode == 38) && f_r.current != 0) { //left, up
			f_r.prev();
			f_r.blink('#f_r_prev');
		}
		if ((e.keyCode == 39 || e.keyCode == 40) && f_r.current < f_r.images.length - 1) { //right, down
			f_r.next();
			f_r.blink('#f_r_next');
		}
	}
});

//Keypress shift issue
$(document).keypress(function(e) {
	if (e.keyCode == 37) e.preventDefault(); //stop left shift
	if (e.keyCode == 39) e.preventDefault(); //stop right shift
});

/*$(document).bind('keyup keydown', function(e){
	shifted = e.shiftKey
});*/

//GENERAL FUNCTIONS (yes sir!)
function pad(number, length) {
    var str = '' + number;
    while (str.length < length) { str = '0' + str; }
    return str;
}

$.fn.preload = function() {
    this.each(function(){ $('<img/>')[0].src = this; });
}