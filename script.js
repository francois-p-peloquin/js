//NWASAP
$.fn.date_string = function() {
	var m_straight = true
	for (var d in this) {
		if (this[d].getMonth() != this[d - 1].getMonth()) {
			m_straight = false;
		}
	}
	
	if (m_straight) {
		var product = this[d].getMonthString() + ' ' + this[d].getDate().toString() + '-' + this[d].getDate().toString() + ', ' + this[d].getFullYear().toString();
	}
}

//Ajax Loading Bar
function Loading_Bar(data) {
	data = typeof data === 'undefined' ? {} : data;
	for (var i in data) {
		this[i] = data[i];
	}
}
Loading_Bar.prototype = {
	bar: '#loading_bar',
	count: 0,
	eta: 300,
	wait: 15000,
	width: function() {
		return $(this.bar).width() + 40;
	},
	progress: function() {
		return (1 / (this.count + 1));
	},
	crawl: function() {
		var Obj = this;
		var pos = -Obj.width() + (Obj.width() * 0.90);
		$(Obj.bar).stop().animate({ 'background-position': pos }, Obj.wait, function() {
			if (Obj.count > 0) {
				Obj.remove(true);
			}
		});
	},
	status: function(state) {
		var Obj = this;
		if (state == 1) {
			Obj.count++;
		} else {
			Obj.count--;
		}
		
		var pos = -Obj.width() + (Obj.width() * Obj.progress());
		$(Obj.bar).stop().animate({ 'background-position': pos },Obj.eta, function() {
			if (Obj.count == 0) {
				Obj.remove();
			} else {
				Obj.crawl();
			}
		});
	},
	remove: function(error) { //also handles error
		var Obj = this;
		error = typeof error === 'undefined' ? false : error;
		
		var t = setTimeout(function() {
			if (error) {
				alert('error');
				$(Obj.bar).stop().css({ 'background-position': -Obj.width() });
				Obj.count = 0; //reset to avoid further errors
			} else {
				$(Obj.bar).stop().css({ 'background-position': -Obj.width() });
			}
		}, Obj.eta);
	},
};
var loading_bar = new Loading_Bar();

$.fn.fuzz = function() {
	time = typeof time !== 'undefined' ? time : 400;
	var pause = 300;
	var Subj = this;
	
	loading_bar.status(1);
	$(Subj).stop(true,true).css({opacity:0.1});
	var t = setTimeout(function() {
		$(Subj).animate({opacity:1},time);
		loading_bar.status(0);
	},pause);
}

$.fn.focus_row = function() {
	$(':input',this).focus(function() {
		$(this).closest('tr').addClass('focus');// alert('on');
	});
	$(':input',this).blur(function() {
		$(this).closest('tr').removeClass('focus');// alert('on');
	});
}

$.fn.inputError = function(error) {
	error = typeof error === 'undefined' ? true : false;
	var Obj = this;
	var color = {
		e: '#fff7fa',
		e_b: '#eedfe5',
		r: '#fff',
		r_b: '#f0f0f0',
	};
	
	if (error) {
		if ($(Obj).hasClass('error')) {
			$(Obj).removeClass('error').css({ backgroundColor: color.e, borderColor: colorLuminance(color.e_b,-0.1) });
		}
		$(Obj).animate({ backgroundColor: color.e, borderColor: color.e_b },150, function() {
			$(Obj).removeAttr('style').addClass('error');
		});
	} else {
		$(Obj).animate({ backgroundColor: color.r, borderColor: color.r_b },100, function() {
			$(Obj).removeAttr('style').removeClass('error');
		});
	}
}

$.fn.clickToggle = function(func1, func2) {
	var funcs = [func1, func2];
	this.data('toggleclicked', 0);
	this.click(function() {
		var data = $(this).data();
		var tc = data.toggleclicked;
		$.proxy(funcs[tc], this)();
		data.toggleclicked = (tc + 1) % 2;
	});
	return this;
}

jQuery.extend({
    compare : function (a,b) {
        var obj_str = '[object Object]',
            arr_str = '[object Array]',
            a_type  = Object.prototype.toString.apply(a),
            b_type  = Object.prototype.toString.apply(b);

            if ( a_type !== b_type) { return false; }
            else if (a_type === obj_str) {
                return $.compareObject(a,b);
            }
            else if (a_type === arr_str) {
                return $.compareArray(a,b);
            }
            return (a === b);
    },
    compareArray: function (arrayA, arrayB) {
        var a,b,i,a_type,b_type;
        // References to each other?
        if (arrayA === arrayB) { return true;}

        if (arrayA.length != arrayB.length) { return false; }
        // sort modifies original array
        // (which are passed by reference to our method!)
        // so clone the arrays before sorting
        a = jQuery.extend(true, [], arrayA);
        b = jQuery.extend(true, [], arrayB);
        a.sort(); 
        b.sort();
        for (i = 0, l = a.length; i < l; i+=1) {
            a_type = Object.prototype.toString.apply(a[i]);
            b_type = Object.prototype.toString.apply(b[i]);

            if (a_type !== b_type) {
                return false;
            }

            if ($.compare(a[i],b[i]) === false) {
                return false;
            }
        }
        return true;
    },
    compareObject : function(objA,objB) {

        var i,a_type,b_type;

        // Compare if they are references to each other 
        if (objA === objB) { return true;}

        if (Object.keys(objA).length !== Object.keys(objB).length) { return false;}
        for (i in objA) {
            if (objA.hasOwnProperty(i)) {
                if (typeof objB[i] === 'undefined') {
                    return false;
                }
                else {
                    a_type = Object.prototype.toString.apply(objA[i]);
                    b_type = Object.prototype.toString.apply(objB[i]);

                    if (a_type !== b_type) {
                        return false; 
                    }
                }
            }
            if ($.compare(objA[i],objB[i]) === false){
                return false;
            }
        }
        return true;
    },
    strPad : function(i,l,s) {
		var o = i.toString();
		if (!s) { s = '0'; }
		while (o.length < l) {
			o = s + o;
		}
		return o;
	}
});

function unmake_ws_times(obj) {
	// var obj = obj.split('|');
	sh = obj[0].split(':')[0];
	sm = obj[0].split(':')[1];
	eh = obj[1].split(':')[0];
	em = obj[1].split(':')[1];
	return [sh,sm,eh,em];
}

function make_ws_times(sh,sm,eh,em) {
	return sh + ':' + sm + '|' + eh + ':' + em;
}

var translate = {
	'–':'&ndash;','—':'&mdash;','¡':'&iexcl;','¿':'&iquest;','´':"'",'`':"'",'“':'"','”':'"','‘':"'",'’':"'",'«':'&laquo;','»':'&raquo;','&':'&amp;','¢':'&cent;','©':'&copy;','÷':'&divide;','µ':'&micro;','·':'&middot;','¶':'&para;','±':'&plusmn;','€':'&euro;','£':'&pound;','®':'&reg;','§':'&sect;','™':'&trade;','¥':'&yen;','á':'&aacute;','Á':'&Aacute;','à':'&agrave;','À':'&Agrave;','â':'&acirc;','Â':'&Acirc;','å':'&aring;','Å':'&Aring;','ã':'&atilde;','Ã':'&Atilde;','ä':'&auml;','Ä':'&Auml;','æ':'&aelig;','Æ':'&AElig;','ç':'&ccedil;','Ç':'&Ccedil;','é':'&eacute;','É':'&Eacute;','è':'&egrave;','È':'&Egrave;','ê':'&ecirc;','Ê':'&Ecirc;','ë':'&euml;','Ë':'&Euml;','í':'&iacute;','Í':'&Iacute;','ì':'&igrave;','Ì':'&Igrave;','î':'&icirc;','Î':'&Icirc;','ï':'&iuml;','Ï':'&Iuml;','ñ':'&ntilde;','Ñ':'&Ntilde;','ó':'&oacute;','Ó':'&Oacute;','ò':'&ograve;','Ò':'&Ograve;','ô':'&ocirc;','Ô':'&Ocirc;','ø':'&oslash;','Ø':'&Oslash;','õ':'&otilde;','Õ':'&Otilde;','ö':'&ouml;','Ö':'&Ouml;','ß':'&szlig;','ú':'&uacute;','Ú':'&Uacute;','ù':'&ugrave;','Ù':'&Ugrave;','û':'&ucirc;','Û':'&Ucirc;','ü':'&uuml;','Ü':'&Uuml;','ÿ':'&yuml;','•':'','º':'&deg;',
};
var translate_html = {
'>':'&gt;','<':'&lt;','	':'',
}


//Clean String Function
function text_to_html(str,allow_html,add_p) {
	allow_html = typeof allow_html !== 'undefined' ? allow_html : false;
	add_p = typeof add_p !== 'undefined' ? add_p : false;
	
	var aStr = str.trim().split('');
	var i = aStr.length;
	var aRet = [];

	while (--i >= 0) {
		var iC = aStr[i];
		var iC_val = aStr[i].charCodeAt();
		if	(iC in translate) {
			aRet.push(translate[iC]);
		}
		else if (!allow_html && (iC in translate_html)) {
			aRet.push(translate_html[iC]);
		}
		else {
			aRet.push(aStr[i]);
		}
	}
	var out = aRet.reverse().join('');
	
	//Add p
	if (add_p) {
		out = '<p>' + out.split(/\r\n|\r|\n/g).join('</p>\n\n<p>') + '</p>';
		out = out.replace(/<p>	(.*?)<\/p>\n\n/gi,"\t<li>$1</li>\n");
		out = out.replace(/<p><\/p>\n\n/gi,'').replace(/<p>\s<\/p>\n\n/gi,'');
	}
	
	return out;
}

function text_remove_accent(str) {
	var rExps=[
		{re:/[\xC0-\xC6]/g, ch:'A'},
		{re:/[\xE0-\xE6]/g, ch:'a'},
		{re:/[\xC8-\xCB]/g, ch:'E'},
		{re:/[\xE8-\xEB]/g, ch:'e'},
		{re:/[\xCC-\xCF]/g, ch:'I'},
		{re:/[\xEC-\xEF]/g, ch:'i'},
		{re:/[\xD2-\xD6]/g, ch:'O'},
		{re:/[\xF2-\xF6]/g, ch:'o'},
		{re:/[\xD9-\xDC]/g, ch:'U'},
		{re:/[\xF9-\xFC]/g, ch:'u'},
		{re:/[\xD1]/g, ch:'N'},
		{re:/[\xF1]/g, ch:'n'},
	];

	for(var i = 0, len = rExps.length; i < len; i++) {
		str = str.replace(rExps[i].re, rExps[i].ch);
	}
	return str;
}

function number_format(number, decimals, dec_point, thousands_sep) {
	number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
	var n = !isFinite(+number) ? 0 : +number,
	prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
	sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
	dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
	s = '',
	toFixedFix = function (n, prec) {
		var k = Math.pow(10, prec);
		return '' + Math.round(n * k) / k;
	};
	// Fix for IE parseFloat(0.55).toFixed(0) = 0;
	s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
	if (s[0].length > 3) {
		s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
	}
	if ((s[1] || '').length < prec) {
		s[1] = s[1] || '';
		s[1] += new Array(prec - s[1].length + 1).join('0');
	}
	return s.join(dec);
}

Date.prototype.yyyymmdd = function(c) {
	c = typeof c === 'undefined' ? '' : c;
	var yyyy = this.getFullYear().toString();
	var mm = (this.getMonth()).toString(); // getMonth() is zero-based
	var dd  = this.getDate().toString();
	return yyyy + c + (mm[1]?mm:"0"+mm[0]) + c + (dd[1]?dd:"0"+dd[0]); // padding
};

Date.prototype.getMonthString = function() {
	var month_names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];	
	return month_names[this.getMonth()];
};

Date.prototype.fjy = function() {
	return this.getMonthString() + ' ' + this.getDate().toString() + ', ' + this.getFullYear().toString();
};

Date.prototype.getWeekNumber = function(){
    var d = new Date(+this);
    d.setHours(0,0,0);
    d.setDate(d.getDate()+4-(d.getDay()||7));
    return Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7)+1)/7);
};

Date.prototype.getWeekSpan = function() {
	var year = this.getFullYear()
	var wn = this.getWeekNumber()
    var j10 = new Date(year,0,10,12,0,0);
	var j4 = new Date(year,0,4,12,0,0);
	var mon1 = j4.getTime() - j10.getDay() * 86400000;
	
	var d1 = new Date(mon1 + ((wn - 1)  * 7) * 86400000);
	var d7 = new Date(mon1 + ((wn - 1)  * 7 + 6) * 86400000);
	
    return d1.getMonthString() + ' ' + d1.getDate() + (d1.getFullYear() != d7.getFullYear() ? ', ' + d1.getFullYear() : '') + ' &ndash; ' + d7.getMonthString() + ' ' + d7.getDate() + ', ' + d7.getFullYear();
};

function day_difference(first, second) {
    return (second-first)/(1000*60*60*24);
}

function countProperties(obj) {
    return Object.keys(obj).length;
}

function getQueryVariable(search,string) {
	search = typeof search !== 'undefined' ? search : false;
	if (typeof string !== 'undefined') {
		var query = string;
	} else {
		var query = window.location.search.substring(1);
	}
	var vars = query.split("&");
	var obj = {};
	
	for (var i = 0; i < vars.length; i++) {
		var item = vars[i].split('=');
		var key = item[0];
		var val = item[1];
		
		if (key.substr(-2,2) == '[]') { //array
			k = key.replace(key.substr(-2,2),'');
			if (k in obj) {
				obj[k].push(val);
			} else {
				obj[k] = [val];
			}
		} else {
			obj[key] = [val];
		}
	}
	
	if (search) {
		return search in obj ? obj[search] : false;
	} else {
		return obj;
	}
}

function get_permission() {
	var arr = ($('body').attr('class')).split(' ');
	for (var i in arr) {
		var p = (arr[i]).split('_');
		if (p[0] == 'permission') {
			return p[1]; 
		}
	}
}

function datetimeToTime(timestamp) {
  var regex=/^([0-9]{2,4})-([0-1][0-9])-([0-3][0-9]) (?:([0-2][0-9]):([0-5][0-9]):([0-5][0-9]))?$/;
  var parts=timestamp.replace(regex,"$1 $2 $3 $4 $5 $6").split(' ');
  return new Date(parts[0],parts[1]-1,parts[2],parts[3],parts[4],parts[5]);
}

function isEmpty(obj) {
    if (obj == null) return true;
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }
    return true;
}

function colorLuminance(hex, lum) {
	// validate hex string
	hex = String(hex).replace(/[^0-9a-f]/gi, '');
	if (hex.length < 6) {
		hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	}
	lum = lum || 0;

	// convert to decimal and change luminosity
	var rgb = "#", c, i;
	for (i = 0; i < 3; i++) {
		c = parseInt(hex.substr(i*2,2), 16);
		c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
		rgb += ("00"+c).substr(c.length);
	}

	return rgb;
}
function rgbToHex(rgb) {
    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    function hex(x) {
        return ("0" + parseInt(x).toString(16)).slice(-2);
    }
    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

function calendar_links(subj) { //NWASAP...make into class function
	var i = 0;
	$('.calendar_trigger',subj).each(function() {
		i++;
		$(this).attr('data-calid',i);
	}).click(function(e) {
		e.preventDefault();
		var t = $(this);
		var off = t.offset();
		var id = $(t).attr('data-calid');
		var max = $(t).attr('data-calmax');
		var inp = $(t).attr('data-calinput');
		inp = $('input[name="' + inp + '"]');
		
		var cal_data = {
			dateFormat: 'yy-mm-dd',
			altField: inp,
			maxPicks: max,
		};
		if ($(inp).val() != '') {
			cal_data['defaultDate'] = $(inp).val();
			cal_data['addDates'] = $(inp).val();	
		}
		
		$(t).toggleClass('active');
		if ($(t).hasClass('active')) {
			var box = $('<div class="calendar_box" data-calid="' + id + '"></div>');
			$(box).multiDatesPicker(cal_data).appendTo('#content').css({
				'top' : off.top,
				'left' : off.left + 30,
			});

			var exit = $('<a class="exit" href="#"></a').click(function(e) { //exit
				e.preventDefault();
				$('.calendar_box[data-calid="' + id + '"]').remove();
				$(t).toggleClass('active');
			})
			$(box).prepend(exit);
		} else {
			$('.calendar_box[data-calid="' + id + '"]').remove();
		}
	});	
}

$(document).ready(function(){	
	var e_t = 300;
	
	$('.date_picker:not(.full)').each(function() {
		$(this).multiDatesPicker({
			dateFormat: 'yy-mm-dd',
			// numberOfMonths: [1,2],
		});
	});

	//Submenu
	$('#submenu li').hover(
		// show its submenu
		function(){ $('ul', this).stop(true,true).slideDown(100); },
		// hide its submenu
		function(){ $('ul', this).stop(true,true).slideUp(100); }
	);
	
	//Sidebar
	$('#sidebar span').click(function() {
		$(this).next().slideToggle(e_t);
	});
		
	//Set ajax parameters
	$(this).ajaxSend(function(e,jqXHR){
		loading_bar.status(1);
	});
	$(this).ajaxComplete(function(e,jqXHR){
		loading_bar.status(0);
	});


});

if (!$.curCSS) {
	$.curCSS = $.css;
}