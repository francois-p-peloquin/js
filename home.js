$(document).ready(function(){	
	wsd_list = {};
	
	var Process = new Process_Tabs({ //edit_tabs.js
		/* PROCESS FORMS */
		init_row: function(subj,id,callback) { //init all
			if (id in wsd_list) { //already have data on row
				callback(subj);
			} else { //already have data on row
				$.ajax({
					url: 'ajax/get_row/' + id,
					success: function(response) {
						var data = $.parseJSON(response);
						if ('extras_check_data' in data && data['extras_check_data'] != '') {
							data['extras_check_data'] = $.parseJSON(data['extras_check_data']);
						} else {
							data['extras_check_data'] = {};
						}
						wsd_list[id] = data;
						
						callback(subj);
					},
				});
			}
		},		
		init_prev: function(subj,id) {
			var Obj = this;
			var num = Obj.bann_num();
			Obj.status(subj,1);
			var c_total = 0, c_complete = 0;
			$('img',subj).each(function() {
				loading_bar.status(1);
				c_total++;
				$(this).attr('src',Obj.get_links($(this).attr('src'),id,num));
				var par = $(this).parent();
				par.hide();
				this.onload = function() {
					loading_bar.status(0);
					// Edit.ease_height(id,1);
					
					// $(Edit.cur_string(id) + ' .' + Edit.slide_cont_class + ':not(.old)').stop().removeAttr('style'); //cut other effects
					var w_m = par.find('.meassure_width i').text(this.width + 'px').parent().css({ width:this.width });
					var h_m = par.find('.meassure_height i').text(this.height + 'px').parent().css({
						width: this.height,
						marginLeft: -(this.height / 2) + 10, //10 is 15 (height of text) - 5 margin
					});
					par.find('.check_row').css({ width: this.width });
					var s = ($(this).attr('data-size')).split(':');
					if (this.width == s[0] && this.height == s[1]) {
						par.find('.check').addClass('success');
					} else {
						par.find('.check').addClass('failure');
					}
					par.fadeIn(500);
					c_complete++;
					if (c_complete == c_total) {
						Obj.status(subj,0);
					}
				}
			});
			$('a.button',subj).each(function() {
				$(this).attr('href',Obj.get_links($(this).attr('href'),id));
			});
			return subj;
		},
		init_reg: function(subj,id) {
			Obj = this;
			var tmp_cert = certifications[wsd_list[id]['cert']];
			var tmp_school = schools[tmp_cert['school']];
			var url = tmp_school['url_secure'] + 'ajax/get_registration_logs/' + id;
			
			if (!('reg_logs' in Obj)) { //build
				Obj['reg_logs'] = {};
			}
			if (!('list' in Obj['reg_logs'])) { //build
				Obj['reg_logs']['list'] = {};
			}
			
			if (id in Obj['reg_logs']['list']) {
				Obj.reg_log_rows(subj,id,Obj['reg_logs']['list'][id]);
			} else {
				$.ajax({
					url: url,
					type: 'POST',
					data: {
						pass: '888wsy1qz',
					},
					beforeSend: function() {
						var li = $('<li>Loading...</li>');						
						$('.log_box',subj).html(li);
					},
					success: function(response) {
						var arr = $.parseJSON(response);
						Obj['reg_logs']['list'][id] = arr;
						$('.log_box',subj).empty();
						if (!isEmpty(arr)) { //list
							Obj.reg_log_rows(subj,id,arr);
						} else {
							$('.log_box',subj).append('<li>There are no registrants for this workshop...</li>');
						}
					}
				});
			}
			
			return subj;
		},
		init_quick: function(subj,id,add) {
			add = typeof add === 'undefined' ? false : true;
			var Obj = this;
			
			$(subj).focus_row();
			
			//Calendar
			var date_input = $('.quick_calendar_input',subj);
			var dp_data = {
				dateFormat: 'yy-mm-dd',
				altField: date_input,
			};
			
			//Time
			var time_fields = ['start_hour','start_minute','end_hour','end_minute'];
			
			if (!add) {
				$('input[type="text"]',subj).each(function() {
					var name = $(this).attr('name');
					$(this).val(wsd_list[id][name]);
				});
				
				$('select',subj).each(function() {
					var name = $(this).attr('name');
					$('option[value="' + wsd_list[id][name] + '"]',this).attr('selected','selected');
				});
			
				//Textareas
				$('textarea',subj).each(function() {
					$(this).text(wsd_list[id][$(this).attr('name')]);
				});
			
				//Checkbox Rows
				for (var field in Obj.check_array) {
					var tmp_field = Obj.check_array[field];
					for (var i in wsd_list[id][tmp_field]) {
						$('input[name="' + tmp_field + '[]"][value="' + wsd_list[id][tmp_field][i] + '"]',subj).prop('checked',true);
					}
				}

				//Extras Data
				for (var i in wsd_list[id]['extras_check_data']) {
					for (var x in wsd_list[id]['extras_check_data'][i]) {
						$('input[name="extras_check_data[' + i + '][' + x + ']"]',subj).val(wsd_list[id]['extras_check_data'][i][x]);
					}
				}
				
				//Dates
				dp_data['defaultDate'] = wsd_list[id]['dates'][0];
				dp_data['addDates'] = wsd_list[id]['dates'];
				$('.dates_row .sp_calendar',subj).click(function(e) {
					e.preventDefault();
					$('.quick_calendar_render',subj).toggle(0,function() {
						if ($('.sp_calendar',subj).hasClass('active')) {
							$('.sp_calendar',subj).removeClass('active');
						} else {
							$('.sp_calendar',subj).addClass('active');
						}
					});
				});
				$('.quick_calendar_render',subj).multiDatesPicker(dp_data).hide();

				//Alt
				if (wsd_list[id]['alt_conversion'] != 0) {
					$('input[name="alternate_price"]',subj).prop('checked',true);
					$('.alternate_price',subj).removeClass('hide').find(':input').removeClass('ignore');
					var n = parseFloat($('input[name="price"]',subj).val()).toFixed(2);
					$('.alt_conversion_display',subj).text('= ' + parseFloat((n * $('input[name="alt_conversion"]',subj).val())).toFixed(2));
				}
				//Convert
				if (wsd_list[id]['price_converter'] != 0) {
					$('input[name="use_price_converter"]',subj).prop('checked',true);
					$('.price_converter_row',subj).removeClass('hide').find(':input').removeClass('ignore');
					var n = parseFloat($('input[name="price"]',subj).val()).toFixed(2);
					$('.alt_conversion_display',subj).text('= ' + parseFloat((n * $('input[name="price_converter"]',subj).val())).toFixed(2));
				}

				//Benefits and Dicounts
				if (wsd_list[id]['benefits_and_discounts'] != 0) {
					$('input[name="benefits_and_discounts"]',subj).prop('checked',true);
					$('.alt_benefits_and_discounts',subj).removeClass('hide').find(':input').removeClass('ignore');
					if (wsd_list[id]['alt_benefits_and_discounts'] != '') {
						$('input[name="alt_benefits_and_discounts"]',subj).text(wsd_list[id]['alt_benefits_and_discounts']);
					}
				}
				
				//Time
				if ((wsd_list[id]['time']).indexOf('|') != -1) { //check that it is correct array as update sets it wrong
					wsd_list[id]['time'] = (wsd_list[id]['time']).split('|');
				}
				var time = unmake_ws_times(wsd_list[id]['time']);
				for (var i = 0;i < time_fields.length;i++) {
					$('select[name="' + time_fields[i] + '"] [value="' + time[i] + '"]',subj).attr('selected','selected');
				}
				
				//Price
				$('.price',subj).each(function() {
					var n = parseFloat($(this).val()).toFixed(2);
					$(this).val(n);
				});
			} else {
				//Calendar
				$('.quick_calendar_render',subj).multiDatesPicker(dp_data).show();
				$('.dates_row .sp_calendar',subj).hide();
			}
			
			
			
			//Price Section
			$('input[name="alternate_price"]',subj).click(function() {
				if ($(this).is(':checked')) {
					$('.alternate_price',subj).removeClass('hide').find(':input').removeClass('ignore');
				} else {
					$('.alternate_price',subj).addClass('hide').find(':input').addClass('ignore');
				}
			});

			$('.price',subj).blur(function() {
				var n = $(this).val() != '' ? $(this).val() : 0;
				n = parseFloat(n).toFixed(2);
				$(this).val(n);
			});
			$('.price, .rate',subj).blur(function() {
				if ($('input[name="alternate_price"]').is(':checked') && $('input[name="price"]').val() != 0) {
					var n = parseFloat($('input[name="price"]').val()).toFixed(2);
					$('.alt_conversion_display',subj).text('= ' + parseFloat((n * $('input[name="alt_conversion"]',subj).val())));
				} else {
					$('.alt_conversion_display',subj).empty();
				}
			});

			//Triggers
			$('input[name="use_price_converter"]',subj).click(function() {
				if ($(this).is(':checked')) {
					$('.price_converter_row',subj).removeClass('hide').find(':input').removeClass('ignore');
				} else {
					$('.price_converter_row',subj).addClass('hide').find(':input').addClass('ignore');
				}
			});
			$('input[name="benefits_and_discounts"]',subj).click(function() {
				if ($(this).is(':checked')) {
					$('.alt_benefits_and_discounts',subj).removeClass('hide').find(':input').removeClass('ignore');
				} else {
					$('.alt_benefits_and_discounts',subj).addClass('hide').find(':input').addClass('ignore');
				}
			});

			$('.trig_next',subj).click(function() {
				var tmp = $(this).next();
				if ($(this).is(':checked')) {
					$(tmp).removeClass('hide').find(':input').removeClass('ignore');
				} else {
					$(tmp).addClass('hide').find(':input').addClass('ignore');
				}
			});

			$('input[name="exam_w_price_trig"],input[name="exam_n_price_trig"]',subj).click(function() {
				var box = $(this).next();
				var name = $(this).attr('name');
				if ($(this).is(':checked')) {
					var tmp_cert = certifications[$('select[name="cert"]').val()];
					var tmp_school = schools[tmp_cert['school']];
					var tmp_mod = (tmp_cert['modules']).split(',');

					for (var i in tmp_mod) {
						var tmp_title = tmp_school['letter'] + '90.' + $.strPad(tmp_mod[i],2);
						var tmp_name = name + '[' + tmp_school['ext'] + '_' + tmp_mod[i] + ']';
						var tmp_item = $('<div class="item"><span>' + tmp_title + '</span></div>');
						var tmp_check = $('<input name="' + tmp_name + '" type="text" class="rate" />').blur(function() {
							var val = ($(this).val()).replace(/[^0-9.]/g,'');
							val = val == '' ? 0 : val;
							val = (parseFloat(val)).toFixed(2);
							$(this).val(val);
						});
						$(tmp_item).append(tmp_check);
						$(box).append(tmp_item);
					}
				} else {
					$(box).empty();
				}
			});
			


			//Extras Check Data
			$('td.extras .more',subj).click(function(e) {
				e.preventDefault();
				var link = $(this);
				$(link).toggleClass('active');
				
				if ($(link).hasClass('active')) {
					$('.extras_check_data',subj).each(function() { //clear others
						$(this).addClass('hide');
						$(this).parent().removeAttr('style');
						$(this).prev().not(link).removeClass('active');
					});
					$(link).next().removeClass('hide'); //execute
					$(link).parent().css({
						width: '100%',
					});			
				} else {
					$(link).next().addClass('hide');
					$(link).parent().removeAttr('style');

				}
			});

			//Extras Check Calendar NWASAP
			calendar_links(subj);
				
			//Submit quick form
			$('.submit',subj).bind('click',function(e) {
				e.preventDefault();
		
				var get = {};
				var check_arr = ['extras','payment_options','language'];
				
				$(subj).find(':input').not('[name="' + Obj.check_array.join('[]"], [name="') + '[]"], .ignore, .time').each(function() { //Regular
					var val = $(this).val();
					var name = $(this).attr('name');
					if (name.split('[')[0] != 'extras_check_data') { //additional ignore statement for extras_check_data
						get[name] = name == 'location' ? text_to_html(val) : val;
					}
				});

				//Checkbox Rows
				for (var field in Obj.check_array) {
					var tmp_field = Obj.check_array[field];
					var tmp_arr = [];
					$(':input[name="' + tmp_field + '[]"]:checked').each(function() {
						tmp_arr.push($(this).val());
					});
					get[tmp_field] = tmp_arr;
				}

				//Extras Data Checkbox Rows
				for (var i in get['extras_check']) {
					$('.extras_check_' + get['extras_check'][i] + ' .row :input',subj).each(function() {
						var n = $(this).attr('name');
						n = n.split(/[[\]]{1,2}/);
						n.length--;
						if (!(n[0] in get)) {
							get[n[0]] = {};
						}
						if (!(n[1] in get[n[0]])) {
							get[n[0]][n[1]] = {};
						}
						if (!(n[2] in get[n[0]][n[1]])) {
							get[n[0]][n[1]][n[2]] = {};
						}

						get[n[0]][n[1]][n[2]] = $(this).val(); //so sloppy NWASAP
					});
				}
				
				//Dates
				get['dates'] = get['dates'].split(',')

				//Price
				if (!$('input[name="alternate_price"]',subj).is(':checked') || get['alt_conversion'] == 0) { //clear to default if unchecked
					get['alt_currency'] = '';
					get['alt_conversion'] = 0;
				}
				if (!$('input[name="use_price_converter"]',subj).is(':checked') || get['price_converter'] == 0) { //clear to default if unchecked
					get['price_converter'] = 0;
				}
				
				//Benefits and Discounts
				if ($('input[name="benefits_and_discounts"]',subj).is(':checked')) {
					get['benefits_and_discounts'] = 1;
				} else {
					get['benefits_and_discounts'] = 0;
					get['alt_benefits_and_discounts'] = '';
				}

				
				//Time
				var time = [];
				for (i = 0;i < time_fields.length;i++) {
					time.push($('select[name="' + time_fields[i] + '"]',subj).val());
				}
				get['time'] = make_ws_times(time[0],time[1],time[2],time[3]);
				
				
				//Check difference
				var data = {};
				if (add) {
					var validated = true;
					var val_check = ['link','dates','date_string','city',];
					for (i in val_check) { //check empty
						if (get[val_check[i]] == '') {
							validated = false;
							$('input[name="' + val_check[i] + '"]',subj).inputError();
							if (val_check[i] == 'dates') {
								$('.quick_calendar_render').addClass('error');
							}
						} else {
							$('input[name="' + val_check[i] + '"]',subj).inputError(false);
							if (val_check[i] == 'dates') {
								$('.quick_calendar_render').removeClass('error');
							}
						}
					}
					if (validated) {
						data = get;
					}
					
				} else {
					for (i in get) {
						if ($.isArray(get[i])) {
							if (!($(get[i]).not(wsd_list[id][i]).length == 0 && $(wsd_list[id][i]).not(get[i]).length == 0)) {
							// if ($.compare(get[i],wsd_list[id][i])) {
								data[i] = get[i];
								wsd_list[id][i] = get[i];
							}
						} else {
							if (wsd_list[id][i] != get[i]) { //cehck change
								data[i] = get[i];
								wsd_list[id][i] = get[i];
							}
						}
					}
				}
				
				if ($.isEmptyObject(data)) {
					Obj.status(subj,1);
					var t = Obj.success_pause(function() {
						Obj.status(subj,(add ? -1 : 2)); //data left empty on error for add
						return;
					},200); //Show success
				} else if (add) { //ADD
					$.ajax({ //Updating sql, loading
						url: 'ajax/add_workshop/',
						type: "GET",
						data: data,
						beforeSend: function() {
							Obj.status(subj,1);
						},
						success: function(response) {
							if (response == '0' || response == '') {
								Obj.status(subj,-1);
								alert(response);
							}
							else { //success
								var arr = $.parseJSON(response);
								var new_id = arr['id'];
								wsd_list[new_id] = get;
								
								Obj.status(subj,2); //Add as complete
								
								var t = Obj.success_pause(function() {
									var clone = $('.workshop_home_item:first').clone();
									
									//Change title of workshop
									$(clone).attr('data-id',new_id).attr('id','workshop_' + new_id).attr('class',arr['class']).attr('data-search',arr['data-search']);
									$(clone).hide().insertBefore('.' + Edit.append_to + ':eq(' + arr['index'] + ')').slideDown(function() {
										$.scrollTo(Edit.cur_string(new_id),1000);
									});
									$('.sp_quick',clone).addClass('active');
									Obj.update_title(clone,new_id);
									
									//Edit Form Open
									Edit.load('quick',new_id);
								
									//Status
									Add.deactivate();
									Edit.click(Edit.cur_string(new_id));
									Sort.update_sidebar();
								});
							}
						}
					});
				} else { //UPDATE
					$.ajax({ //Updating sql, loading
						url: 'ajax/update_workshop/' + id,
						type: "GET",
						data: data,
						beforeSend: function() {
							Obj.status(subj,1);
						},
						success: function(response) {
							if (response == '0') {
								Obj.status(subj,-1);
								alert(response);
							}
							else { //success
								var subj = Edit.cur_string(id);
								var arr = $.parseJSON(response);
								$(subj).attr('class',arr['class']).attr('data-search',arr['data-search']); //.prop(i,arr[i]);
								
								//Change title of workshop
								Obj.update_title(subj,id);
								Sort.update_sidebar();
								Obj.status(subj,2);

								//Move Item
								if ('index' in arr) {
									Obj.shift(id,arr['index']);
								}
							}
						}
					});
				}

			});
			

			return subj;
		},
		init_log: function(subj,id) {
			Obj = this;
			$('.log_box',subj).html('<li>Loading...</li>');
			
			if (id in Obj.logs) {
				subj = Obj.log_rows(subj,id);
			} else {
				$.ajax({
					url: 'ajax/get_change_log/' + id,
					beforeSend: function() {
						var li = $('<li>Loading...</li>');						
						$('.log_box',subj).html(li);
					},
					success: function(response) {
						var box = Edit.cur_string(id) + ' .' + Edit.slide_cont_class + ':not(.old)';
						if (response != 0) {
							Edit.ease_height(id,0);
							$('.log_box',subj).empty();
							var arr = $.parseJSON(response);
							for (var i in arr) {
								var t = datetimeToTime(arr[i]['time']);
								t = new Date(t.getTime() + (-3.00 * 60 * 60) * 1000);
								arr[i]['time'] = t;
							}
						}
						Obj.logs[id] = arr;
						subj = Obj.log_rows(subj,id);
						
						Edit.ease_height(id,1);
					}
				});
			}
			return subj;
		},
		init_clone: function(subj,id) {
			var Obj = this;
			Obj.binary(subj,id,function() {
				var new_link = Obj.new_link(id);
				$.ajax({
					url: 'ajax/clone_workshop/' + id,
					data: {
						link: new_link,
					},
					beforeSend: function() {
						Obj.status(subj,1);
					},
					success: function(new_id) {
						if (!new_id) {
							Obj.status(subj,-1);	
						} else {
							var item = wsd_list[id];
							wsd_list[new_id] = $.extend(true,{},item); //clones object
							wsd_list[new_id]['link'] = new_link;
							
							var clone = $(Edit.cur_string(id)).clone();
							$(clone).insertAfter(Edit.cur_string(id))  //set vars
								.attr('id','workshop_' + new_id)
								.attr(Edit.id_attr,new_id)
								.find('.' + Edit.slide_class).remove();
							$('.' + Edit.trigger_class,clone).removeClass('active');
							var ul = $('.workshop_home_item_header',clone);
							
							Obj.status(subj,2);	
							
							var col = ul.css("background-color"); //fade flash wow!
							$('.workshop_home_item_header',clone).animate({ backgroundColor: colorLuminance(rgbToHex(col),-0.1) },200,function() { //functions in script.js
								$(this).animate({ backgroundColor: col },1500,function() {
									$(this).removeAttr('style');
								});
							});
						
							//Start it up
							Edit.click(Edit.cur_string(new_id));
							Sort.update_sidebar();
						}							
					},
					error: function() {
						Obj.status(subj,-1);
					}
				});
			});
			return subj;
		},
		init_archive: function(subj,id) {
			var Obj = this;
			Obj.binary(subj,id,function() {
				Obj.archive(subj,id);
			});
			return subj;
		},
		init_restore: function(subj,id) {
			var Obj = this;
			Obj.binary(subj,id,function() {
				Obj.archive(subj,id,'restore');
			});
			return subj;
		},
		init_delete: function(subj,id) {
			var Obj = this;
			Obj.binary(subj,id,function() {
				Obj.archive(subj,id,'delete');
			});
			return subj;
		},
		init_add: function(subj,id) {
			var Obj = this;
			subj = Obj.init_quick(subj,id,true);
			$('h4',subj).remove();
			$('.submit',subj).text('Add Workshop');

			return subj;
		},
		/* END PROCESS FORMS */
		
		/* HELPER FUNCTIONS FOR ROWS */
		update_title: function(subj,id) {
			var tmp_cert = certifications[wsd_list[id]['cert']];
			var tmp_school = schools[tmp_cert['school']];
			var title = tmp_school['title'] + ' ' + tmp_cert['title'] + ' Workshop';
			$('h3',subj).text(title);

			var location = [wsd_list[id]['city']];
			if (wsd_list[id]['state'] != '') {
				location.push(wsd_list[id]['state']);
			}
			if (wsd_list[id]['country'] != 'Virtual') {
				location.push(wsd_list[id]['country']);
			}
			$('.location',subj).text(location.join(', '));

			$('.date_string',subj).text(wsd_list[id]['date_string']);
		},
		deactivate_other: function(id) { //Close other
			Add.exit();
		},
		archive: function(subj,id,version) {
			var Obj = this;
			version = typeof version === 'undefined' ? 'archive' : version;
			$.ajax({
				url: 'ajax/' + version + '_workshop/' + id,
				type: "PUT",
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
								Sort.update_sidebar();
							});
						});
					}
				},
				error: function() {
					Obj.status(subj,-1);
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
		bann_num: function() {
			return Math.floor((Math.random() * 5) + 1);
		},
		get_links: function(string,id,num) {
			num = typeof num === 'undefined' ? this.bann_num() : num;
			var tmp_cert = certifications[wsd_list[id]['cert']];
			var tmp_school = schools[tmp_cert['school']];
			var img_folder = tmp_cert['school'] == 'big_data' ? 'static/' : 'system/application/';
			var url = tmp_school['url'];
			var url_secure = tmp_school['url_secure'];
		
			//Banner
			var banner = [];
			var l = String(wsd_list[id]['link']).split('_');
			for (var i in l) {
				if (isNaN(l[i])) {
					banner.push(l[i]);
				}
			}
			banner = banner.join('_') + '_' + num;

			return string.replace(/%%url%%/gi,url).replace(/%%url_secure%%/gi,url_secure).replace(/%%img_folder%%/gi,img_folder).replace(/%%banner%%/gi,banner).replace(/%%ext%%/gi,wsd_list[id]['link']);
		},
		new_link: function(id) {
			var arr = [];
			var s = certifications[wsd_list[id]['cert']]['school'];
			var link = wsd_list[id]['link'];
			for (var i in wsd_list) {
				var tmp_cert = certifications[wsd_list[i]['cert']];
				var tmp_school = schools[tmp_cert['school']];
				if (String(wsd_list[i]['link']).indexOf(link) != -1 && tmp_cert['school'] == s) {
					arr.push(i);
				}
			}
			
			var x = 1;
			for (var i in arr) {
				x++;
			}
			
			return link + '_' + x;
		},
		check_array: ['extras_check','payment_options','language'],
		logs: {}, //store logs in there
		log_rows: function(subj,id) {
			var Obj = this;
			var arr = Obj.logs[id];
			var ul = $('.log_box',subj).empty();
	
			if (!isEmpty(arr)) {
				for (var val in arr) {
					var t = arr[val]['time'];
					var li = $('<li class="' + (val % 2 == 0 ? 'odd' : 'even') + '"><a class="time" title="' + t.fjy() + ' ' + t.toLocaleTimeString() + '"></a></li>');
					if (Number(val) + 1 < arr.length) {
						$('a',li).append('<span class="hov_time">' + t.fjy() + '<br />' + t.toLocaleTimeString() + '</span>');
					}
					
					var tmp_cert = certifications[wsd_list[id]['cert']];
					var tmp_school = schools[tmp_cert['school']];
					
					for (var v in arr[val]['data']) {
						var title = v.replace(/_/gi,' ');
						var result = arr[val]['data'][v];
						
						if (v == 'cert') {
							tmp_cert = certifications[arr[val]['data'][v]];
							tmp_school = schools[tmp_cert['school']];
							title = 'Certification';
							result = tmp_school['title'] + ' ' + tmp_cert['title_private'] + ' Workshop';
						} 
						if (v == 'partner') {
							result = arr[val]['data'][v]['title'];
						}
						if (v == 'link') {
							result = '<a target="_blank" href="' + tmp_school['url'] + 'workshops/' + arr[val]['data'][v] + '">' + arr[val]['data'][v] + '</a>';
						}
						if (v == 'map' || v == 'redirect_link') { //general link
							result = '<a target="_blank" href="' + arr[val]['data'][v] + '">' + arr[val]['data'][v] + '</a>';
						}
						if (v == 'language' || v == 'dates' || v == 'extras_check' || v == 'payment_options') {
							result = arr[val]['data'][v].split('|');
							result = result.join(', ');
							result = result.replace(/_/gi,' ');
						}
						if (v == 'dates') {
							result = result.replace(/-/gi,'/');
						}
						if (v == 'created') {
							result = datetimeToTime(arr[val]['data'][v]);
							result = new Date(result.getTime() + (-3.00 * 60 * 60) * 1000);
							result = result.fjy() + ', ' + result.toLocaleTimeString();
						}
						if (v == 'price') {
							result = wsd_list[id]['currency'] + ' ' + result;
						}
						
						$('a.time',li).append('<span class="item"><span class="title">' + title + ':</span> ' + result + '</span>');
					}
					$(ul).append(li);
				}
			} else {
				$(ul).apend('<li>There have been no changes to this workshop.</li>');
			}
			return subj;
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
		shift: function(id,index) {
			var Obj = this;
			var cur_index = $('.' + Edit.append_to).index($(Edit.cur_string(id)));
			
			//NWASAP
			var vis_index = $('.' + Edit.append_to + ':visible').index($('.' + Edit.append_to + ':eq(' + (Number(index) + 1) + ')'));
			var vis_cur_index = $('.' + Edit.append_to + ':visible').index($(Edit.cur_string(id)));
			
			if (index != cur_index) {
				var t = Obj.success_pause(function() {
					$(Edit.cur_string(id)).slideUp(function() {
						$(this).insertBefore('.' + Edit.append_to + ':eq(' + index + ')').slideDown(function() {
							$.scrollTo(Edit.cur_string(id),1000);
						});
					});
				});
			}
		},
		logs: {}, //store logs in there
		reg_log_get: function(subj,id,file,callback) {
			var Obj = this;
			var tmp_cert = certifications[wsd_list[id]['cert']];
			var tmp_school = schools[tmp_cert['school']];
			var url = tmp_school['url_secure'] + 'ajax/get_registration_logs/' + id + '?file=' + file;
			
			if (!(id in Obj.reg_logs)) { //build
				Obj['reg_logs'][id] = {};
			}
			
			if (file in Obj['reg_logs'][id]) {
				callback(Obj['reg_logs'][id][file]);
			} else {
				$.ajax({
					url: url,
					type: 'POST',
					data: {
						pass: '888wsy1qz',
						file: file,
					},
					beforeSend: function() {},
					success: function(response) {
						Obj['reg_logs'][id][file] = response;
						callback(response);
					}
				});
			}
		},
		reg_log_rows: function(subj,id,arr) {
			var Obj = this;
			for (var i in arr) {
				var t = new Date(arr[i]['time']);
				var li = $('<li><a href="#">' + t.fjy() + ' ' + t.toLocaleTimeString() + ' &ndash; Registration ' + arr[i]['id'] + '</a></li>');
				// $(li).append('<a class="sp sp_down" download="' + arr[i]['id'] + '" title="Download Registration Log"></a>');
				// $(li).append('<a class="sp sp_prev" href="#" title="View Registration Log"></a>');
				$(li).append('<div class="log_slide"></div>');
				$('.log_box',subj).append(li);
			}
			$('.log_box a',subj).click(function(e) {
				var a = this;
				e.preventDefault();
				
				if ($(a).hasClass('active')) { //check slide
					$('.log_slide',subj).slideUp(Edit.eta,function() {
						$(this).empty();
					});
				} else {
					Obj.reg_log_get(subj,id,arr[i]['file'],function(response) {
						$(a).removeClass('loading');
						response = $(response.trim()).filter('table').removeAttr('style');
						$('.log_slide',$(a).parent()).html(response).slideDown(Edit.eta);
					});
					$(a).addClass('loading');
				}
				$(a).toggleClass('active');
			});
			$('a.sp_down',subj).click(function(e) {
				e.preventDefault();
				// var w = window.open('','','width=500, height=300');
				// w.document.write('this is a new thing');
			});
			Edit.ease_height(id,1);
		
		}
		/* END HELPER FUNCTIONS FOR ROWS */
	});
	
	//Fire functions
	var Edit = new Edit_Tabs({ //edit_tabs.js
		process: Process,
	});
	var Sort = new Sort_Tabs({ //sort.js
		deactivate_other: function() {
			Search.deactivate();
			Add.deactivate();
		},
	});
	var Search = new Search_Tabs({ //search.js
		deactivate_other: function() {
			Sort.deactivate();
			Add.deactivate();
		},
	});
	
	var Add = new Add_Item({
		Edit: Edit,
	});
});