$(document).ready(function() {
	var cert_list = {};
	var Process = new Process_Tabs({ //edit_tabs.js
		/* PROCESS FORMS */
		init_row: function(subj,id,callback) { //init all
			if (id in cert_list) { //already have data on row
				callback(subj);
			} else { //already have data on row
				$.ajax({
					url: 'ajax/get_cert_row/' + id,
					success: function(response) {
						var data = $.parseJSON(response);
						if (!$.isEmptyObject(data)) {
							cert_list[id] = data;
							cert_list[id]['modules'] = cert_list[id]['modules'].split(',');
						}
						callback(subj);
					},
				});
			}
		},
		init_edit_cert: function(subj,id,add) {
			var Obj = this;
			add = typeof add === 'undefined' ? false : true;
			
			subj = Obj.fill_form(subj,id,add);
			
			//Actions
			$('.modules a',subj).click(function(e) {
				e.preventDefault();
				$(this).toggleClass('active');
				var i = [];
				$('.modules:visible a.active',subj).each(function() {
					i.push($(this).attr('alt'));
				});
				$('input[name="modules"]',subj).val(i.join(','));
			});
			$('input[name="modules"]',subj).blur(function() {
				var v = ($(this).val()).replace(/[^\d,]+/g,'');
				var arr = v.split(',');
				for (i in arr) {
					if (arr[i] <= $('.modules:visible a',subj).length) {
						if (typeof value === 'undefined') {
							var value = arr[i];
						} else {
							value += ',' + arr[i];
						}
					}
				}
				
				$(this).val(value);
				Obj.highlight_links(subj,id,true);
			});
			
			//School Change
			$('select[name="school"]',subj).change(function() {
				$('.modules',subj).hide().filter('.' + $(this).val()).show();
				$('.cert_link',subj).attr('href',schools[$('select[name="school"]',subj).val()]['url'] + 'certifications/' + $('input[name="cert_link"]',subj).val());
				Obj.highlight_links(subj,id,true);
			});
			
			//URL
			$('input[name="cert_link"]').on('change blur keyup',function() {
				var i = $('select[name="school"]').val();
				$('a.cert_link').attr('href',schools[i]['url'] + 'certifications/' + $(this).val());
			});
			
			//Color
			var hex_test = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i;
			$('input[name="color"]',subj).change(function() {
				var c = '#' + $('input[name="color"]',subj).val();
				if (hex_test.test(c)) {
					$('.color_block',subj).removeClass('error').css({background: c});
					if (add) {
						$('ul.body',subj).css({borderColor: c});
					}
				} else {
					$('.color_block',subj).addClass('error').css({background: ''});
					if (add) {
						$('ul.body',subj).css({borderColor: '#EEDFE5'});
					}
				}
			});
			
			//Submit Change
			$('a.submit',subj).click(function(e) {
				e.preventDefault();
				var validated = true; //for add
				var form = {};
				$(':input',subj).each(function() {
					var name = $(this).attr('name');
					form[name] = $(this).val();
					
					if (add) { //Add
						if (form[name] == '') {
							validated = false;
							$(this).inputError();
						} else {
							$(this).inputError(false);
						}
					}
				});
				
				//ADD ONLY
				if (add) {
					if (validated) {
						$.ajax({
							url: 'ajax/create_cert/',
							type: "GET",
							data: form,
							beforeSend: function() {
								$('.loading_small',subj).removeClass('success').addClass('loading');
							},
							success: function(response) {
								if (!response) { //failure
									$('.loading_small',subj).removeClass('loading').addClass('failure');
								}
								else { //success
									var arr = $.parseJSON(response);
									new_id = arr.id;
									cert_list[new_id] = form;
									cert_list[new_id]['modules'] = (cert_list[new_id]['modules']).split(',');
									
									
									//NEW
									var clone = $('.' + Edit.append_to + ':first').clone();
									
									//Change title of workshop
									$(clone).attr('data-id',new_id).attr('id','cert_' + new_id);//.attr('class',arr['class']).attr('data-search',arr['data-search']);
									// $(clone).hide().insertBefore('.' + Edit.append_to + ':eq(' + arr['index'] + ')').slideDown(function() {
									$(clone).hide().insertBefore('.' + Edit.append_to + ':eq(0)').slideDown(function() {
										$.scrollTo(Edit.cur_string(new_id),1000);
									});
									$('.sp_quick',clone).addClass('active');
									Obj.update_title(clone,new_id);
									
									//Edit Form Open
									Edit.load('edit_cert',new_id);
								
									//Status
									Add.deactivate();
									Edit.click(Edit.cur_string(new_id));
									// Sort.update_sidebar();
								}
							},
						});
					}
				}
				//EDIT ONLY
				else {
					//Check Change
					var data = {};
					for (var i in form) {
						if ($.isArray(form[i])) {
							if ($(form[i]).not(cert_list[id][i]).length != 0 || $(cert_list[id][i]).not(form[i]).length != 0) { //check change
								data[i] = form[i];
								cert_list[id][i] = form[i];
							}
						} else {
							if (cert_list[id][i] != form[i]) { //cehck change
								data[i] = form[i];
								cert_list[id][i] = form[i];
							}
						}
					}

					if ($.isEmptyObject(data)) {
						$('.loading_small',subj).removeClass('success').addClass('loading');
						var t = setTimeout(function() {
							$('.loading_small',subj).removeClass('loading').addClass('success');
							return;
						},200); //Show success
					} else {
						$.ajax({
							url: 'ajax/update_cert/' + id,
							type: "GET",
							data: data,
							beforeSend: function() {
								$('.loading_small',subj).removeClass('success').addClass('loading');
							},
							success: function(response) {
								if (response != 1) { //failure
									$('.loading_small',subj).removeClass('loading').addClass('failure');
								}
								else { //success
									$('.loading_small',subj).removeClass('loading').addClass('success');
									//Change Title
									if ('school' in data) {
										$(Edit.cur_string(id) + ' li.title .school').text(schools[cert_list[id]['school']]['title']);
										$(Edit.cur_string(id) + ' li.title .serial').text(schools[cert_list[id]['school']]['serial']);
									}
									if ('modules' in data) {
										$(Edit.cur_string(id) + ' li.title .mod').text(cert_list[id]['modules']);
									}
									if ('color' in data) {
										$(Edit.cur_string(id) + ' ul.body').css({borderColor:'#' + cert_list[id]['color']});
									}
									if ('title_private' in data) {
										$(Edit.cur_string(id) + ' li.title .title').text(cert_list[id]['title_private']);
									}
								}
							},
						});
					}
				}
			});
			return subj
		},
		init_clone_cert: function(subj,id) {
			var Obj = this;
			Obj.binary(subj,id,function() {
				$.ajax({
					url: 'ajax/clone_cert/' + id,
					beforeSend: function() {
						Obj.status(subj,1);
					},
					success: function(new_id) {
						if (!new_id) {
							Obj.status(subj,-1);	
						} else {
							var item = cert_list[id];
							cert_list[new_id] = $.extend(true,{},item); //clones object
							
							var clone = $(Edit.cur_string(id)).clone();
							$(clone).insertAfter(Edit.cur_string(id))  //set vars
								.attr('id','cert_' + new_id)
								.attr(Edit.id_attr,new_id)
								.find('.' + Edit.slide_class).remove();
							$('.' + Edit.trigger_class,clone).removeClass('active');
							var row = $(Edit.cur_string(new_id) + ' .body');
							
							Obj.status(subj,2);	
							
							var col = row.css("background-color"); //fade flash wow!
							$(row).animate({ backgroundColor: colorLuminance(rgbToHex(col),-0.1) },200,function() { //functions in script.js
								$(this).animate({ backgroundColor: col },1500,function() {
									$(this).removeAttr('style');
								});
							});
						
							//Start it up
							Edit.click(Edit.cur_string(new_id));
							// Sort.update_sidebar();
						}							
					},
					error: function() {
						Obj.status(subj,-1);
					}
				});
			});
			return subj;
		},
		init_delete_cert: function(subj,id) {
			var Obj = this;
			Obj.binary(subj,id,function() {
				Obj.archive(subj,id,'delete');
			});
			return subj;
		},
		init_add_cert: function(subj,id) {
			var Obj = this;
			subj = Obj.init_edit_cert(subj,id,true);
			$('h4',subj).remove();
			$('.submit',subj).text('Add Certification');

			return subj;
		},
		/* END PROCESS FORMS */
		
		
		/* HELPER FUNCTIONS FOR ROWS */
		archive: function(subj,id,version) {
			var Obj = this;
			version = typeof version === 'undefined' ? 'archive' : version;
			$.ajax({
				url: 'ajax/' + version + '_cert/' + id,
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
								// Sort.update_sidebar();
							});
						},1000);
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
		highlight_links: function(subj,id,overwrite) {
			overwrite = typeof overwrite === 'undefined' ? false : overwrite;
			if (overwrite) {
				$('.modules a.active',subj).removeClass('active');
			}
			var active = overwrite ? ($('input[name="modules"]',subj).val()).split(',') : cert_list[id]['modules'];
			for (var i = 0;i < active.length;i++) {
				$('.modules a.mod_' + active[i],subj).addClass('active');
			}
			return subj;
		},
		fill_form: function(subj,id,add) {
			var Obj = this;
			var tmp_school = add ? $('select[name="school"]',subj).val() : cert_list[id]['school'];
			
			//Link
			$('.cert_link',subj).attr('href',schools[tmp_school]['url'] + 'certifications/' + (!add ? cert_list[id]['cert_link'] : ''));
			
			if (!add) {
				$(':input',subj).each(function() {
					if ($(this).attr('name') == 'modules') {
						$(this).val(cert_list[id][$(this).attr('name')].join(','));
					} else {
						$(this).val(cert_list[id][$(this).attr('name')]);
					}
				});
				$('select',subj).each(function() {
					$('option[value="' + cert_list[id][$(this).attr('name')] + '"]',this).attr('selected','selected');
				});

				//Color
				$('.color_block',subj).css({background: '#' + cert_list[id]['color']});
			}
			
			//Modules
			var links = $('.modules.' + tmp_school,subj);			
			$(links).show();
			Obj.highlight_links(subj,id,add);
			
			return subj;
		},
		deactivate_other: function(id) { //Close other
			Add.exit();
		},
		update_title: function(subj,id) {
			var tmp_cert = cert_list[id];
			var tmp_school = schools[tmp_cert['school']];
			
			$('ul.body',subj).css({ borderColor: '#' + tmp_cert['color'] });
			$('h3 span.school',subj).text(tmp_school['title']);
			$('h3 span.title',subj).text(tmp_cert['title_private'] + ' Certification');
			$('.serial',subj).text(tmp_school['serial']);
			$('.mod',subj).text((tmp_cert['modules']).join(','));
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
		trigger: 'add_cert',
		item: 'cert_row',
		type: 'add_cert',
		title: 'Certification',
	});	
});