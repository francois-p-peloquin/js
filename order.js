function Order_Logs(data) {
	data = typeof data === 'undefined' ? {} : data;
	for (var i in data) {
		this[i] = data[i];
	}
	this.init();
};

Order_Logs.prototype = {
	eta: 300,
	box: 'order_logs',
	item: 'cert_row',
	more_trig: 'more_orders',
	init: function() {
		var Obj = this;
		Obj.Edit.parts['prev'] = function() { return $('');	} //add simple empty form
		var init_f = function() {
			Obj.load(function(response) {
				var response = $.parseJSON(response);
				if (!response['last']) {
					$('#' + Obj.more_trig ).remove();
					$('<a id="' + Obj.more_trig + '" href="#">more orders...</a>').insertAfter('#' + Obj.box).hide().slideDown(Obj.eta).click(function(e) {
						e.preventDefault();
						var a = this;
						var count = $('#' + Obj.box + ' .' + Obj.item).length;
						Obj.load(function(response,count) {
							var response = $.parseJSON(response);
							if (response['last']) {
								$(a).slideUp(Obj.eta);
							}
							Obj.list(response['list']);
							$('#' + Obj.box).fuzz();
						},false,count);				
					});
				}
				Obj.list(response['list']);
				$('#' + Obj.box).fuzz();
			});
		}
		init_f();
		
		$('<a href="#" id="refresh_orders" class="button">Refresh Orders<span></span></a>').click(function(e) {
			e.preventDefault();
			$('#' + Obj.box).empty();
			Obj.log = {};
			init_f();
		}).appendTo('#sort_by_filters');
	},
	load: function(callback,req,start) {
		var Obj = this;
		req = typeof req === 'undefined' ? false : req;
		start = typeof start === 'undefined' ? 0 : start;
		
		var data = {};
		if (!req) {
			data['start'] = start;
		}
		
		$.ajax({
			url: 'ajax/get_order_logs/' + (req ? req : ''),
			cache: false,
			data: data,
			success: function(response) {
				callback(response);
			}
		});	
	},
	list: function(list) {
		var Obj = this;
		var week = -1;
		var now = new Date();
		var permission = get_permission();
		now.setHours(now.getHours() - 3);
		
		for (var i in list) {
			var tmp_arr = list[i];
			
			var d = tmp_arr['time'].split(/[- :]/);
			d = new Date(d[0],d[1]-1,d[2],d[3],d[4],d[5]);
			d.setHours(d.getHours() - 3);
			if (d.getWeekNumber() != week) {
				if ($('.week_' + d.getWeekNumber()).length < 1) {
					$('#' + Obj.box).append('<div class="week_break week_' + d.getWeekNumber() + '">' + d.getWeekSpan() + '</div>');
					week = d.getWeekNumber();
				}
			}
			
			var n = [tmp_arr['first_name'] + ' ' + tmp_arr['last_name']];
			if (tmp_arr['organization'] != '') {
				n.push(tmp_arr['organization'])
			}
			n.push(tmp_arr['country']);
			
			var li = $('<div id="order_' + tmp_arr['id'] + '" class="' + Obj.item + ' school_' + tmp_arr['school'] + ' process_' + tmp_arr['processed'] + ' cancel_' + tmp_arr['cancel'] + (Math.floor(day_difference(d,now)) > 3 ? ' overdue' : '') + '" data-id="' + tmp_arr['id'] + '"><ul class="body"></ul></div>');
			$('.body',li).append('<li class="title"><h3>' + schools[tmp_arr['school']]['title'] + ' School Order &ndash; <span>' + n.join(', ') + '</span></h3></li>');
			var title = [
				'Order ID ' + tmp_arr['order_id'],
				d.fjy() + ' (' + d.toLocaleTimeString() + ')',
			];
			$('.title',li).append('<span>' + title.join('</span> &ndash; <span>') + '</span>');
			$('.body',li).append('<li class="links"></li>');
			var ul = $('<ul></ul>');
			if (permission == 0) {
				$(ul).append('<li><a class="sp sp_delete" data-slide="delete_order" href="#" title="Delete Order"></a></li>');
			}
			$(ul).append('<li><a class="sp sp_prev" data-slide="prev" href="#" title="View Log"></a></li>');
			$(ul).append('<li><a class="sp sp_success ' + (tmp_arr['cancel'] == 1 ? 'hide' : '') + '" data-slide="process_order" href="#" title="Mark Processed/Unprocessed"></a></li>');
			$(ul).append('<li><a class="sp sp_cancel" data-slide="cancel_order" href="#" title="Mark Canceled/Uncanceled"></a></li>');
			$(ul).append('<li><a class="sp_down" target="_blank" href="ajax/get_order_pdf/' + tmp_arr['id'] + '?title=' + schools[tmp_arr['school']]['title'] + ' School Order - ' + n.join(', ') + ' - ' + title.join(' - ') + '" title="Create PDF"></a></li>');
			$('li.links',li).append(ul);
			$('#' + Obj.box).append(li);
			
			Obj.Edit.click('#order_' + tmp_arr['id']); //events
		}
	},
	log: {}
};

$(document).ready(function() {
	var Process = new Process_Tabs({
		init_prev: function(subj,id) {
			var Obj = this;
			if (id in Order.log) {
				Edit.ease_height(id,0);;
				$(subj).html(Order.log[id]);
				Edit.ease_height(id,1);
			}
			else {
				$(subj).addClass('loading');
				Order.load(function(res) {
					Order.log[id] = res;
					$(subj).removeClass('loading').html(res);
					Edit.ease_height(id,1);
				},id);
			}
			
			return subj;
		},
		init_process_order: function(subj,id) {
			var Obj = this;
			var option = $(Edit.cur_string(id)).hasClass('process_0');
			$('div.' + (option ? 'no' : 'yes'),subj).hide();
			
			Obj.binary(subj,id,function() {
				$.ajax({
					url: 'ajax/process_order/' + id,
					cache: false,
					beforeSend: function() {
						Obj.status(subj,1);
					},
					success: function(response) {
						var c = ($(Edit.cur_string(id)).attr('class')).split(' ');
						for (var i in c) {
							var c_s = c[i].substring(0, c[i].length - 1);
							if (c_s == 'process_') {
								c[i] = c_s + response;
							}
						}
						$(Edit.cur_string(id)).attr('class',c.join(' '));
						delete Order.log[id];
						Obj.status(subj,2);
						var t = Obj.success_pause(function() {
							$(Edit.cur_string(id) + ' .' + Edit.slide_class).slideUp(Edit.eta,function() {
								$(this).remove();
							});
							$(Edit.cur_string(id) + ' .' + Edit.trigger_class).removeClass('active');
						});
					},
					error: function() {
						Obj.status(subj,-1);
					}		
				});
			});
			return subj;
		},
		init_cancel_order: function(subj,id) {
			var Obj = this;
			var option = $(Edit.cur_string(id)).hasClass('cancel_0');
			$('div.' + (option ? 'no' : 'yes'),subj).hide();

			Obj.binary(subj,id,function() {
				$.ajax({
					url: 'ajax/cancel_order/' + id,
					cache: false,
					beforeSend: function() {
						Obj.status(subj,1);
					},
					success: function(response) {
						var c = ($(Edit.cur_string(id)).attr('class')).split(' ');
						for (var i in c) {
							var c_s = c[i].substring(0, c[i].length - 1);
							if (c_s == 'cancel_') {
								c[i] = c_s + response;
							}
						}
						$(Edit.cur_string(id)).attr('class',c.join(' '));
						delete Order.log[id];
						Obj.status(subj,2);
						var t = Obj.success_pause(function() {
							$(Edit.cur_string(id) + ' .' + Edit.slide_class).slideUp(Edit.eta,function() {
								$(this).remove();
							});
							$(Edit.cur_string(id) + ' .' + Edit.trigger_class).removeClass('active');
						});
						
						if (response == 1) {
							$(Edit.cur_string(id) + ' .links .sp_success').addClass('hide');
						} else {
							$(Edit.cur_string(id) + ' .links .sp_success').removeClass('hide');
						}
					},
					error: function() {
						Obj.status(subj,-1);
					}		
				});
			});
			return subj;
		},
		init_delete_order: function(subj,id) {
			var Obj = this;
			Obj.binary(subj,id,function() {
				Obj.archive(subj,id,'delete');
			});
			return subj;
		},
		archive: function(subj,id,version) {
			var Obj = this;
			version = typeof version === 'undefined' ? 'delete' : version;
			$.ajax({
				url: 'ajax/delete_order/' + id,
				cache: false,
				beforeSend: function() {
					Obj.status(subj,1);
				},
				success: function(response) {
					if (response != '1') {
						alert(response);
						Obj.status(subj,-1);
					}
					else {
						Obj.status(subj,2);
						var t = Obj.success_pause(function() {
							$(Edit.cur_string(id)).slideUp(Edit.eta,function() {
								$(this).remove();
							});
						});
					}
				},
				error: function() {
					Obj.status(subj,-1);
				}
			});
		},
		binary: function(subj,id,yes,no) {
			var Obj = this;
			$('.yes',subj).click(function(e) {
				e.preventDefault();
				yes();
			});
			$('.no',subj).click(function(e) {
				e.preventDefault();
				if (typeof no === 'undefined') {
					Edit.remove(id);
					$(Edit.cur_string(id) + ' .' + Edit.trigger_class).removeClass('active');
				} else {
					no();
				}
			});
		},
		success_pause: function(callback,time) {
			time = typeof time === 'undefined' ? 1000 : time;
			var t = setTimeout(function() {
				callback();
			},time);
			return t;
		},
	});
	
	var Edit = new Edit_Tabs({
		append_to: 'cert_row',
		trigger_class: 'sp',
		process: Process,
	});

	var Order = new Order_Logs({
		Edit: Edit,
	});
});