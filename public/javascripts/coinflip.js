$(function() {

  var $page_content = $('.page-content');
  var $dropdown_trigger = $('#cf-dropdown-trigger');
  var $sort_trigger = $('#cf-sort-button');
  var $promo_input = $('#cf-promo-input');
  var $promo_submit = $('#cf-promo-submit');
  var $refresh_games = $('#cf-games-reload');

  var $online = $('#cf-online');
  var $total_wagered = $('#cf-wagered');
  var $open_games = $('#cf-open-games');

  var $create_game = $('#create-game');
  var $games_loader = $('.cf-games-loader');
  var $games_table = $('.cf-games-table');
  var $table_wrapper = $('#cf-table-wrapper');
  var $user_history = $('#cf-user-history-table');
  var $user_history_counter = $('#user-game-amount');
  var $history = $('#cf-history-table');
  var $history_counter = $('#history-game-amount');
  var $leaderboards = $('#cf-leaderboards-table');

  var $create_modal = $('#cf-modal-create-game');
  var $input_range = $('#cf-input-range');
  var $input_amount = $('#cf-amount-input');
  var $finalize_game = $('#finalize-game');
  var $t_coin = $('#t-coin');
  var $ct_coin = $('#ct-coin');

  var socket_incoming = {
    INIT_COINFLIP: 'COINFLIP_IN_INIT_COINFLIP',
    PROMO_CODE_END: 'PROMO_CODE_END',
    USER_HISTORY_DATA: 'COINFLIP_IN_USER_HISTORY_DATA',
    CURRENT_GAMES_DATA: 'COINFLIP_IN_CURRENT_GAMES_DATA'
  };

  var socket_outgoing = {
    INIT_COINFLIP: 'COINFLIP_OUT_INIT_COINFLIP',
    REQUEST_PROMO_CODE: 'REQUEST_PROMO_CODE',
    REQUEST_CURRENT_GAMES: 'COINFLIP_OUT_REQUEST_CURRENT_GAMES'
  };

  var _this;

  function CoinflipManager() {
    this.socket = socket;

    _this = this;

    this.socket.on(socket_incoming.INIT_COINFLIP, this.initCoinflip);
    this.socket.on(socket_incoming.USER_HISTORY_DATA, this.loadUserHistoryFromSocket);
    this.socket.on(socket_incoming.CURRENT_GAMES_DATA, this.loadCurrentGamesFromSocket);

    this.socket.emit(socket_outgoing.INIT_COINFLIP);
  }

  CoinflipManager.prototype.initCoinflip = function(data) { //data.online, data.total_wagered, data.games, data.history, data.leaderboards
    $games_loader.hide();
    $online.text(data.online);
    $total_wagered.text(data.total_wagered);
    $open_games.text(data.games.length);

    _this.currentGames = data.games;
    _this.globalHistory = data.history;
    _this.leaderboards = data.leaderboards;

    _this.initData();
  }

  CoinflipManager.prototype.watchGame = function(game) {
    //TODO
  }

  /*
   *  COINNFLIP OBJECT:
   *    _id (unique identifier for each game)
   *    creator_name (name of the creator)
   *    creator_img (img of the creator)
   *    joiner_name (name of the joiner)
   *    joiner_img (img of the joiner)
   *    starting_face (face the coinflip game is created on (1 == tails, 0 == heads))
   *    winning_face (face of the coinflip game created)
   *    amount (number of credits the game entry is)
   *    winner_name (name of the winner)
   *    winner_img (img of the winner)
   *    user_name (name of the user for user_history)
   *    user_img (img of the user for user_history)
   *    won (boolean value if the user won for user_history)
   *    completed (boolean value if the game is completed)
   *    date_created (date time the game was created)
   */

  CoinflipManager.prototype.initData = function() {
    this.loadCurrentGames(true);
    this.loadGlobalHistory();
    this.loadLeaderboards();
    this.loadUserHistory();
  }

  /*
  * <div class="cf-tr">
  *   <div class="cf-td" id="cf-td-profile"><img id="cf-profile" src="images/large-logo-bg.png"></img><span>mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm</span></div>
  *   <div class="cf-td" id="cf-td-status"><span>Join</span></div>
  *   <div class="cf-td" id="cf-td-side"><span>456.32</span><img id="cf-side" class="t-coin"></img></div>
  * </div>
  */
  CoinflipManager.prototype.loadCurrentGames = function(desc) {
    $games_table.empty();
    $table_wrapper.show();

    sortCoinflipGames(this.currentGames, desc);

    for (var index in this.currentGames) {
      var game = this.currentGames[index];
      formatGame(game);
      $games_table.append('<div class="cf-tr" game-id="' + game._id + '">' +
                            '<div class="cf-td" id="cf-td-profile">' +
                              '<img id="cf-profile" src="' + game.creator_img + '"></img>' +
                              '<span>' + game.creator_name + '</span>' +
                            '</div>' +
                            '<div class="cf-td ' + (game.in_progress ? 'in-progress' : '') + '" id="cf-td-status>"' +
                              '<span>' + (game.in_progress ? 'In Progress' : 'Join') + '</span>' +
                            '</div>' +
                            '<div class="cf-td" id="cf-td-side">' +
                              '<span>' + game.amount + '</span>' +
                              '<img id="cf-side" class="' + (game.starting_face == 0 ? 't-coin' : 'ct-coin') + '"</img>' +
                            '</div>' +
                          '</div>');

    }

    if (this.currentGames.length == 0) {
      $table_wrapper.addClass('empty');
    } else {
      $table_wrapper.removeClass('empty');
    }
  }

  CoinflipManager.prototype.loadCurrentGamesFromSocket = function(data) {
    _this.currentGames = data.games;
    _this.loadCurrentGames();
  }

  /*
   * <tr>
   *  <td id="history-side"><img class="t-coin"></img></td>
   *  <td id="history-user"><img src="images/large-logo-bg.png"></img><span>mprey</span></td>
   *  <td id="history-amount"><span>5.45</span></td>
   * </tr>
   */

  CoinflipManager.prototype.loadGlobalHistory = function() {
    $history.empty();
    $history_counter.text(this.globalHistory.length);

    for (var index in this.globalHistory) {
      var game = this.globalHistory[index];
      formatGame(game);
      $history.append('<tr>' +
                        '<td id="history-side"><img class="' + (game.winning_face == 0 ? 't-coin' : 'ct-coin') + '"></img></td>' +
                        '<td id="history-user"><img src="' + game.winner_img + '"></img><span>' + game.winner_name + '</span></td>' +
                        '<td id="history-amount"><span>' + game.amount + '</span></td>' +
                      '</tr>');
    }

    if (this.globalHistory.length == 0) {
      $history.parent().addClass('empty');
    } else {
      $history.parent().removeClass('empty');
    }
  }

  /*
   * <tr>
   *  <td id="history-side"><img class="t-coin"></img></td>
   *  <td id="history-user"><img src="images/large-logo-bg.png"></img><span>mprey</span></td>
   *  <td id="history-amount"><span class="lost">5.45</span></td>
   </tr>
   */
  CoinflipManager.prototype.loadUserHistory = function() {
    if (!this.userHistory) {
      $user_history.parent().find('.cf-games-loader').show();
      return;
    } else {
      $user_history.parent().find('.cf-games-loader').hide();
    }

    $user_history.empty();
    $user_history_counter.text(this.userHistory.length);

    for (var index in this.userHistory) {
      var game = this.userHistory[index];
      formatGame(game);
      $userHistory.append('<tr>' +
                            '<td id="history-side"><img class="' + (game.winning_face == 0 ? 't-coin' : 'ct-coin') + '"></img></td>' +
                            '<td id="history-user"><img src="' + game.user_img + '"></img><span>' + game.user_name + '</span></td>' +
                            '<td id="history-amount"><span class="' + (game.won ? 'won' : 'lost') + '">' + game.amount + '</span></td>' +
                          '</tr>');
    }

    if (this.userHistory.length == 0) {
      $user_history.parent().addClass('empty');
    } else {
      $user_history.parent().removeClass('empty');
    }
  }


  CoinflipManager.prototype.loadUserHistoryFromSocket = function(data) {
    _this.userHistory = data.user_history;
    _this.loadUserHistory();
  }

  /*
   * <tr>
   *  <td id="history-side"><span>1.</span></td>
   *  <td id="history-user"><img src="images/large-logo-bg.png"></img><span>fuck u</span></td>
   *  <td id="history-amount"><span class="record">5.45</span></td>
   * </tr>
   */
  CoinflipManager.prototype.loadLeaderboards = function() {
    $leaderboards.empty();

    for (var index in this.leaderboards) {
      var game = this.leaderboards[index];
      formatGame(game);
      $leaderboards.append('<tr>' +
                             '<td id="history-side"><span>' + (index + 1) + '.</span></td>' +
                             '<td id="history-user"><img src="' + game.winner_img + '"></img><span>' + game.winner_name + '</span></td>' +
                             '<td id="history-amount"><span class="record">' + game.amount + '</span></td>' +
                           '</tr>');
    }
  }

  CoinflipManager.prototype.createGame = function(side, amount) {
    $create_modal.find('#cf-create-wrapper').css('visibility', 'hidden');
    $create_modal.find('.modal-loader').show();
  }

  new CoinflipManager();

  $finalize_game.on('click', function(event) {
    var side = 0;
    if ($ct_coin.hasClass('selected')) {
      side = 1;
    }
    var amount = $input_amount.val();
    if (!$.isNumeric(amount)) {
      toastr.error('Unable to parse input: ' + amount, 'Error');
      return;
    }

    _this.createGame(side, amount);
  });

  $t_coin.on('click', function(event) {
    if (!$(this).hasClass('selected')) {
      $(this).addClass('selected');
    }
    $ct_coin.removeClass('selected');
  });

  $ct_coin.on('click', function(event) {
    if (!$(this).hasClass('selected')) {
      $(this).addClass('selected');
    }
    $t_coin.removeClass('selected');
  });

  $create_game.on('click', function(event) {
    if ($.isNumeric($('#balance-label').text())) {
      var balance = $('#balance-label').text();
      var value = balance * 0.3;
      $input_range.attr({
        max: balance
      });
      $input_amount.val(value.toFixed(2));
      $input_range.val(value.toFixed(2));
    }
  });

  $input_range.on('input change', function(event) {
    $input_amount.val(Number($input_range.val()).toFixed(2));
  });

  $input_amount.on('change keyup paste', function(event) {
    if ($.isNumeric($input_amount.val())) {
      $input_range.val($input_amount.val());
    }
  });

  $refresh_games.on('click', function(event) {
    event.preventDefault();
    $table_wrapper.parent().find('.cf-games-loader').show();
    $table_wrapper.hide();
  });

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
    $promo_input.removeClass('focus');
    $promo_submit.removeClass('submitting');
    $promo_submit.hide();
  });

  $promo_input.focus(function() {
    $(this).addClass('focus');
    $promo_submit.show();
  });

  $promo_submit.on('click', function(event) {
    if ($promo_input.val() && !$(this).hasClass('submitting')) {
      $(this).addClass('submitting');

      var code = $promo_input.val();
      socket.emit(socket_outgoing.REQUEST_PROMO_CODE, {
        code: code
      });
    } else {
      toastr.warning('Please enter a code before submitting.', 'Promo Code');
    }
  });

  function formatGame(obj) {
    obj.creator_name = escapeHTML(obj.creator_name);
    if (obj.hasOwnProperty("joiner_name")) {
      obj.joiner_name = escapeHTML(obj.joiner_name);
      obj.in_progress = true;
    } else {
      obj.in_progress = false;
    }
    if (obj.hasOwnProperty("user_name")) {
      obj.user_name = escapeHTML(obj.user_name);
    }
    if (obj.hasOwnProperty("winner_name")) {
      obj.winner_name = escapeHTML("winner_name");
    }
  }

  function sortCoinflipGames(array, desc) {
    array.sort(function(a, b) {
      var amountA = a.amount;
      var amountB = b.amount;
      if (amountA < amountB) {
        return desc ? -1 : 1;
      } else if (amountA > amountB) {
        return desc ? 1 : -1;
      } else {
        return 0;
      }
    });
  }

  function escapeHTML(unsafe) {
    return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function blurPromoInput() {
    $promo_input.removeClass('focus');
    $promo_submit.hide();
  }

  window.coinflipManager = _this;

});
