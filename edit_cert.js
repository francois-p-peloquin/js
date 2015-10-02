$(document).ready(function(){	
	var cert_edit = {
		eta: 300,
		init: function() {
			var list = {};
			$('#certifications_box .cert_row').each(function() {
				var c = $.parseJSON($(this).attr('alt'));
				cert_edit.data[c['id']] = c;
				cert_edit.data[c['id']]['modules'] = c['modules'].split(',');
				$(this).attr('alt',c['id']);
				var cl = String($(this).attr('class')).split(' ')[1];
				if (cl in list) {
					list[cl]++;
				} else {
					list[cl] = 1;
				}
			});
			
			//Sort List
			for (i in list) {
				$('#sidebar_order_by').append('<li><a href="' + i + '">' + schools[i]['title'] + ' (<span>' + list[i] + '</span>)</a></li>');
			}
			$('#sidebar_order_by').show();
			
			this.init_sp($('#certifications_box'));
			
			$('#add_cert').click(function(e) {
				e.preventDefault();
				if ($('#cert_new').length == 0) {
					cert_edit.add_cert();
				}
			});
		},
		data: {},
		parts: {
			box: function() {
				return $('<div class="order_slide"></div>');
			},
		},
		init_sp: function(id) {
			$('.sp',id).click(function(e) {
				e.preventDefault();
				if ($(this).hasClass('sp_quick')) {
					var id = ($(this).addClass('active').parent().parent().parent().attr('id')).replace( /^\D+/g,'');
					if ($('#cert_' + id + ' .order_slide').length != 0) {
						$('#cert_' + id + ':not(.add_cert) .order_slide').slideUp(cert_edit.eta,function() {
							$(this).remove();
							$('.sp_quick.active',id).removeClass('active');
						});
					}
					else {
						$('.cert_row:not(.add_cert) .order_slide').slideUp(cert_edit.eta,function() {
							$(this).remove();
						});
						$('.sp_quick.active',id).removeClass('active');
						var ext = ($(this).attr('class')).split(' ')[2];
						
						cert_edit.init_edit(ext,id);
					}
				} else 	if ($(this).hasClass('sp_delete')) {
								
				}
			});
		},
		init_edit: function(ext,id,add) {
			add = typeof add === 'undefined' ? false : true;
			if (ext in cert_edit.parts) {
				cert_edit.place(ext,id);
				cert_edit.init_form(id,add);
				if (!add) {
					cert_edit.fill_form(id);
				}
			}
			else {
				$.ajax({
					url: 'ajax/get_quick_edit_form/' + ext,
					success: function(response) {
						cert_edit.parts[ext] = function() {
							return $(response);
						}
						cert_edit.place(ext,id);
						cert_edit.init_form(id,add);
						if (!add) {
							cert_edit.fill_form(id);
						}
					},
				});
			}
		},
		init_form: function(id,add) {
			//BOTH
			var obj = $('#cert_' + id);
			$('.modules a',obj).click(function(e) {
				e.preventDefault();
				$(this).toggleClass('active');
				var i = [];
				$('.modules:visible a.active',obj).each(function() {
					i.push($(this).attr('alt'));
				});
				$('input[name="modules"]',obj).val(i.join(','));
				if (add) {
					var tmp_mod = i.join(',');
					$('li.title .mod',obj).text(tmp_mod == '' ? 'X,X,X,X,X' : tmp_mod);
				}
			});
			$('input[name="modules"]',obj).blur(function() {
				var v = ($(this).val()).replace(/[^\d,]+/g,'');
				var arr = v.split(',');
				for (i in arr) {
					if (arr[i] <= $('.modules:visible a',obj).length) {
						if (typeof value === 'undefined') {
							var value = arr[i];
						} else {
							value += ',' + arr[i];
						}
					}
				}
				
				$(this).val(value);
				$('li.title .mod',obj).text(value == '' ? 'X,X,X,X,X' : value);
				cert_edit.highlight_links(id,true);
			});
			$('select[name="school"]',obj).change(function() {
				$('.modules',obj).hide().filter('.' + $(this).val()).show();
				cert_edit.highlight_links(id,true);
			});
			
			//Color
			var hex_test = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i;
			$('input[name="color"]',obj).change(function() {
				var c = '#' + $('input[name="color"]',obj).val();
				if (hex_test.test(c)) {
					$('.color_block',obj).removeClass('error').css({background: c});
					if (add) {
						$('ul.body',obj).css({borderColor: c});
					}
				} else {
					$('.color_block',obj).addClass('error').css({background: ''});
					if (add) {
						$('ul.body',obj).css({borderColor: '#EEDFE5'});
					}
				}
			});
			
			//ADD
			if (add) {
				$('a.submit,h4',obj).text('Add Certification');
				
				$('select[name="school"]').prepend('<option class="default" value="" selected="selected">Select School</option>');
				$('select[name="school"]').change(function() {
					var i = $(this).val();
					$('li.title .school',obj).text(schools[i]['title']);
					$('li.title .serial',obj).text(schools[i]['serial']);
					$('a.cert_link').attr('href',schools[i]['url'] + 'certifications/' + $('input[name="cert_link"]').val());
				});
				$('input[name="cert_link"]').on('change blur keyup',function() {
					var i = $('select[name="school"]').val();
					$('a.cert_link').attr('href',schools[i]['url'] + 'certifications/' + $(this).val());
				});
				$('input[name="title_private"]',obj).on('change blur keyup',function() {
					var v = $(this).val() == '' ? 'XXXX' : $(this).val();
					$('li.title .title',obj).text(v);
				});
			} 
			
			//Submit Change
			$('a.submit',obj).click(function(e) {
				e.preventDefault();
				var validated = true; //for add
				var form = {};
				$(':input',obj).each(function() {
					var name = $(this).attr('name');
					/*if (name == 'modules') {
						form[name] = String($(this).val()).split(',');
					} else {*/
					form[name] = $(this).val();
					//}
					
					if (add) { //Add
						if (form[name] == '') {
							$(this).addClass('error');
							validated = false;
						} else {
							$(this).removeClass('error');
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
								$('.loading_small',obj).removeClass('success').addClass('loading');
							},
							success: function(response) {
								if (!response) { //failure
									$('.loading_small',obj).removeClass('loading').addClass('failure');
								}
								else { //success
									id = String(response);
									$('.loading_small',obj).removeClass('loading').addClass('success');
									
									cert_edit.data[id] = form;
									cert_edit.data[id]['id'] = id;
									
									$(obj).attr('id','cert_' + id).attr('class','cert_row ' + cert_edit.data[id]['school'] + ' ' + cert_edit.data[id]['name']).attr('alt',id);
									$('.order_slide',obj).slideUp(cert_edit.eta,function() {
										$(this).remove();
										$('#add_cert').show();
									});
									var ext = 'edit_cert'; //($(obj).attr('class')).split(' ')[2];
									var li = $('.cert_row:first li.links').clone();
									$('li.links',obj).replaceWith(li);
									cert_edit.init_sp(obj);
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
							if ($(form[i]).not(cert_edit.data[id][i]).length != 0 || $(cert_edit.data[id][i]).not(form[i]).length != 0) { //check change
								data[i] = form[i];
								cert_edit.data[id][i] = form[i];
							}
						} else {
							if (cert_edit.data[id][i] != form[i]) { //cehck change
								data[i] = form[i];
								cert_edit.data[id][i] = form[i];
							}
						}
					}

					if ($.isEmptyObject(data)) {
						$('.loading_small',obj).removeClass('success').addClass('loading');
						var t = setTimeout(function() {
							$('.loading_small',obj).removeClass('loading').addClass('success');
							return;
						},200); //Show success
					} else {
						$.ajax({
							url: 'ajax/update_cert/' + id,
							type: "GET",
							data: data,
							beforeSend: function() {
								$('.loading_small',obj).removeClass('success').addClass('loading');
							},
							success: function(response) {
								if (response != 1) { //failure
									$('.loading_small',obj).removeClass('loading').addClass('failure');
								}
								else { //success
									$('.loading_small',obj).removeClass('loading').addClass('success');
									if ('school' in data) {
										$('li.title .school',obj).text(schools[cert_edit.data[id]['school']]['title']);
										$('li.title .serial',obj).text(schools[cert_edit.data[id]['school']]['serial']);
									}
									if ('modules' in data) {
										$('li.title .mod',obj).text(cert_edit.data[id]['modules'].join(','));
									}
									if ('color' in data) {
										$('ul.body',obj).css({borderColor:'#' + cert_edit.data[id]['color']});
									}
									if ('title_private' in data) {
										$('li.title .title',obj).text(cert_edit.data[id]['title_private']);
									}
								}
							},
						});
					}
				}
			});
		},
		fill_form: function(id) {
			var obj = $('#cert_' + id);
			$('.cert_link',obj).attr('href',schools[cert_edit.data[id]['school']]['url'] + 'certifications/' + cert_edit.data[id]['cert_link']);
			$(':input',obj).each(function() {
				if ($(this).attr('name') == 'modules') {
					$(this).val(cert_edit.data[id][$(this).attr('name')].join(','));
				} else {
					$(this).val(cert_edit.data[id][$(this).attr('name')]);
				}
			});
			$('select',obj).each(function() {
				$('option[value="' + cert_edit.data[id][$(this).attr('name')] + '"]',this).attr('selected','selected');
			});
			
			//Modules
			var links = $('.modules.' + cert_edit.data[id]['school'],obj);			
			$(links).show();
			this.highlight_links(id);
			
			//Color
			$('.color_block',obj).css({background: '#' + cert_edit.data[id]['color']});
		},
		add_cert: function() {
			$('#add_cert').hide();
			var obj = $('#certifications_box .cert_row:last').clone();
			$('.order_slide',obj).remove();
			
			//Text
			$('li.title .school, li.title .serial, li.title .title',obj).text('XXXX');
			$('li.title .mod',obj).text('X,X,X,X,X');
			
			
			//Place
			$(obj).attr('class','cert_row').attr('id','cert_new').attr('alt','').addClass('add_cert').show().insertBefore('#add_cert');
			var id = 'new';
			var ext = 'edit_cert';
			var a = $('<li class="links"><a class="sp sp_cancel" href="#" title="Cancel New Certification"></a></li>').click(function(e) {
				e.preventDefault();
				$(obj).slideUp(cert_edit.eta,function() {
					$(this).remove();
				$('#add_cert').show();
				});
			});
			$('li.links',obj).remove();
			$('ul.body',obj).append(a);
			
			cert_edit.init_edit(ext,id,true);
		},
		highlight_links: function(id,overwrite) {
			var obj = $('#cert_' + id);
			overwrite = typeof overwrite === 'undefined' ? false : overwrite;
			if (overwrite) {
				$('.modules:visible a.active',obj).removeClass('active');
			}
			var active = overwrite ? ($('input[name="modules"]',obj).val()).split(',') : cert_edit.data[id]['modules'];
			for (var i = 0;i < active.length;i++) {
				$('.modules:visible a.mod_' + active[i],obj).addClass('active');
			}
		},
		place: function(ext,id) {
			var box = new cert_edit.parts.box();
			var obj = cert_edit.parts[ext];

			box = $(box).addClass('order_slide_' + ext).html(obj); //clean
			$(box).appendTo('#cert_' + id).hide().slideDown(cert_edit.eta);
			$('#cert_' + id + ' .sp_quick',obj).addClass('active');
		},
	};
	
	cert_edit.init();
	w_s.init({
		sidebar: '#sidebar_order_by',
		box: '#certifications_box',
		sub_box: '#certifications_box .cert_row:not(#cert_new)',
		item: '#certifications_box .cert_row:not(#cert_new)',
	});
});