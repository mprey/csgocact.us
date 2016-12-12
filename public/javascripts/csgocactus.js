$(function() {

  var $balance_reload = $('#balance-reload');
  var $balance_label = $('#balance-label');

  var requestingBalance = false;
  var requestBalanceTimeout = 0;
  var canRequestBalance = true;

  var socket_outgoing = {
    REQUEST_UPDATE_BALANCE: 'REQUEST_UPDATE_BALANCE',
    INIT: 'INIT_MAIN',
  };

  var socket_incoming = {
    ALERT: 'ALERT',
    NOTIFY: 'NOTIFY',
    FORCE_RELOAD: 'FORCE_RELOAD',
    UPDATE_BALANCE: 'UPDATE_BALANCE',
    ADD_CREDITS: 'ADD_CREDITS',
    REMOVE_CREDITS: 'REMOVE_CREDITS',
    INIT: 'INIT_MAIN',
  };

  var socket = io.connect();

  toastr.options.closeButton = true;
  toastr.options.preventDuplicates = true;

  socket.emit(socket_outgoing.INIT);

  socket.on(socket_incoming.ALERT, function(data) { //data.header, data.message, data.type
    swal(data.header, data.message, data.type);
  });

  socket.on(socket_incoming.NOTIFY, function(data) {
    if (data.type == 'error') {
       toastr.error(data.message, data.header);
    } else if (data.type == 'warning') {
      toastr.warning(data.message, data.header);
    } else if (data.type == 'success') {
      toastr.success(data.message, data.header);
    } else {
      toastr.info(data.message, data.header);
    }
  });

  socket.on(socket_incoming.INIT, function(data) { //data.balance
    countUpBalance(data.balance);
  });

  socket.on(socket_incoming.FORCE_RELOAD, function() {
    swal('Window is now reloading...');
    setTimeout(function() {
          location.reload();
    }, 2000);
  });

  socket.on(socket_incoming.ADD_CREDITS, function(data) { //data.balance, data.added
    toastr.success('Added ' + data.added + ' credits to your account.', 'User Balance');
    countUpBalance(data.balance);
  });

  socket.on(socket_incoming.REMOVE_CREDITS, function(data) { //data.balance, data.removed
    countUpBalance(data.balance);
  });

  socket.on(socket_incoming.UPDATE_BALANCE, function(data) { //data.balance
    countUpBalance(data.balance);
    stopBalanceUpdate(false);
  });

  $balance_reload.on('click', function() {
    if (!requestingBalance) {
      if (canRequestBalance) {
        requestBalanceUpdate();
      } else {
        swal('Overflow', 'You are making requests too quickly', 'error');
      }
    }
  });

  function requestBalanceUpdate() { //animate the button, disable it, send the request, set a timeout for 10 seconds
    requestingBalance = true;
    canRequestBalance = false;
    $balance_reload.toggleClass('animate');
    socket.emit(socket_outgoing.REQUEST_UPDATE_BALANCE);
    requestingBalanceTimeout = setTimeout(function() {
      stopBalanceUpdate(true);
    }, 10000);
    setTimeout(function() {
      canRequestBalance = true;
    }, 10000);
  }

  function stopBalanceUpdate(error) {
    requestingBalance = false;
    $balance_reload.toggleClass('animate');
    clearTimeout(requestingBalanceTimeout);
    requestingBalanceTimeout = 0;
    if (error) {
      toastr.error('Unable to update balance', 'Error');
    }
  }

  function countUpBalance(newBalance) {
    var existingBalance = 0;
    if ($.isNumeric($balance_label.text())) {
      existingBalance = Number($balance_label.text());
      if (existingBalance == newBalance) {
        existingBalance = 0;
      }
    }
    new CountUp('balance-label', existingBalance, newBalance, 2, 2.5, {
      separator : ''
    }).start();
  }

  window.socket = socket;

});
