function Order_Logs(data) {
	data = typeof data === 'undefined' ? {} : data;
	for (var i in data) {
		this[i] = data[i];
	}
	this.init();
}

Order_Logs.prototype = {
	eta: 300,
	init: function() {
		var Obj = this;
		Obj.call();
		$('#sidebar_order_by ul').remove();
		Obj.more();
	},
	log: {},
	call: function(item,start,more) {
		var Obj = this;
		var school = 'arcitura';
		item = typeof item === 'undefined' ? false : item;
		start = typeof start === 'undefined' ? 0 : start;
		more = typeof more === 'undefined' ? false : more;
		
		if (item && item in Obj.log) {
			var response = Obj.log[item];
			Obj.item(item,school,response);
			$('.order_slide').slideUp(Obj.eta,function() {
				$(this).hide();
			});
			$('#order_' + item.replace(/[^a-zA-Z0-9]+/g,'') + ' .order_slide').slideDown(Obj.eta);
		}
		else if (!item && 'list' in Obj.log && !more) { //see if list up until then already generated
			var response = Obj.log['list'];
			Obj.list(school,response);
		}
		else {
			$.ajax({
				url: 'ajax/get_orders/' + (item ? item : ''),
				crossDomain: true,
				type: 'POST',
				data: {
					pass: '888wsy1qz',
					start: start,
				},
				cache: false,
				success: function(response) {
					if (item) { //single
						Obj.log[item] = response;
						Obj.item(item,school,response);
						$('.order_slide').slideUp(Obj.eta,function() {
							$(this).hide();
						});
						$('#order_' + Obj.log_string(item) + ' .order_slide').slideDown(Obj.eta);
					} else { //list
						var response = $.parseJSON(response);
						var response_r = response.result;
						Obj.end = response.end;
						
						Obj.list(school,response_r);
					}
					console.log(Obj.log);
				},
				error:	function(jqXHR,textStatus,errorThrown){
					$('#order_list').empty()
					console.log(jqXHR);
				}
			});
		}
	},
	list: function(school,response) {
		var Obj = this;
		
		//Loop
		for (var i in response) {
			//Put out list


		}
		
		if (!Obj.end) {
			$('#more_orders').removeClass('hide');
		} else {
			$('#more_orders').addClass('hide');
		}
		
		//Generate Block
		$('#order_list').fuzz();
		// Obj.Edit.init();
	},
	more: function() {
		var Obj = this;
		$('#more_orders').click(function(e) {
			e.preventDefault();
			Obj.call(false,$('#order_list .cert_row').length,true);
		});
	},
	bind_call_item: function() {
		var Obj = this;
	},
	item: function(id,school,response) {
		var Obj = this;
		response = response.replace(/width="750"/g,'width="100%"').replace(/width="800"/g,'width="100%"');
		$('#order_' + Obj.log_string(id) + ' .order_slide').empty().append($(response));
	},
	log_string: function(x) {
		return x.replace(/[^a-zA-Z0-9]+/g,'');
	}
};

$(document).ready(function() {
	var Process = new Process_Tabs({
		init_row: function(subj,id,callback) { //init all
			/*if (id in Logs.logs) { //already have data on row
				callback(subj);
			} else { //already have data on row
			*/	$.ajax({
					url: 'ajax/get_logs/' + id,
					success: function(response) {
						var data = $.parseJSON(response);
						Logs.logs[id] = data;
						
						callback(subj);
					},
				});
			// }
		},		
	});
	
	var Edit = new Edit_Tabs({ //edit_tabs.js
		append_to: 'cert_row',
		process: Process,
	});

	var Logs = new Order_Logs({
		Edit: Edit,
	});
});