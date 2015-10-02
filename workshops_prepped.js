$(document).ready(function() {
	var w_p = {
		init: function() {
			$('#w_p_textarea').val('').blur(function() {
				$('#ctrl_c').fadeOut(200,function() {
					$(this).remove();
				});
			});
			$('.w_p_list input').attr('checked',false);
			
			$('.w_p_list input').click(function() {
				var request = $(this).attr('value');
				
				if (!(request in w_p.storage)) {
					w_p.get(request);
				} else {
					w_p.place(request);
				}
			});
		},
		storage: {},
		place: function(request) {
			$('#w_p_render').html(w_p.storage[request]);
			var t = $('#w_p_render').text();
			t = t.replace(/\t/g, "");
			$('#w_p_textarea').val(t);
			this.tooltip();
		},
		get: function(request) {
			$.ajax({
				url: 'ajax/get_workshops_prepped/' + request,
				success: function(response) {
					w_p.storage[request] = response;
					w_p.place(request);
				}
			});
		},
		compress: function(obj) {
		
		},
		tooltip: function() {
			$('<p id="ctrl_c" class="center"><span class="tooltip mono">Ctrl + C</span></p>').insertBefore('#w_p_textarea');
			$('#w_p_textarea').select().keydown(function(e) {
				if (e.keyCode == 67 && e.ctrlKey) {
					$('#ctrl_c .tooltip').css({ textDecoration: 'underline' });
					var t = setTimeout(function() {
						$('#ctrl_c .tooltip').css({ textDecoration: 'none' });
					},200);
				}
			});		
		},
	};
	
	w_p.init();
});