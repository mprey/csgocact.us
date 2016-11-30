$(function() {

  var $page_content = $('.page-content');
  var $dropdown_trigger = $('#cf-dropdown-trigger');
  var $sort_trigger = $('#cf-sort-button');

  var socket_incoming = {
    INIT_COINFLIP: 'COINFLIP_IN_INIT_COINFLIP'
  };

  var socket_outgoing = {
    INIT_COINFLIP: 'COINFLIP_OUT_INIT_COINFLIP'
  };

  function CoinflipManager() {
    this.socket = socket;

    this.socket.on(socket_incoming.INIT_COINFLIP, this.initCoinflip);
  }

  CoinflipManager.prototype.initCoinflip = function(data) { //data.online, data.open_games, data.games

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

  window.coinflip_manager = coinflip_manager;

});
