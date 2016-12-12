$(function() {

	function init() {

		var overlay = $('.md-overlay');
		$('.md-trigger').each(function(i, obj) {

			var el = $(obj);
			var modal = $('#' + el.attr('data-modal'));
			var close = modal.find('.md-close');

			function removeModal() {
				modal.removeClass('md-show');
				overlay.removeClass('md-show-overlay');
				overlay.removeClass('md-ignore-overlay');
			}

			el.on('click', function( ev ) {
				modal.addClass('md-show');
				overlay.addClass(modal.hasClass('md-no-overlay') ? 'md-ignore-overlay' : 'md-show-overlay');

				overlay.unbind('click');
				overlay.on('click', removeModal);
			});

			close.on('click', function(ev) {
				ev.stopPropagation();
				removeModal();
			});
		});
	}

	init();

});
