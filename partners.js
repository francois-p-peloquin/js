$(document).ready(function(){
	var Cache = {};
	var Partner_Data = {};
	
	var Process = new Process_Tabs({ //edit_tabs.js
		/* PROCESS FORMS */
		init_row: function(subj,id,callback) { //init all
			if (id in Partner_Data) { //already have data on row
				callback(subj);
			} else { //already have data on row
				$.ajax({
					url: 'ajax/get_partner/' + id,
					success: function(response) {
						var data = $.parseJSON(response);
						Partner_Data[id] = data;
						callback(subj);
					},
				});
			}		
		},
		init_add_partner: function(subj,id) {
			var Obj = this;
			subj = Obj.init_edit_partner(subj,id,true);
			$('h4',subj).remove();
			$('.submit',subj).text('Add Partner');
			
			return subj;
		},
		init_edit_partner: function(subj,id,add) {
			add = typeof add === 'undefined' ? false : true;
			var Obj = this;

			if (!add) {
				Obj.fill_form(subj,id);
				$('.password_check',subj).hide();
			} else {
				$('.password_current',subj).hide();
			}
			
			//Submit
			$('a.submit',subj).click(function(e) {
				e.preventDefault();
				
				var validated = true;
				var form = {};
				$(':input:visible',subj).each(function() {
					var name = $(this).attr('name');
					form[name] = $(this).val();
					
					if (add) { //Add
						if (form[name] == '' && name == 'title') {
							validated = false;
							$(this).inputError();
							console.log(name);
						} else {
							$(this).inputError(false);
						}
					} else {
						if (name != 'password[current]' && form[name] == Partner_Data[id][name]) {
							delete form[name];
						}
					}
				});
				
				if ($.isEmptyObject(form)) {
					$('.loading_small',subj).removeClass('success').addClass('loading');
					var t = setTimeout(function() {
						$('.loading_small',subj).removeClass('loading').addClass('success');
						return;
					},200); //Show success
				} 
				else if (validated) {
					if (add) { //add
						$.ajax({
							url: 'ajax/create_partner/',
							type: "POST",
							cache: false,
							data: form,
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
									Partner_Data[new_id] = form;
									
									Obj.status(subj,2); //Add as complete
									
									var t = Obj.success_pause(function() {
										var clone = $('.' + Edit.append_to + ':not(.add_partner):last').clone();
										
										//Change title of workshop
										$(clone).attr('data-id',new_id).removeClass('current_partner').hide().insertAfter('.' + Edit.append_to + ':not(.add_partner):last').slideDown(function() {
											$.scrollTo(Edit.cur_string(new_id),1000);
										});
										Obj.update_title(new_id);
										$('.sp_quick',clone).addClass('active');
										
										//Edit Form Open
										Edit.load('edit_partner',new_id);
									
										//Status
										Add.deactivate();
										Edit.click(Edit.cur_string(new_id));
										// Sort.update_sidebar();
									});
									
									//Clear Cache
									Partner_Data[id]['check_partner_name'] = {};
								}
							},
							error: function() {
								Obj.status(subj,-1);
							}
						});
					} else { //update
						$.ajax({
							url: 'ajax/update_partner/' + id,
							type: "POST",
							cache: false,
							data: form,
							beforeSend: function() {
								Obj.status(subj,1);
							},
							success: function(response) {
								if (response != '1') {
									alert(response);
									Obj.status(subj,-1);
								}
								else { //success
									Obj.status(subj,2);
									for (var i in form) {
										Partner_Data[id][i] = form[i];
									}
									Obj.update_title(id);
								}
								//Clear Cache
								Partner_Data[id]['check_partner_name'] = {};
							},
							error: function() {
								Obj.status(subj,-1);
							}
						});
					}
				} 
				else { //failure
					$('.loading_small',subj).removeClass('success').addClass('loading');
					var t = setTimeout(function() {
						$('.loading_small',subj).removeClass('loading').addClass('failure');
						return;
					},200); //Show success
				}
			});
			
			return subj;
		},
		init_delete_partner: function(subj,id) {
			var Obj = this;
			Obj.binary(subj,id,function() {
				Obj.archive(subj,id,'delete');
			});
			return subj;
		},
		/* END PROCESS FORMS */
		
		/* HELPER FUNCTIONS FOR ROWS */
		archive: function(subj,id,version) {
			var Obj = this;
			version = typeof version === 'undefined' ? 'archive' : version;
			$.ajax({
				url: 'ajax/' + version + '_partner/' + id,
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
						var t = setTimeout(function() {
							$(Edit.cur_string(id)).slideUp(Edit.eta,function() {
								$(this).remove();
							});
						},1000);
					}
				},
				error: function() {
					Obj.status(subj,-1);
				}
			});
		},
		deactivate_other: function(id) { //Close other
			Add.exit();
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
		fill_form: function(subj,id,add) {
			add = typeof add === 'undefined' ? false : true;
			
			if (!add) {
				$(':input',subj).each(function() {
					if ($(this).attr('name') == 'modules') {
						$(this).val(Partner_Data[id][$(this).attr('name')].join(','));
					} else {
						$(this).val(Partner_Data[id][$(this).attr('name')]);
					}
				});
				$('select',subj).each(function() {
					$('option[value="' + Partner_Data[id][$(this).attr('name')] + '"]',this).attr('selected','selected');
				});
			}
		},
		success_pause: function(callback,time) {
			time = typeof time === 'undefined' ? 1000 : time;
			var t = setTimeout(function() {
				callback();
			},time);
			return t;
		},
		update_title: function(id) {
			console.log(Partner_Data[id]);
			var subj = $(Edit.cur_string(id));
			$('ul.body h3',subj).text(Partner_Data[id]['title']);
			$('.user_icon span',subj).attr('class','permission_' + Partner_Data[id]['permission']);
			$('.username',subj).text(Partner_Data[id]['username']);
			return subj;
		},
		/* END HELPER FUNCTIONS FOR ROWS */
	});
	
	//Fire functions
	var Edit = new Edit_Tabs({ //edit_tabs.js
		append_to: 'cert_row',
		process: Process,
	});
	var Add = new Add_Item({
		Edit: Edit,
		trigger: 'add_partner',
		item: 'partner_row',
		type: 'add_partner',
		title: 'Partner',
	});	
});