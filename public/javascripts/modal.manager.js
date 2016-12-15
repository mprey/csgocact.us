$(function() {

	function init() {

		var overlay = $('.md-overlay');

		function removeModal() {
			var modal = $('body').find('.md-show');
			if (modal) {
				modal.removeClass('md-show');
				overlay.removeClass('md-show-overlay');
				overlay.removeClass('md-ignore-overlay');
			}
		}

		function showModal(modal) {
			modal.addClass('md-show');
			overlay.addClass(modal.hasClass('md-no-overlay') ? 'md-ignore-overlay' : 'md-show-overlay');

			overlay.unbind('click');
			overlay.on('click', removeModal);
		}

		$('body').on('click', '.md-trigger', function(event) {
			var modal = $('#' + $(this).attr('data-modal'));
			showModal(modal);
		});

		$('body').on('click', '.md-close', function(event) {
			event.stopPropagation();
			removeModal();
		});

		window.removeModal = removeModal;
		window.showModal = showModal;
	}

	init();

});
