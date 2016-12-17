$(function() {

  var $pageContent = $('.page-content');
  var $promoInput = $('#cf-promo-input');
  var $promoSubmit = $('#cf-promo-submit');
  var $refresh_games = $('#cf-games-reload');

  var $online = $('#cf-online');
  var $totalWagered = $('#cf-wagered');
  var $openGames = $('#cf-open-games');

  var $createGame = $('#create-game');
  var $gamesLoader = $('.cf-games-loader');
  var $gamesTable = $('.cf-games-table');
  var $tableWrapper = $('#cf-table-wrapper');
  var $userHistory = $('#cf-user-history-table');
  var $userHistoryCounter = $('#user-game-amount');
  var $history = $('#cf-history-table');
  var $historyCounter = $('#history-game-amount');
  var $leaderboards = $('#cf-leaderboards-table');

  var $inputRange = $('#cf-input-range');
  var $inputAmount = $('#cf-amount-input');
  var $finalize_game = $('#finalize-game');
  var $tCoin = $('#t-coin');
  var $ctCoin = $('#ct-coin');

  var $gameModal = $('#cf-game-modal');
  var $gameModalId = $('#cf-game-id');
  var $gameModalHash = $('#cf-hash-code');

  var socket_incoming = {
    COINFLIP_INIT: 'COINFLIP_IN_INIT_COINFLIP',
    PROMO_CODE_END: 'PROMO_CODE_END',
    COINFLIP_USER_HISTORY_DATA: 'COINFLIP_IN_USER_HISTORY_DATA',
    COINFLIP_CURRENT_GAMES_DATA: 'COINFLIP_IN_CURRENT_GAMES_DATA',
    COINFLIP_ADD_GAME: 'COINFLIP_IN_ADD_GAME'
  };

  var socket_outgoing = {
    COINFLIP_INIT: 'COINFLIP_OUT_INIT_COINFLIP',
    REQUEST_PROMO_CODE: 'REQUEST_PROMO_CODE',
    COINFLIP_REQUEST_CURRENT_GAMES: 'COINFLIP_OUT_REQUEST_CURRENT_GAMES',
    COINFLIP_CREATE_GAME: 'COINFLIP_OUT_CREATE_GAME'
  };

  var gameType = {
    CURRENT: 1,
    HISTORY: 2,
    USER_HISTORY: 3,
    LEADERBOARDS: 4
  };

  var _this;
  var desc = true;

  var MIN_BET = 0.50;

  function CoinflipManager() {
    this.socket = socket;

    _this = this;

    this.socket.on(socket_incoming.COINFLIP_INIT, this.initCoinflip);
    this.socket.on(socket_incoming.COINFLIP_USER_HISTORY_DATA, this.loadUserHistoryFromSocket);
    this.socket.on(socket_incoming.COINFLIP_CURRENT_GAMES_DATA, this.loadCurrentGamesFromSocket);
    this.socket.on(socket_incoming.COINFLIP_ADD_GAME, this.addGame);

    this.socket.emit(socket_outgoing.COINFLIP_INIT);
  }

  CoinflipManager.prototype.initCoinflip = function(data) { //data.online, data.total_wagered, data.games, data.history, data.leaderboards
    $gamesLoader.hide();
    $online.text(data.online);
    $totalWagered.text(data.total_wagered);

    _this.currentGames = data.games;
    _this.globalHistory = data.history;
    _this.leaderboards = data.leaderboards;

    _this.initData();
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
  CoinflipManager.prototype.loadCurrentGames = function() {
    $gamesTable.empty();
    $tableWrapper.show();
    $openGames.text(this.currentGames.length);

    sortCoinflipGames(this.currentGames, desc);

    for (var index in this.currentGames) {
      var game = this.currentGames[index];
      formatGame(game);
      $gamesTable.append('<div class="cf-tr" game-id="' + game._id + '">' +
                            '<div class="cf-td" id="cf-td-profile">' +
                              '<img id="cf-profile" src="' + game.creator_img + '"></img>' +
                              '<span>' + game.creator_name + '</span>' +
                            '</div>' +
                            '<div id="cf-td-status" class="cf-td' + (game.in_progress ? ' in-progress' : '') + '">' +
                              '<span>' + (game.in_progress ? 'In Progress' : 'Join') + '</span>' +
                            '</div>' +
                            '<div class="cf-td" id="cf-td-side">' +
                              '<span>' + (Number(game.amount).toFixed(2)) + '</span>' +
                              '<img id="cf-side" class="' + (game.starting_face == 0 ? 't-coin' : 'ct-coin') + '"</img>' +
                            '</div>' +
                          '</div>');

    }

    if (this.currentGames.length == 0) {
      $tableWrapper.addClass('empty');
    } else {
      $tableWrapper.removeClass('empty');
    }
  }

  CoinflipManager.prototype.loadCurrentGamesFromSocket = function(data) {
    _this.currentGames = data.games;
    _this.loadCurrentGames();
  }

  CoinflipManager.prototype.refreshCurrentGames = function() {
    $tableWrapper.parent().find('.cf-games-loader').show();
    $tableWrapper.hide();
    socket.emit(socket_outgoing.COINFLIP_REQUEST_CURRENT_GAMES, function(data) {
      $tableWrapper.parent().find('.cf-games-loader').hide();
      _this.loadCurrentGamesFromSocket(data);
    });
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
    $historyCounter.text(this.globalHistory.length);

    for (var index in this.globalHistory) {
      var game = this.globalHistory[index];
      formatGame(game);
      $history.append('<tr game-id="' + game._id + '">' +
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
      $userHistory.parent().find('.cf-games-loader').show();
      return;
    } else {
      $userHistory.parent().find('.cf-games-loader').hide();
    }

    $userHistory.empty();
    $userHistoryCounter.text(this.userHistory.length);

    for (var index in this.userHistory) {
      var game = this.userHistory[index];
      formatGame(game);
      $userHistory.append('<tr game-id="' + game._id + '">' +
                            '<td id="history-side"><img class="' + (game.winning_face == 0 ? 't-coin' : 'ct-coin') + '"></img></td>' +
                            '<td id="history-user"><img src="' + game.user_img + '"></img><span>' + game.user_name + '</span></td>' +
                            '<td id="history-amount"><span class="' + (game.won ? 'won' : 'lost') + '">' + game.amount + '</span></td>' +
                          '</tr>');
    }

    if (this.userHistory.length == 0) {
      $userHistory.parent().addClass('empty');
    } else {
      $userHistory.parent().removeClass('empty');
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

  CoinflipManager.prototype.addGame = function(data) {
    _this.currentGames.push(data.game);
    _this.loadCurrentGames();
  }

  CoinflipManager.prototype.createGame = function(side, amount) {
    $.modal.getCurrent().showSpinner();

    socket.emit(socket_outgoing.COINFLIP_CREATE_GAME, {
      side: side,
      amount: amount
    }, _this.finishGameCreation);
  }

  CoinflipManager.prototype.finishGameCreation = function(error, game) {
    $.modal.getCurrent().hideSpinner();
    $.modal.close();

    if (game && !error) {
      _this.addGame({
        game: game
      });
    } else if (error){
      swal('Game Error', 'Error while creating the coinflip game: ' + error, 'error');
    }
  }

  CoinflipManager.prototype.promptGameEntry = function(gameId) {
    var game = findCoinflipGame(gameId, gameType.CURRENT);

    $gameModalId.text(game._id);
    $gameModalHash.text(game.hash_code);

    $gameModal.modal();
  }

  CoinflipManager.prototype.watchGame = function(game) {

  }

  new CoinflipManager();

  $tableWrapper.on('click', '#cf-td-status', function(event) {
    _this.promptGameEntry($(this).parent().attr('game-id'));
  });

  $finalize_game.on('click', function(event) {
    var side = 0;
    if ($ctCoin.hasClass('selected')) {
      side = 1;
    }
    var amount = $inputAmount.val();
    if (!$.isNumeric(amount)) {
      toastr.error('Unable to parse input: ' + amount, 'Error');
      return;
    }

    _this.createGame(side, amount);
  });

  $tCoin.on('click', function(event) {
    if (!$(this).hasClass('selected')) {
      $(this).addClass('selected');
    }
    $ctCoin.removeClass('selected');
  });

  $ctCoin.on('click', function(event) {
    if (!$(this).hasClass('selected')) {
      $(this).addClass('selected');
    }
    $tCoin.removeClass('selected');
  });

  $createGame.on('click', function(event) {
    if ($.isNumeric($('#balance-label').text())) {
      var balance = $('#balance-label').text();
      var value = balance * 0.3;
      if (!(value > MIN_BET)) {
        value = 0.00;
      }
      $inputRange.attr({
        max: balance
      });
      $inputAmount.val(value.toFixed(2));
      $inputRange.val(value.toFixed(2));
    }
  });

  $inputRange.on('input change', function(event) {
    $inputAmount.val(Number($inputRange.val()).toFixed(2));
  });

  $inputAmount.on('change keyup paste', function(event) {
    if ($.isNumeric($inputAmount.val())) {
      $inputRange.val($inputAmount.val());
    }
  });

  $refresh_games.on('click', function(event) {
    event.preventDefault();
    _this.refreshCurrentGames();
  });

  $pageContent.on('click', '#cf-dropdown-trigger', function(event) {
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

  $pageContent.on('click', '#cf-sort-button', function(event) {
    $(this).hide();
    if ($(this).hasClass('asc')) {
      desc = true;
      $(this).next('#cf-sort-button').show();
    } else {
      desc = false;
      $(this).prev('#cf-sort-button').show();
    }
    _this.loadCurrentGames();
  });

  socket.on(socket_incoming.PROMO_CODE_END, function() {
    $promoInput.removeClass('focus');
    $promoSubmit.removeClass('submitting');
    $promoSubmit.hide();
  });

  $promoInput.focus(function() {
    $(this).addClass('focus');
    $promoSubmit.show();
  });

  $promoSubmit.on('click', function(event) {
    if ($promoInput.val() && !$(this).hasClass('submitting')) {
      $(this).addClass('submitting');

      var code = $promoInput.val();
      socket.emit(socket_outgoing.REQUEST_PROMO_CODE, {
        code: code
      });
    } else {
      toastr.warning('Please enter a code before submitting.', 'Promo Code');
    }
  });

  function findCoinflipGame(gameId, type) {
    var array = [];
    if (!type || type == gameType.CURRENT) {
      array = _this.currentGames;
    } else if (type == gameType.HISTORY) {
      array = _this.globalHistory;
    } else if (type == gameType.USER_HISTORY) {
      array = _this.userHistory;
    } else if (type == gameType.LEADERBOARDS) {
      array = _this.leaderboards;
    }
    for (var index in array) {
      var game = _this.currentGames[index];
      if (game._id == gameId) return game;
    }
  }

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
        return desc ? 1 : -1;
      } else if (amountA > amountB) {
        return desc ? -1 : 1;
      } else {
        return 0;
      }
    });
  }

  function escapeHTML(unsafe) {
    return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function blurPromoInput() {
    $promoInput.removeClass('focus');
    $promoSubmit.hide();
  }

  window.coinflipManager = _this;

});
