$(function() {

  var $client_settings_save = $('#client-settings-save');
  var $volume_slider = $('#volume-slider');
  var $scroll_checkbox = $('#scroll-checkbox');
  var $ping_checkbox = $('#ping-checkbox');
  var $steam_settings_refresh = $('#steam-settings-refresh');

  var settings = new Settings();

  var values = {
    "volume_value": 50,
    "autoscroll_value": 1,
    "message_ping_value": 1
  };

  function Settings() {
    this.type = {
      CLIENT: 0,
      USER: 1
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
  }

  $client_settings_save.on('click', function(event) {
    event.preventDefault();
    settings.save(settings.type.CLIENT);
  });

  settings.init();
  window.settings = settings;

});
