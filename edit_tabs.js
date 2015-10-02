function Process_Tabs(data) {
	data = typeof data === 'undefined' ? {} : data;
	for (var i in data) {
		this[i] = data[i];
	}
}

Process_Tabs.prototype = {
	status: function(subj,st,class_ovr) {
		st = st == -1 ? 3 : st;
		class_ovr = typeof class_ovr === 'undefined' ? '.loading_small' : class_ovr;
		var status = ['','loading','success','failure',];
		
		for (var i in status) {
			$(class_ovr,subj).removeClass(status[i]);
		}
		$(class_ovr,subj).addClass(status[st]);
	},
	
	//Override, event listeners
	init_row: function(subj,id,callback) { callback(subj); },
	deactivate_other: function(id) {},
};

function Edit_Tabs(data) {
	data = typeof data === 'undefined' ? {} : data; //Defining default variables
	for (var i in data) {
		this[i] = data[i];
	}
	
	this.init(); //Init
}

Edit_Tabs.prototype = {
	init: function() {
		var Obj = this;
		this.click();
	},
	eta: 300,
	eta_long: 500,
	parts: {},
	trigger_class: 'sp',
	append_to: 'workshop_home_item',
	id_attr: 'data-id',
	type_attr: 'data-slide',
	slide_class: 'edit_slide',
	slide_cont_class: 'edit_slide_guts',
	box: function() {
		return $('<div class="edit_slide"></div>');
	},
	box_content: function() {
		return $('<div class="edit_slide_guts"></div>');
	},
	get_id: function(subj) {
		return $(subj).parent().parent().parent().parent().parent().attr('data-id');
	},
	cur_string: function(id) {
		return String('.' + this.append_to + '[' + this.id_attr + '="' + id + '"]');
	},
	trig_index: function(trig) {
		return $(trig).parent().parent().children().index($(trig).parent());
	},
	process: new Process_Tabs(), //this will act on processes
	click: function(subj) {
		var Obj = this;
		subj = typeof subj === 'undefined' ? '.' + this.append_to : subj;
		$(subj + ' .' + this.trigger_class).click(function(e) {
			e.preventDefault();
			e.stopPropagation();
			var id = Obj.get_id(this);
			var type = $(this).attr(Obj.type_attr);
			
			if (!$(this).hasClass('active')) { //init
				Obj.process.deactivate_other(id);
				var trig_old_i = Obj.trig_index($(Obj.cur_string(id) + ' .' + Obj.trigger_class + '.active'));
				var trig_new_i = Obj.trig_index(this);
				var slide_dir = trig_old_i != -1 ? trig_old_i - trig_new_i : false; //false or number of slides over

				Obj.remove(id,'.' + Obj.append_to + ':not(' + Obj.cur_string(id) + ')');
				$(this).addClass('active');				
				Obj.load(type,id,slide_dir);
			}
			else { //close
				$(this).removeClass('active');
				Obj.remove(id);
			}
		});
	},
	load: function(type,id,slide_dir) {
		type = typeof type === 'undefined' ? 'quick' : type;
		var Obj = this;
		if (!slide_dir) {
			$(Obj.cur_string(id) + ' .' + Obj.slide_class).remove();
			var box = new Obj.box();
			var box_content = new Obj.box_content();
			$(box_content).addClass('loading');
			$(box).append(box_content).appendTo(Obj.cur_string(id)).css({ height: 'auto' }).slideDown(Obj.eta);
		}
		
		if (type in Obj.parts) {
			Obj.place(type,id,slide_dir);
		} 
		else {
			$.ajax({
				url: 'ajax/get_quick_edit_form/' + type,
				beforeSend: function() {
				},
				success: function(response) {
					Obj.parts[type] = function() { //store response as builder function
						return $(response);
					};
					Obj.place(type,id,slide_dir);
				},
			});
		}		
	},
	place: function(type,id,slide_dir) {
		var Obj = this;
		var form = new Obj.parts[type];
		var box_content = new Obj.box_content();
		$(box_content).append(form);
		Obj.ease_height(id,0);
		
		Obj.process.init_row(box_content,id,function(box_content) { //Over
			if ('init_' + type in Obj.process) {
				box_content = Obj.process['init_' + type](box_content,id);
			}
			$(Obj.cur_string(id) + ' .' + Obj.slide_class).removeClass('loading');
					
			var cur_slide = $(Obj.cur_string(id) + ' .' + Obj.slide_cont_class);
			var old_h = $(cur_slide).innerHeight();
			if (slide_dir) { //shift over
				Obj.ease_height(id,0);
				var dir = slide_dir > 0 ? -1 : 1;
				
				$(cur_slide).addClass('old').animate({ //move cur out, remove
					left: "-=" + ($(cur_slide).width() * dir),
				}, Obj.eta_long, function() {
					$(this).remove();
				});
				
				$(box_content).addClass('new').appendTo(Obj.cur_string(id) + ' .' + Obj.slide_class).css({  //move new in
					left: $(cur_slide).width() * dir,
				}).animate({
					left:0,
				}, Obj.eta_long, function() {
					$(this).removeClass('new');
				});
			} 
			else { //whole new world
				$(Obj.cur_string(id) + ' .' + Obj.slide_class).html(box_content);//$(box_content).appendTo(Obj.cur_string(id) + ' .' + Obj.slide_class);
			}
			Obj.ease_height(id,1);
		});
	},
	ease_height: function(id,status) {
		var Obj = this;
		var item = Obj.cur_string(id) + ' .' + Obj.slide_class;
		var h = $(item).find('.' + Obj.slide_cont_class + ':not(.old)').innerHeight();
		if (status == 0) { //lock height
			$(item).stop().css({
				height: h,
			});
		} else if (status == 1) { //ease height
			$(item).stop().animate({
				height: h,
			}, Obj.eta_long, function() {
				$(item).removeAttr('style');//.css({ height: 'auto' });
			});
		}
	},
	remove: function(id,subj) {
		var Obj = this;
		subj = typeof subj === 'undefined' ? this.cur_string(id) : subj;
		$(subj + ' .' + this.slide_class).slideUp(this.eta,function() {
			$(this).remove();
		});
		var trig = $('.' + Obj.append_to + ' .' + Obj.trigger_class);
		$(trig).removeClass('active');
	},
};