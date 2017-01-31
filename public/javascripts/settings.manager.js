$(function() {

  var $client_settings_save = $('#client-settings-save');
  var $volume_slider = $('#volume-slider');
  var $scroll_checkbox = $('#scroll-checkbox');
  var $ping_checkbox = $('#ping-checkbox');
  var $steam_settings_refresh = $('#steam-settings-refresh');

  var $steam_profile_img = $('#profile-img');
  var $steam_profile_name = $('#steam-name');

  var $steamTradeURL = $('.steam-url');

  var canRequestSteam = true;
  var requestSteamTimeout = 0;

  var settings = new Settings();

  var socket_outgoing = {
    UPDATE_STEAM_SETTINGS: 'SETTINGS_OUT_UPDATE_STEAM',
    UPDATE_TRADE_URL: 'SETTINGS_OUT_UPDATE_TRADE_URL'
  };

  var socket_incoming = {
    UPDATE_STEAM_SETTINGS: 'SETTINGS_IN_UPDATE_STEAM'
  };

  var values = {
    "volume_value": 50,
    "autoscroll_value": 1,
    "message_ping_value": 1
  };

  function Settings() {
    this.type = {
      CLIENT: 0,
      USER: 1,
      STEAM: 2
    };
  }

  Settings.prototype.init = function() {
    for (key in values) {
      if (Cookies.get(key) && !isNaN(parseInt(Cookies.get(key)))) {
        var value = parseInt(Cookies.get(key));
        values[key] = value;
      }
    }
    this.loadLocalData();
  };

  Settings.prototype.loadLocalData = function() {
    $volume_slider.val(values["volume_value"]);
    $scroll_checkbox.prop('checked', (values["autoscroll_value"] == 1 ? true : false));
    $ping_checkbox.prop('checked', (values["message_ping_value"] == 1 ? true : false));
  };

  Settings.prototype.updateClientSettings = function() {
    values["volume_value"] = $volume_slider.val();
    values["autoscroll_value"] = $scroll_checkbox.prop('checked') ? 1 : 0;
    values["message_ping_value"] = $ping_checkbox.prop('checked') ? 1 : 0;
  };

  Settings.prototype.save = function(type) {
    if (type == this.type.CLIENT) {
      this.updateClientSettings();
      for (key in values) {
        Cookies.set(key, values[key]);
      }
      swal("Settings Saved", "Your settings for your client-side preferences have been saved successfully to your browser.", "success");
      setTimeout(function() {
        window.location.reload();
      }, 2000);
    } else if (type == this.type.STEAM) {
      if (canRequestSteam) {
        swal({
          title: "Steam Settings",
          text: "Are you sure you want to update your steam settings?",
          type: "info",
          showCancelButton: true,
          closeOnConfirm: false,
          showLoaderOnConfirm: true,
        }, function() {
          canRequestSteam = false;
          console.log(socket_outgoing.UPDATE_STEAM_SETTINGS);
          socket.emit(socket_outgoing.UPDATE_STEAM_SETTINGS);
          requestSteamTimeout = setTimeout(function() {
            swal('Steam Settings', 'Error while updating your steam settings.', 'error');
          }, 10000);
        });
        setTimeout(function() {
          canRequestSteam = true;
        }, 20000);
      } else {
        swal('Overflow', 'You are sending requests too quickly.', 'error');
      }
    }
  };

  Settings.prototype.scrollToBottom = function() {
    return values["autoscroll_value"] == 1;
  };

  Settings.prototype.messagePing = function() {
    return values["message_ping_value"] == 1;
  };

  Settings.prototype.volumeValue = function() {
    return values["volume_value"];
  };

  Settings.prototype.promptTradeURLEnter = (placeholder = 'https://steamcommunity.com/tradeoffer/new/?partner=example4324232') => {
    var text = 'Click <a href="https://steamcommunity.com/id/me/tradeoffers/privacy">here</a> to find your trade URL.';
    swal({
      text: text,
      title: 'Enter Trade URL',
      type: 'input',
      showCancelButton: true,
      closeOnConfirm: false,
      animation: 'slide-from-top',
      inputPlaceholder: placeholder
    }, (input) => {
      if (input === false) return false;

      if (input === '') {
        swal.showInputError('You need to enter a URL!');
        return false;
      }

      if (!isValidURL(input)) {
        swal.showInputError('You have inputted an incorrect URL.');
        return false;
      }

      swal('doe', 'you wrote' + input, 'success');
    });
  }

  socket.on(socket_incoming.UPDATE_STEAM_SETTINGS, function(data) { //data.photo, data.name
    $steam_profile_img.attr('src', data.photo);
    $steam_profile_name.text(data.name);

    clearTimeout(requestSteamTimeout);
    swal('Steam Settings', 'Updated steam settings successfully.', 'success');
  });

  $steamTradeURL.on('click', function(event) {
    var self = this;
    var id = $(this).attr('id');
    if (id === 'steam-url-set') {
      settings.promptTradeURLEnter();
    } else if (id === 'steam-url-edit') {
      settings.promptTradeURLEnter(self.attr('data-url'));
    }
  });

  $client_settings_save.on('click', function(event) {
    event.preventDefault();
    settings.save(settings.type.CLIENT);
  });

  $steam_settings_refresh.on('click', function(event) {
    event.preventDefault();
    settings.save(settings.type.STEAM);
  });

  function isValidURL(input) {
    return false;
  }

  settings.init();
  window.settings = settings;

});
