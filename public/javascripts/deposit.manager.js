$(function() {

  var socket_outgoing = {
    REQUEST_INVENTORY: 'DEPOSIT_OUT_REQUEST_INVENTORY'
  };

  var socket_incoming = {

  };

  var sortType = {
    DESC: 1,
    ASC: 2,
    AZ: 3,
    ZA: 4
  };

  var $depositModal = $('#modal-deposit');

  var self;

  function DepositManager() {
    self = this;

    this.items = [];
    this.sortType = sortType.DESC;
    this.loading = false;
  }

  DepositManager.prototype.requestInventory = function() {
    $depositModal.find('.deposit-item').remove();
    $depositModal.find('.spinner').show();
    self.loading = true;

    socket.emit(socket_outgoing.REQUEST_INVENTORY, (err, inv) => {
      $depositModal.find('.spinner').hide();
      self.loading = false;

      if (err) {
        swal('Inventory Error', err);
        return;
      }

      console.log('called back request inventory', err, inv);
    });
  }

 /*
 <div class="deposit-item consumer">
   <img src="http://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXX7gNTPcUlrBpNQ0LvROW-0vDYVkQ6fABW77mhKlYxhKacImwT74znwtDSzvOkZriCkm8Cu5UojO_Foo_x3hqkpRTgYuAtow/330x192"></img>
   <span>54.32</span>
   <p>CS:GO Case Key (Field-Tested)</p>
 </div>
  */
  DepositManager.prototype.addInventoryItem = function(item) {

  }

  DepositManager.prototype.loadInventory = function() {

  }

  new DepositManager();

  $depositModal.on($.modal.OPEN, (event) => {
    self.requestInventory();
  });

});
