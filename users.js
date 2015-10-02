$(document).ready(function(){
	var Cache = {
		
	};
	var User_Data = {};
	
	var Process = new Process_Tabs({ //edit_tabs.js
		/* PROCESS FORMS */
		init_row: function(subj,id,callback) { //init all
			if (id in User_Data) { //already have data on row
				callback(subj);
			} else { //already have data on row
				$.ajax({
					url: 'ajax/get_user_row/' + id,
					success: function(response) {
						var data = $.parseJSON(response);
						// if (!$.isEmptyObject(data)) {
							User_Data[id] = data;
						// }
						callback(subj);
					},
				});
			}		
		},
		init_edit_admin: function(subj,id) {
			var Obj = this;
			subj = Obj.init_edit_user(subj,id);
			
			return subj;
		},
		init_add_user: function(subj,id) {
			var Obj = this;
			subj = Obj.init_edit_user(subj,id,true);
			$('h4',subj).remove();
			$('.submit',subj).text('Add User');
			
			return subj;
		},
		init_edit_user: function(subj,id,add) {
			add = typeof add === 'undefined' ? false : true;
			var Obj = this;

			if (!add) {
				Obj.fill_form(subj,id);
				$('.password_check',subj).hide();
			} else {
				$('.password_current',subj).hide();
			}
			
			var field = $('input[name="password[current]"]',subj);
			var new_field = $('input[name="password[new]"]',subj);
			var new_field_check = $('input[name="password[new_check]"]',subj);
			var t = true;

			$('input[name="username"],input[name="nickname"]',subj).on('change keyup',function() {
				var tmp_field = this;
				var name = $(tmp_field).val();
				var type = $(tmp_field).attr('name');
				if (add || name != User_Data[id][type]) {// && (typeof Cache['check_user_name'][id][name] === 'undefined' || val != Cache['check_user_name'][id][name])) {
					Obj.check_user_name(subj,id,tmp_field,type,name);
				}
			});
			
			$(field).on('change keyup',function() {
				clearTimeout(t);
				t = setTimeout(Obj.check_pass(subj,id,
					function(subj) { //callback true
						$('.password_check',subj).show();
						$(field).removeClass('error').attr('disabled','disabled'); //inputError(false);
						$(field).next().addClass('failure').css({ cursor: 'pointer' }).click(function(e) { //add exit
							$(this).removeClass('failure').css({ cursor: 'auto' }).on('click',false);
							$(field).removeAttr('disabled').val('');
							$('.password_check',subj).hide();
						});
						
						User_Data[id]['password'] = $('input[name="password[current]"]').val();
					},function(subj) { //callback false
						$('.password_check',subj).hide();
						$(field).inputError();
					}
				),1000);
			});
						
			$(new_field).on('change keyup',function() {
				Obj.check_new_pass(subj,id,this,add);
			});
						
			$(new_field_check).on('change keyup',function() {
				Obj.check_new_pass_check(subj,id,this,add);
			});
			
			//Submit
			$('a.submit',subj).click(function(e) {
				e.preventDefault();
				
				var validated = true;
				var form = {};
				$(':input:visible',subj).each(function() {
					var name = $(this).attr('name');
					form[name] = $(this).val();
					
					if (add) { //Add
						if (form[name] == '') {
							validated = false;
							$(this).inputError();
						} else {
							$(this).inputError(false);
						}
					} else {
						if (name != 'password[current]' && form[name] == User_Data[id][name]) {
							delete form[name];
						}
					}
				});
				
				//Password
				if (add) {
					if (Obj.check_new_pass(subj,id,new_field) && Obj.check_new_pass_check(subj,id,new_field_check)) { //double check password add
						form['password'] = form['password[new]'];
						delete form['password[new]'];
						delete form['password[new_check]'];
					}
				} else if ('password[current]' in form && form['password[current]'] != '') { //double check password
					if (('password' in User_Data[id] && form['password[current]'] == User_Data[id]['password']) && //same pass
						Obj.check_pass(subj,id,function() {},function() {}) && Obj.check_new_pass(subj,id,new_field) && Obj.check_new_pass_check(subj,id,new_field_check)) { //recheck pass
						form['password'] = form['password[new]'];
						delete form['password[current]'];
						delete form['password[new]'];
						delete form['password[new_check]'];
					} else {
						validated = false;
					}
				} else {
					delete form['password[current]'];
				}
				
				//Username & Nickname
				var tmp_array = ['nickname','username'];
				for (i in tmp_array) {
					var tmp_field = $('input[name="' + tmp_array[i] + '"]',subj);
					if (!Obj.check_user_name(subj,id,tmp_field,tmp_array[i],$(tmp_field).val())) {
						validated = false;
					}
				}
				
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
							url: 'ajax/create_user/',
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
									User_Data[new_id] = form;
									
									Obj.status(subj,2); //Add as complete
									
									var t = Obj.success_pause(function() {
										var clone = $('.' + Edit.append_to + ':not(.add_user):last').clone();
										
										//Change title of workshop
										$(clone).attr('data-id',new_id).removeClass('current_user').hide().insertAfter('.' + Edit.append_to + ':not(.add_user):last').slideDown(function() {
											$.scrollTo(Edit.cur_string(new_id),1000);
										});
										Obj.update_title(new_id);
										$('.sp_quick',clone).addClass('active');
										
										//Edit Form Open
										Edit.load('edit_user',new_id);
									
										//Status
										Add.deactivate();
										Edit.click(Edit.cur_string(new_id));
										// Sort.update_sidebar();
									});
									
									//Clear Cache
									User_Data[id]['check_user_name'] = {};
								}
							},
							error: function() {
								Obj.status(subj,-1);
							}
						});
					} else { //update
						$.ajax({
							url: 'ajax/update_user/' + id,
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
										User_Data[id][i] = form[i];
									}
									Obj.update_title(id);
								}
								//Clear Cache
								User_Data[id]['check_user_name'] = {};
							},
							error: function() {
								Obj.status(subj,-1);
							}
						});
					}
				}
			});
			
			return subj;
		},
		init_delete_user: function(subj,id) {
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
				url: 'ajax/' + version + '_user/' + id,
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
		check_pass: function(subj,id,callback_true,callback_false) {
			var Obj = this;
			var pass_item = $('input[name="password[current]"]');
			var pass = $(pass_item).val();
			if (pass == '') {
				callback_false(subj);
				return false;
			} else if ('password' in User_Data[id]) {
				if (pass == User_Data[id]['password']) {
					callback_true(subj);
					return true;
				} else {
					callback_false(subj);
					return false;
				}
			} else {
				$.ajax({
					url: 'ajax/check_password/' + id,
					type: "POST",
					cache: false,
					data: {
						password: pass,
					},
					beforeSend: function() {
						$(pass_item).next().addClass('loading');
					},
					success: function(response) {
						$(pass_item).next().removeClass('loading');
						if (response != '1') {
							callback_false(subj);
							return false;
						}
						else {
							callback_true(subj);
							return true;
						}
					},
					error: function() {
						Obj.status(subj,-1);
					}
				});
			}
		},	
		check_new_pass: function(subj,id,field,add) {
			var Obj = this;
			var new_pass = $(field).val();
			var strength = Obj.check_strength(subj,new_pass);
			if (strength < 2 || new_pass == $('input[name="password[current]"]').val()) {
				$(field).inputError();
				return false;
			} else {
				$(field).inputError(false);
				return true;
			}
		},
		check_new_pass_check: function(subj,id,field,add) {
			var Obj = this;
			if ($(field).val() == '' || $(field).val() != $('input[name="password[new]"]').val()) {
				$(field).inputError();
				return false;
			} else {
				$(field).inputError(false);
				return true;
			}
		},
		check_strength: function(subj,password){
			var strength = 0

			if (password.length > 7) strength += 1;
			if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) strength += 1;
			if (password.match(/([a-zA-Z])/) && password.match(/([0-9])/)) strength += 1;
			if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/)) strength += 1;
			if (password.match(/(.*[!,%,&,@,#,$,^,*,?,_,~].*[!,",%,&,@,#,$,^,*,?,_,~])/)) strength += 1;
			
			/*if (strength < 2) {
				$('#strength',subj).attr('class','weak').text('weak');
			} else if (strength <= 4) {
				$('#strength',subj).attr('class','good').text('good');
			} else {
				$('#strength',subj).attr('class','strong').text('strong');
			}*/

			return strength;
		},
		check_user_name: function(subj,id,field,type,name) {
			//Clean
			if (type == 'username') {
				name = name.replace(/[^\w\s]/gi,'').replace(/\s/g,'').toLowerCase();
				$(field).val(name);
			} else {
				name = name.replace(/[^\w\s]/gi,'');
				$(field).val(name);
			}
			
			if (!('check_user_name' in User_Data[id])) { //cache init
				User_Data[id]['check_user_name'] = {};
			}
			if (!(type in User_Data[id]['check_user_name'])) {
				User_Data[id]['check_user_name'][type] = {};
			}
			
			if (name in User_Data[id]['check_user_name'][type]) {
				if (User_Data[id]['check_user_name'][type][name]) {
					$(field).removeClass('error');
					return true;
				} else {
					$(field).addClass('error');
					return false;
				}
			} else {
				$.ajax({
					url: 'ajax/check_user_name/' + id,
					type: "POST",
					data: {
						'name': name,
						'type': type,
					},
					beforeSend: function() {
						$(field).next().addClass('loading');
					},
					success: function(response) {
						$(field).next().removeClass('loading');
						if (response != '1') {
							$(field).removeClass('error');
							User_Data[id]['check_user_name'][type][name] = true;
							return true;
						}
						else {
							$(field).addClass('error');
							User_Data[id]['check_user_name'][type][name] = false;
							return false;
						}
					},
					error: function() {
						$(field).addClass('failure');
						return false;
					},
				});
			}
		},
		fill_form: function(subj,id,add) {
			add = typeof add === 'undefined' ? false : true;
			
			if (!add) {
				$(':input',subj).each(function() {
					if ($(this).attr('name') == 'modules') {
						$(this).val(User_Data[id][$(this).attr('name')].join(','));
					} else {
						$(this).val(User_Data[id][$(this).attr('name')]);
					}
				});
				$('select',subj).each(function() {
					$('option[value="' + User_Data[id][$(this).attr('name')] + '"]',this).attr('selected','selected');
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
			var subj = $(Edit.cur_string(id));
			$('ul.body h3',subj).text(User_Data[id]['nickname']);
			$('.user_icon span',subj).attr('class','permission_' + User_Data[id]['permission']);
			$('.username',subj).text(User_Data[id]['username']);
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
		trigger: 'add_user',
		item: 'user_row',
		type: 'add_user',
		title: 'User',
	});	
});