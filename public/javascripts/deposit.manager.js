$(function() {

  var socket_outgoing = {
    REQUEST_INVENTORY: 'DEPOSIT_OUT_REQUEST_INVENTORY',
    FORCE_REQUEST_INVENTORY: 'DEPOSIT_OUT_FORCE_REQUEST_INVENTORY',
    SUBMIT_DEPOSIT: 'DEPOSIT_OUT_SUBMIT_DEPOSIT'
  };

  var socket_incoming = {

  };

  var sortType = {
    DESC: 1,
    ASC: 2,
    AZ: 3,
    ZA: 4
  };

  var itemGrades = {
    CONSUMER: 'consumer',
    INDUSTRIAL: 'indsutrial',
    MIL_SPEC: 'mil-spec',
    RESTRICTED: 'restricted',
    CLASSIFIED: 'classified',
    COVERT: 'covert',
    GOLD: 'gold'
  };

  var MIN_PRICE = 0.05;

  var $depositModal = $('#modal-deposit');
  var $emptyNotify = $('#modal-deposit .empty');
  var $spinner = $('#modal-deposit .spinner');
  var $itemsContainer = $('#modal-deposit .modal-content');
  var $sortSelect = $('#modal-deposit .modal-dropdown');
  var $forceRefresh = $('#modal-deposit .modal-content-settings p');
  var $priceCounter = $('#modal-deposit .price-counter p');
  var $submit = $('#modal-deposit .deposit-submit p');

  var self;
  var loading = true;

  function DepositManager() {
    self = this;

    this.items = [];
    this.sortType = sortType.DESC;

    this.selectedItems = [];
    this.totalPrice = 0.00;
  }

  DepositManager.prototype.submitDeposit = function() {
    socket.emit(socket_outgoing.SUBMIT_DEPOSIT, {
      items: this.selectedItems
    }, (err, data) => {
      if (err) {
        return swal('Deposit Error', 'Error while depositing: ' + err, 'error');
      }
      //data.trade_url
      //TODO
    });
  }

  DepositManager.prototype.forceRefresh = function() {
    $depositModal.find('.deposit-item').remove();
    $priceCounter.text('0.00');
    $spinner.show();
    loading = true;

    socket.emit(socket_outgoing.FORCE_REQUEST_INVENTORY, (err, inv) => {
      loading = false;
      $spinner.hide();

      if (err) {
        self.loadInventory();
        return swal('Inventory Error', 'Error while refreshing: ' + err, 'error');
      }

      var inventory = JSON.parse(inv);
      self.parseInventory(inventory);
    });
  }

  DepositManager.prototype.requestInventory = function() {
    $spinner.show();
    loading = true;

    socket.emit(socket_outgoing.REQUEST_INVENTORY, (err, inv) => {
      $depositModal.find('.spinner').hide();
      loading = false;

      if (err) {
        swal('Inventory Error', 'Error while loading your inventory: ' + err, "error");
        $.modal.getCurrent().close();
        return;
      }

      var inventory = JSON.parse(inv);
      self.parseInventory(inventory);
    });
  }

  DepositManager.prototype.parseInventory = function(json) {
    self.items = [];
    json.forEach((obj) => {
      obj.grade = getItemGrade(obj.type);
      self.items.push(obj);
    });
    loading = false;
    self.loadInventory();
  }

  DepositManager.prototype.loadInventory = function() {
    $depositModal.find('.deposit-item').remove();
    $priceCounter.text('0.00');

    self.totalPrice = 0.00;
    self.selectedItems = [];

    if (self.items.length == 0) {
      $emptyNotify.show();
      return;
    }

    $emptyNotify.hide();
    $spinner.hide();

    sortInventoryArray(self.items, self.sortType);
    for (var index in self.items) {
      var item = self.items[index];
      self.addInventoryItem(item);
    }
  }

 /*
 <div class="deposit-item consumer" asset-id="423ncjj130xkd">
   <img src="http://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXX7gNTPcUlrBpNQ0LvROW-0vDYVkQ6fABW77mhKlYxhKacImwT74znwtDSzvOkZriCkm8Cu5UojO_Foo_x3hqkpRTgYuAtow/330x192"></img>
   <span>54.32</span>
   <p>CS:GO Case Key (Field-Tested)</p>
 </div>
  */
  DepositManager.prototype.addInventoryItem = function(item) {
    var isDisabled = item.price <= MIN_PRICE;
    var url = '//steamcommunity-a.akamaihd.net/economy/image/' + item.icon_url;

    var html = '<div class="deposit-item ' + item.grade + ' ' + (isDisabled ? 'disabled' : '') + '" asset-id="' + item.assetid + '">' +
                '<img src="' + url + '"></img>' +
                '<span>' + item.price + '</span>' +
                '<p>' + item.market_hash_name + '</p>' +
               '</div>';
    $itemsContainer.append(html);
  }

  DepositManager.prototype.addSelectedItem = function(target) {
    var index = findIndex(self.items, target.attr('asset-id'));

    if (!~index) {
      return swal('Inventory Error', 'Unable to find selected item. Please contact a developer.', 'error');
    }

    var item = self.items[index];
    self.selectedItems.push(item);
    target.addClass('selected');
    self.totalPrice += item.price;

    $priceCounter.countup({
      startVal: self.totalPrice - item.price,
      endVal: self.totalPrice,
      decimals: 2
    });
  }

  DepositManager.prototype.removeSelectedItem = function(target) {
    var index = findIndex(self.selectedItems, target.attr('asset-id'));

    if (!~index) {
      return swal('Inventory Error', 'Unable to find selected item. Please contact a developer.', 'error');
    }

    var item = self.selectedItems[index];
    self.selectedItems.splice(index, 1);
    target.removeClass('selected');
    self.totalPrice -= item.price;

    $priceCounter.countup({
      startVal: self.totalPrice + item.price,
      endVal: self.totalPrice,
      decimals: 2
    });
  }

  new DepositManager();

  $depositModal.on($.modal.OPEN, (event) => {
    self.requestInventory();
  });

  $depositModal.on('click', '.deposit-item', (event) => {
    var target = $(event.currentTarget);
    if (target.hasClass('disabled')) {
      return false;
    }

    if (target.hasClass('selected')) {
      return self.removeSelectedItem(target);
    }

    self.addSelectedItem(target);
  });

  $submit.on('click', (event) => {
    if (self.selectedItems.length == 0) {
      return swal('Deposit', 'You need to select some items first!', 'info');
    }

    if (loading == true) {
      return swal('Deposit Error', 'You cannot submit while loading.', 'error');
    }

    self.submitDeposit();
  });

  $sortSelect.on('change', function(event) {
    if (loading == true) {
      return swal('Inventory Error', 'You cannot reload while loading your inventory.', 'error');
    }
    self.sortType = getSortType(this.value);
    self.loadInventory();
  });

  $forceRefresh.on('click', (event) => {
    if (loading == true) {
      return swal('Inventory Error', 'You cannot reload while loading your inventory.', 'error');
    }
    self.forceRefresh();
  });

  function findIndex(items, assetid) {
    for (var index in items) {
      if (items[index].assetid == assetid) {
        return index;
      }
    }
    return -1;
  }

  function sortInventoryArray(array, type) {
    array.sort((a, b) => {
      if (type == sortType.ZA) {
        return (b.name < a.name ? -1 : (b.name > a.name ? 1 : 0));
      } else if (type == sortType.ASC) {
        return a.price - b.price;
      } else if (type == sortType.AZ) {
        return (a.name < b.name ? -1 : (a.name > b.name ? 1 : 0));
      }
      return b.price - a.price;
    });
  }

  function getSortType(value) {
    switch (value) {
      case 'price-desc': return sortType.DESC
      case 'price-asc': return sortType.ASC
      case 'a-z': return sortType.AZ
      case 'z-a': return sortType.ZA
      default: return sortType.DESC
    }
  }

  function getItemGrade(name) {
    if (~name.indexOf('Knife')) {
      return itemGrades.GOLD;
    } else if (~name.indexOf('Consumer')) {
      return itemGrades.CONSUMER;
    } else if (~name.indexOf('Industrial')) {
      return itemGrades.INDUSTRIAL
    } else if (~name.indexOf('Mil-Spec')) {
      return itemGrades.MIL_SPEC;
    } else if (~name.indexOf('Restricted')) {
      return itemGrades.RESTRICTED;
    } else if (~name.indexOf('Classified')) {
      return itemGrades.CLASSIFIED;
    } else if (~name.indexOf('Covert')) {
      return itemGrades.COVERT;
    }
    return '';
  }

});
