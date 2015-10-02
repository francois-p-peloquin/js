function Search_Tabs(data) {
	data = typeof data === 'undefined' ? {} : data;
	for (var i in data) {
		this[i] = data[i];
	}
	
	this.init(); //Init
}

Search_Tabs.prototype = {
	count: 0,
	search_attr: 'data-search',
	id_attr: 'data-id',
	search_field: 'ws_search',
	exit_id: 'ws_search_exit',
	item_id: 'search_sort',
	empty: '#sort_by_filters',
	box: '#workshops_home',
	item: 'workshop_home_item',
	slide_class: 'edit_slide',
	slide_cont_class: 'edit_slide_guts',
	init: function() {
		$('#' + this.search_field).val('');
		this.type();

		var query = new QueryData(location.search, true); //by GET get_data.js
		if ('search' in query) { //script.js
			var q = query['search'][0];
			$('#' + this.search_field).val(q);
			this.search(q);
		}
	},
	type: function() {
		var Obj = this;
		$('#' + Obj.search_field).keyup(function(e) {
			if ((e.which <= 90 && e.which >= 48) || e.which == 32 || e.which == 8 || e.which == 109 || e.which == 46) {
				var q = $(this).val();
				if (q == '') {
					$(this).removeClass('error');
					Obj.exit();
				} else {
					Obj.delay(function(){
						Obj.search(q);
					},200);
				}
				Obj.deactivate_other();
			}
		});
	},
	delay: (function(){
		var timer = 0;
		return function(callback,ms){
			clearTimeout(timer);
			timer = setTimeout(callback,ms);
		};
	})(),
	search: function(q) {
		Obj = this;
		Obj.count++;
		$(Obj.empty).empty();
		
		//Fire
		var result = Obj.find_item(q);
		if (!result) {
			$('#' + Obj.search_field).addClass('error');
			Obj.place_exit(q);
			Obj.exit(q);
		} else {
			$(Obj.box).fuzz();
			Obj.place_exit(q);
			$('.' + Obj.item).show().not('[' + Obj.id_attr + '="' + result.join('"], [' + Obj.id_attr + '="') + '"]').hide();
			$('#' + Obj.search_field).removeClass('error');
		}
		$('.' + Obj.slide_class,Obj.box).remove();
		$('a.sp',Obj.box).removeClass('active');
		$('#sidebar_order_by a.active').removeClass('active');
		window.history.pushState("object or string",'Search: ' + q, '?search=' + q);
	},
	exit: function() {
		var Obj = this;
		$(Obj.box).fuzz();
		$('.' + Obj.item).show();
		$('.' + Obj.slide_class,Obj.box).remove();
		$('a.sp',Obj.box).removeClass('active');
		window.history.pushState("object or string", "Empty Seach", window.location.href.split('?')[0]); //empty
	},
	place_exit: function(q) {
		var Obj = this;
		$('<a class="button" id="' + Obj.item_id + '" href="#">Search "' + q + '" x</a>').click(function(e) {
			e.preventDefault();
			Obj.exit();
			$(this).remove();
			$('#' + Obj.exit_id).remove();
			$('#' + Obj.search_field).val('').removeClass('error');
		}).appendTo('#sort_by_filters');
		
		if ($('#' + Obj.exit_id).length == 0) {
			$('<a href="#" id="' + Obj.exit_id + '">x</a>').insertAfter('#' + Obj.search_field).click(function(e) {
				e.preventDefault();
				Obj.exit();
				$(this).remove();
				$('#' + Obj.item_id + '').remove();
				$('#' + Obj.search_field).val('').removeClass('error');
			});
		}
	},
	find_item: function(q) {
		var Obj = this;
		var result = [];
		q = Obj.search_string(q);
		$('[' + Obj.search_attr + '~="' + q + '"]').each(function() {
			result.push($(this).attr(Obj.id_attr));
		});
		if (result.length != 0) {
			return result;
		}
		else {
			return false;
		}
	},
	search_string: function(q) {
		return (q).toLowerCase().trim().replace(/\s/g,'_');
	},
	deactivate_other: function() {},
	deactivate: function() {
		var Obj = this;
		$('#' + Obj.exit_id).remove();
		$('#' + Obj.search_field).val('').removeClass('error');
		$('#' + Obj.item_id + '').remove();
	},
};