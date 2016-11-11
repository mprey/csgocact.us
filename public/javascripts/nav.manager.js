$(function() {

	var $L = 955,
		$menu_navigation = $('#main-nav'),
		$user_trigger = $('#user-trigger'),
		$hamburger_icon = $('#hamburger-menu'),
		$lateral_user_menu = $('#user-menu'),
		$shadow_layer = $('#shadow-layer'),
		$notification_counter = $('.notification-counter'),
		$chat_trigger = $('#chat-trigger-a'),
		$lateral_chat_box = $('#chat-box'),
		$chat_exit = $('#chat-exit');

	var isChatOpen = false;

	$chat_exit.on('click', function(event) {
		event.preventDefault();

		//emulate the shadow layer being clicked to exit cuz im lazy
		$shadow_layer.click();
	});

	//open lateral menu on mobile
	$hamburger_icon.on('click', function(event) {
		event.preventDefault();
		//close all lateral menus
		$lateral_user_menu.removeClass('speed-in');
		$lateral_chat_box.removeClass('speed-in');
		togglePaneVisibility($menu_navigation, $shadow_layer, $('body'));
	});

	//open cart
	$user_trigger.on('click', function(event) {
		event.preventDefault();
		//close all lateral menus
		$menu_navigation.removeClass('speed-in');
		$lateral_chat_box.removeClass('speed-in');
		togglePaneVisibility($lateral_user_menu, $shadow_layer, $('body'));
	});

	$chat_trigger.on('click', function(event) {
		event.preventDefault();
		window.isChatOpen = true;
		chat_manager.clearNotifications();

		//close all lateral menus
		$lateral_user_menu.removeClass('speed-in');
		$menu_navigation.removeClass('speed-in');
		togglePaneVisibility($lateral_chat_box, $shadow_layer, $('body'));
	});

	//close lateral cart, lateral menu, or lateral chat
	$shadow_layer.on('click', function() {
		$shadow_layer.removeClass('is-visible');
		// firefox transitions break when parent overflow is changed, so we need to wait for the end of the trasition to give the body an overflow hidden
		if ($lateral_user_menu.hasClass('speed-in')) {
			$lateral_user_menu.removeClass('speed-in').on('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
				$('body').removeClass('overflow-hidden');
			});
			$menu_navigation.removeClass('speed-in');
			$lateral_chat_box.removeClass('speed-in');
		} else if ($menu_navigation.hasClass('speed-in')) {
			$menu_navigation.removeClass('speed-in').on('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
				$('body').removeClass('overflow-hidden');
			});
			$lateral_user_menu.removeClass('speed-in');
			$lateral_chat_box.removeClass('speed-in');
		} else {
			$lateral_chat_box.removeClass('speed-in').on('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
				$('body').removeClass('overflow-hidden');
			});
			$lateral_user_menu.removeClass('speed-in');
			$menu_navigation.removeClass('speed-in');
			window.isChatOpen = false;
		}
	});

	$(document).keyup(function(e) {
  	if (e.keyCode === 27) { //esc key
			$shadow_layer.click();
		}
	});

	//move #main-navigation inside header on laptop
	//insert #main-navigation after header on mobile
	moveNavigation($menu_navigation, $L);
	$(window).on('resize', function() {
		moveNavigation( $menu_navigation, $L);

		if($(window).width() >= $L && $menu_navigation.hasClass('speed-in')) {
			$menu_navigation.removeClass('speed-in');
			$shadow_layer.removeClass('is-visible');
			$('body').removeClass('overflow-hidden');
		}
	});
});

function togglePaneVisibility($lateral_panel, $background_layer, $body) {
	if ($lateral_panel.hasClass('speed-in')) {
		// firefox transitions break when parent overflow is changed, so we need to wait for the end of the trasition to give the body an overflow hidden
		$lateral_panel.removeClass('speed-in').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function() {
			$body.removeClass('overflow-hidden');
		});
		$background_layer.removeClass('is-visible');

	} else {
		$lateral_panel.addClass('speed-in').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function() {
			$body.addClass('overflow-hidden');
		});
		$background_layer.addClass('is-visible');
	}
}

function updateNavBar() {
	$('.nav-item').each(function(item) {
		$(this).removeClass('current');
		if (window.location.pathname.indexOf($(this).attr('page-title')) != -1) {
			$(this).addClass('current');
		}
	});
}

function moveNavigation($navigation, $MQ) {
	if ($(window).width() >= $MQ) {
		$navigation.detach();
		$navigation.appendTo('header');
	} else {
		$navigation.detach();
		$navigation.insertAfter('header');
	}
}
