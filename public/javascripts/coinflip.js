$(function() {

  var $page_content = $('.page-content');
  var $dropdown_trigger = $('#cf-dropdown-trigger');
  var $sort_trigger = $('#cf-sort-button');
  var $promo_input = $('#cf-promo-input');
  var $promo_submit = $('#cf-promo-submit');

  console.log('ITS LOADING');

  var socket_incoming = {
    INIT_COINFLIP: 'COINFLIP_IN_INIT_COINFLIP',
    PROMO_CODE_END: 'PROMO_CODE_END'
  };

  var socket_outgoing = {
    INIT_COINFLIP: 'COINFLIP_OUT_INIT_COINFLIP',
    REQUEST_PROMO_CODE: 'REQUEST_PROMO_CODE'
  };

  function CoinflipManager() {
    this.socket = socket;

    this.socket.on(socket_incoming.INIT_COINFLIP, this.initCoinflip);
  }

  CoinflipManager.prototype.initCoinflip = function(data) { //data.online, data.open_games, data.total_wagered, data.games, data.history, data.user_history

  };

  var coinflip_manager = new CoinflipManager();

  $page_content.on('click', '#cf-dropdown-trigger', function(event) {
    var header = $(this).parent().parent();
    $(this).hide();
    if ($(this).hasClass('opened')) {
      $(this).next('#cf-dropdown-trigger').show();
    } else {
      $(this).prev('#cf-dropdown-trigger').show();
    }
    header.addClass('border-bottom');
    $(this).parent().parent().parent().find('.table-wrapper').slideToggle(function() {
      if (!($(this).is(':visible'))) {
        header.removeClass('border-bottom');
      }
    });
  });

  $page_content.on('click', '#cf-sort-button', function(event) {
    $(this).hide();
    if ($(this).hasClass('asc')) {
      //switch to descending
      $(this).next('#cf-sort-button').show();
    } else {
      //switch to ascending
      $(this).prev('#cf-sort-button').show();
    }
  });

  socket.on(socket_incoming.PROMO_CODE_END, function() {
    $promo_submit.removeClass('submitting');
    $promo_submit.attr('disabled', 'false');
  });

  $promo_input.focus(function() {
    $(this).addClass('focus');
    $promo_submit.show();
  });

  $promo_submit.on('click', function(event) {
    console.log('its submitting');
    if ($promo_input.val()) {
      $(this).addClass('submitting');
      $(this).attr('disabled', 'true');

      var code = $promo_input.val();
      socket.emit(socket_outgoing.REQUEST_PROMO_CODE, {
        code: code
      });
    } else {
      toastr.warning('Please enter a code before submitting.', 'Promo Code');
    }
  });

  function blurPromoInput() {
    $promo_input.removeClass('focus');
    $promo_submit.hide();
  }

  window.coinflip_manager = coinflip_manager;

});
