function Sort_Tabs(data) {
	data = typeof data === 'undefined' ? {} : data;
	for (var i in data) {
		this[i] = data[i];
	}
	
	this.init(); //Init
}

Sort_Tabs.prototype = {
	active: [],
	count: {},
	sidebar: '#sidebar_order_by',
	box: '#workshops_home',
	sub_box: '.edit_slide',
	item: '.workshop_home_item',
	init: function(options) {
		var Obj = this;
		$(Obj.sidebar + ' a').click(function(e) {
			e.preventDefault();
			Obj.click(this);
		});
		$(Obj.sidebar + ' a[href="all"]').addClass('active');
		
		var query = new QueryData(location.search, true);
		// console.log(d);

		if ('sort_by[]' in query) { //by GET script.js
			console.log(query);
			Obj.active = query['sort_by[]']; //getQueryVariable('sort_by');
			Obj.highlight();
			Obj.sort();
			Obj.bind_click();
		}
	},
	sort: function() {
		var Obj = this;
		var s = Obj.active.join('.');
		s = s != '' ? '.' + s : '';
		
		$(Obj.box).fuzz();
		$(Obj.sub_box).remove();
		$(Obj.item).show().find('.sp').removeClass('active');
		if (Obj.active.length !== 0) {
			$(Obj.item + ':not(' + s + ')').hide();
		}
		
		Obj.links();
	},
	links: function() { //header links
		var Obj = this;
		$('#sort_by_filters').html('');
		var url = '';
		for (var k in Obj.active) {
			var txt = $(Obj.sidebar + ' a[href="' + Obj.active[k] + '"]').parent().text();
			$('<a class="button" href="' + Obj.active[k] + '">' + txt + ' x</a>').appendTo('#sort_by_filters');
			url += (k != 0 ? '&' : '') + 'sort_by[]=' + Obj.active[k];
		}
		window.history.pushState("object or string", "Title", (url == '' ? window.location.href.split('?')[0] : '?' + url));
	},
	click: function(t) {
		var Obj = this;
		if (typeof ws_search !== 'undefined') {
			// ws_search.deactivate(); //ws_search.js
		}
	
		var href = $(t).attr('href');
		var href_ext = href.substr(0,5);

		if (href == 'all') { //set all
			Obj.active = [];
		}
		else {
			if ($.inArray(href,Obj.active) != -1) { //in already, remove
				Obj.active.splice($.inArray(href,Obj.active),1);
			}
			else {
				for (var key in Obj.active) { //remove all in family
					var ext = Obj.active[key].substr(0,5);
					if (ext == href_ext) {
						Obj.active.splice(key,1);
					}
				}
				Obj.active.push(href);
			}
		}
		
		Obj.highlight();
		Obj.sort();
		Obj.bind_click();
	},
	bind_click: function() {
		var Obj = this;
		$('#sort_by_filters a').bind('click',function(e) {
			e.preventDefault();
			Obj.click(this);
		});
	},
	make_count: function() { //make
		var Obj = this;
		Obj.count = {};
		$(Obj.item).each(function() {
			var c = $(this).attr('class').split(' ');
			for (var k in c) {
				Obj.count.hasOwnProperty(c[k]) ? Obj.count[c[k]]++ : Obj.count[c[k]] = 1;
			}
		});
	},
	apply_count: function() {
		var Obj = this;
		$(Obj.sidebar + ' a:not([href="all"]) span').text(0).parent().parent().hide();
		for (k in Obj.count) {
			$(Obj.sidebar + ' a[href="' + k + '"] span').text(Obj.count[k]).parent().parent().show();
		}
		$(Obj.sidebar + ' a[href="all"] span').text(Obj.count.workshop_home_item); //all
		Obj.links(); //update quick links
		Obj.bind_click(); //update quick links
	},
	update_sidebar: function() {
		this.make_count();
		this.apply_count();
	},
	highlight: function() {
		var Obj = this;
		$(Obj.sidebar + ' a').removeClass('active');
		if (Obj.active.length === 0) {
			$(Obj.sidebar + ' a[href="all"]').addClass('active');
		}
		else {
			for (var k in Obj.active) {
				$(Obj.sidebar + ' a[href="' + Obj.active[k] + '"]').addClass('active');
			}
		}
	},
	exit: function() {
		var Obj = this;
		Obj.active = [];
		Obj.highlight();
		Obj.sort();
		Obj.bind_click();
	},
};