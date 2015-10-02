function Add_Item(data) {
	data = typeof data === 'undefined' ? {} : data;
	for (var i in data) {
		this[i] = data[i];
	}
	if (!('Edit' in data)) {
		this['Edit'] = new Edit_Tabs();
	}
	this.init(); //Init
}

Add_Item.prototype = {
	trigger: 'add_ws',
	item: 'workshop_home_item',
	type: 'add',
	title: 'Workshop',
	init: function() {
		var Obj = this;
		$('#' + Obj.trigger).click(function(e) {
			e.preventDefault();
			var clone = $('.' + Obj.item + ':first').clone();
			clone = Obj.init_clone(clone).show();
			$(clone).insertAfter(this);
			$(this).slideUp(Obj.Edit.eta);
			Obj.Edit.remove(false,'.' + Obj.Edit.append_to);
			Obj.Edit.load(Obj.type,$(clone).attr('data-id'));
		});
	},
	init_clone: function(subj) {
		var Obj = this;
		var c = ($(subj).attr('class')).split(' ');
		//Clean
		$(subj).removeAttr('id').removeAttr('data-search').attr('data-id',Obj.trigger).attr('class',(c[0] + ' ' + c[1] + ' ' + Obj.trigger));
		$('.title_row',subj).html('<h3>Add ' + Obj.title + '</h3><br />');
		$('li.links ul',subj).html('<li><a class="sp sp_cancel" href="#"></a></li>');
		$('.sp_cancel',subj).click(function(e) {
			e.preventDefault();
			Obj.exit();
		});
		$('.' + Obj.Edit.slide_class,subj).remove();
		
		return subj;
	},
	exit: function() {
		var Obj = this;
		$('[data-id="' + Obj.trigger + '"]').slideUp(Obj.Edit.eta,function() {
			$(this).remove();
		});
		$('#' + Obj.trigger).slideDown(Obj.Edit.eta);
	},
	deactivate: function() {
		var Obj = this;
		Obj.exit();
	},
};