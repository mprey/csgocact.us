$(function() {

  $balance_reload = $('#balance-reload');
  $balance_label = $('#balance-label');

  var socket_outgoing = {
    REQUEST_UPDATE_BALANCE: 'REQUEST_UPDATE_BALANCE'
  };

  var socket_incoming = {
    ALERT: 'ALERT',
    FORCE_RELOAD: 'FORCE_RELOAD',
    UPDATE_BLANE: 'UPDATE_BALANCE'
  };

  var socket = io.connect();

  toastr.options.closeButton = true;

  socket.on(socket_incoming.ALERT, function(data) {
    swal(data.header, data.message, data.type);
  });

  socket.on(socket_incoming.FORCE_RELOAD, function() {
    location.reload();
  });

  $balance_reload.on('click', function() {
    $balance_reload.toggleClass('animate');
  });

  function countUpBalance(newBalance) {
    var existingBalance = 0;
    if ($.isNumeric($balance_label.text().replace(/,/g, ''))) {
      existingBalance = Number($balance_label.text().replace(/,/g, ''));
    }
    new CountUp('balance-label', existingBalance, newBalance, 2, 2.5).start();
  }

  window.socket = socket;

});
