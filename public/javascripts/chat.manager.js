$(function() {

  var $chat_textarea = $('#chat-textarea');
  var $chat_online = $('#chat-online');
  var $chat_submit = $('#chat-submit');
  var $emote_wrapper = $('#emote-wrapper');
  var $notification_counter = $('.notification-counter');
  var $chat_wrapper = $('#chat-wrapper');

  var emotes = ['4Head', 'ANELE', 'BabyRage', 'BibleThump', 'BrokeBack', 'cmonBruh', 'CoolCat', 'CorgiDerp', 'EleGiggle', 'FailFish', 'FeelsBadMan', 'FeelsGoodMan', 'Kappa', 'Kreygasm', 'MrDestructoid', 'OSfrog', 'PogChamp', 'SMOrc', 'SwiftRage', 'WutFace'];

  var messagePing = new Audio('audio/message_ping.wav');

  var onCooldown = false;

  var ranks = {
    NORMAL: 0,
    MOD: 1,
    ADMIN: 2,
    DEVELOPER: 3,
    BOT: 4
  };

  var socket_incoming = {
    UPDATE_ONLINE: 'UPDATE_ONLINE',
    MUTE_USER: 'CHAT_IN_MUTE_USER',
    UNMUTE_USER: 'CHAT_IN_UNMUTE_USER',
    BAN_USER: 'CHAT_IN_BAN_USER',
    UNBAN_USER: 'CHAT_IN_UNBAN_USER',
    RECEIVE_MESSAGE: 'CHAT_IN_RECEIVE_MESSAGE',
    RELOAD_PAGE: 'CHAT_IN_RELOAD_PAGE',
    CLEAR_CHAT: 'CHAT_IN_CLEAR_CHAT',
    BOT_MESSAGE: 'CHAT_IN_BOT_MESSAGE',
    CHAT_MODE: 'CHAT_IN_CHAT_MODE',
    INIT_CHAT: 'CHAT_IN_INIT_CHAT'
  };

  var socket_outgoing = {
    SEND_CHAT: 'CHAT_OUT_SEND_MESSAGE',
    MUTE_USER: 'CHAT_OUT_MUTE_USER',
    UNMUTE_USER: 'CHAT_OUT_UNMUTE_USER',
    BAN_USER: 'CHAT_OUT_BAN_USER',
    UNBAN_USER: 'CHAT_OUT_UNBAN_USER',
    RELOAD_PAGE: 'CHAT_OUT_RELOAD_PAGE',
    CLEAR_CHAT: 'CHAT_OUT_CLEAR_CHAT',
    BOT_MESSAGE: 'CHAT_OUT_BOT_MESSAGE',
    CHAT_MODE: 'CHAT_OUT_CHAT_MODE',
    INIT_CHAT: 'CHAT_OUT_INIT_CHAT',
    PROMOTE_USER: 'CHAT_OUT_PROMOTE_USER',
    DEMOTE_USER: 'CHAT_OUT_DEMOTE_USER',
    PROMO_CODE_CREATE: 'CHAT_OUT_PROMO_CREATE',
    PROMO_CODE_DELETE: 'CHAT_OUT_PROMO_DELETE'
  };

  var commands = {
    HELP: '/help',
    BAN: '/ban id:[id] r:[reason] d:(duration)',
    MUTE: '/mute id:[id] r:[reason] d:(duration)',
    UNBAN: '/unban id:[id]',
    UNMUTE: '/unmute id:[id]',
    RELOAD: '/reload',
    CLEAR: '/clear',
    BOT: '/bot send m:[message]',
    MODE: '/mode m:[normal:staff]',
    PROMOTE: '/promote id:[id] p:[mod:admin]',
    DEMOTE: '/demote id:[id]',
    PROMO_CODE: '/promo [create|delete] c:[code] a:[amount] d:(duration)',
    DURATION_EX: 'Duration example: "d:3mt,5d,4h,5m,6s"',
    REASON_EX: 'Reason example: "r:Banned for spamming"'
  };

  function ChatManager() {
    this.socket = socket;

    this.socket.on(socket_incoming.INIT_CHAT, this.initChat);
    this.socket.on(socket_incoming.UPDATE_ONLINE, this.updateOnline);

    this.socket.on(socket_incoming.BOT_MESSAGE, this.addBotMessage);
    this.socket.on(socket_incoming.RECEIVE_MESSAGE, this.addChatMessage);
    this.socket.on(socket_incoming.CLEAR_CHAT, this.clearMessages);
    this.socket.on(socket_incoming.RELOAD_PAGE, this.reloadPage);
    this.socket.on(socket_incoming.CHAT_MODE, this.setChatMode);

    this.socket.on(socket_incoming.BAN_USER, this.handleUserBan);
    this.socket.on(socket_incoming.UNBAN_USER, this.handleUserUnban);
    this.socket.on(socket_incoming.MUTE_USER, this.handleUserMute);
    this.socket.on(socket_incoming.UNMUTE_USER, this.handleUserUnmute);

    this.socket.emit(socket_outgoing.INIT_CHAT);
  }

  ChatManager.prototype.initChat = function(data) { //data.current_users, data.previous_messages
    chat_manager.updateOnline({
      users: data.current_users
    });
    data.previous_messages.forEach(function(obj) {
      obj.no_sound = true;
      chat_manager.addChatMessage(obj);
    });
  };

  ChatManager.prototype.replaceWithEmotes = function(text) {
    var newText = text;
    for (var index in emotes) {
      if (newText.indexOf(emotes[index]) >= 0) {
        newText = newText.split(emotes[index]).join('<img class="chat-emote" src="images/emotes/' + emotes[index] + '.png">');
      }
    }
    return newText;
  };

  ChatManager.prototype.handleUserBan = function(data) { //data.profile_name, data.expire, data.reason
    chat_manager.addBotMessage({
      text: '<br>User \'<strong>' + data.profile_name + '</strong>\' has been banned ' + (data.expire ? 'for ' + formatDate(data.expire) : 'permanently') + '<br><br><strong>Reason: </strong>' + data.reason + '<br>'
    });
  };

  ChatManager.prototype.handleUserMute = function(data) { //data.profile_name, data.expire, data.reason
    chat_manager.addBotMessage({
      text: '<br>User \'<strong>' + data.profile_name + '</strong>\' has been muted ' + (data.expire ? 'for ' + formatDate(data.expire) : 'permanently') + '<br><br><strong>Reason: </strong>' + data.reason + '<br>'
    });
  };

  ChatManager.prototype.handleUserUnmute = function(data) { //data.profile_name
    chat_manager.addBotMessage({
      text: '<br>User \'<strong>' + data.profile_name + '</strong>\' has been unmuted. Kappa<br>'
    });
  };

  ChatManager.prototype.handleUserUnban = function(data) { //data.profile_name
    chat_manager.addBotMessage({
      text: '<br>User \'<strong>' + data.profile_name + '</strong>\' has been unbanned. BibleThump<br>'
    });
  };

  ChatManager.prototype.setChatMode = function(data) { //data.mode ('normal' or 'staff')
    chat_manager.addBotMessage({
      text: '<br>Chat mode has been changed to: <strong>' + (data.mode == 'normal' ? 'Normal' : 'Staff Only') + '</strong><br>'
    });
  };

  ChatManager.prototype.incrementOnline = function() {
    var current = parseInt($chat_online.text());
    current++;
    $chat_online.text(current);
  };

  ChatManager.prototype.updateOnline = function(data) {
    $chat_online.text(data.users);
  };

  ChatManager.prototype.decrementOnline = function() {
    var current = parseInt($chat_online.text());
    current--;
    $chat_online.text(current);
  };

  ChatManager.prototype.queryMessage = function(text) { //before sent to socket
    if (!text || text.length == 0) return;

    if (onCooldown) {
      swal('Chat Overflow', 'You are sending messages too quickly.', 'error');
      return;
    }

    $chat_textarea.val('');

    if (text.substring(0, 1) == '/') {
      this.handleCommand(text);
      return;
    }

    this.socket.emit(socket_outgoing.SEND_CHAT, {
      text: text
    });

    onCooldown = true;
    setTimeout(function() {
      onCooldown = false;
    }, 500);
  };

  ChatManager.prototype.sendHelpMessage = function(command) {
    var text = '';
    if (command) {
      text += 'Command usage:';
      text += '<br>' + commands[command.toUpperCase()];
    } else {
      text += 'Available commands:';
      for (var command in commands) {
        text += "<br>- " + commands[command];
      }
    }
    this.addBotMessage({
      text: text
    });
  };

  ChatManager.prototype.addBotMessage = function(data) {
    var data = {
      id: 'CHAT_BOT',
      profile_img: 'images/large-logo-bg.png',
      profile_name: 'Chat Bot',
      text: data.text,
      rank: ranks.BOT
    };
    chat_manager.addChatMessage(data);
  };

  ChatManager.prototype.clearMessages = function() {
    $chat_wrapper.empty();
  };

  ChatManager.prototype.removeMessages = function(id) {
    $('.chat-message[chat-id="' + id + '"]').each(function() {
      $(this).remove();
    });
  };

  ChatManager.prototype.scrollToBottom = function() {
    if (settings.scrollToBottom()) {
      $chat_wrapper.stop().animate({
        scrollTop: $chat_wrapper[0].scrollHeight
      }, 800);
    }
  };

  ChatManager.prototype.playPing = function() {
    if (settings.messagePing()) {
      var sound = new Howl({
        src: 'audio/message_ping.wav',
        volume: (settings.volumeValue() * .01),
        autoplay: true,
        loop: false
      });
    }
  };

  ChatManager.prototype.addChatMessage = function(data) { //data.id, data.profile_img, data.profile_name, data.text, data.rank, data.date, data.no_sound
    var date = data.date ? (new Date(Date.parse(data.date))) : new Date();

    var timeText = formatAMPM(date);

    var escapedHtml = data.id == 'CHAT_BOT' ? data.text : escapeHTML(data.text);

    var contentText = chat_manager.replaceWithEmotes(escapedHtml);

    var rankText = '';

    if (data.rank > 0) {
      var rank = chat_manager.getRank(data.rank).toLowerCase();
      rankText = '<span class="rank ' + rank + '">' + rank + '</span>';
    }

    var divText = '<div class="chat-message clearfix" chat-id="' + data.id + '"><img class="chat-profile" src="' + data.profile_img + '"><div class="chat-message-content clearfix"><span class="chat-time">' + timeText + '</span><h5>' + rankText + ' <span id="profile-name">' + data.profile_name + '</span></h5><p>' + contentText + '</p></div></div>'
    var hrBreak = '<hr class="chat-break">';

    $chat_wrapper.append(divText + hrBreak);

    chat_manager.scrollToBottom();
    if (!data.no_sound) {
      chat_manager.playPing();
      chat_manager.addNotification();
    }
  };

  ChatManager.prototype.addNotification = function() {
    if (!isChatOpen) {
      var val = isNaN(parseInt($notification_counter.text())) ? 0 : parseInt($notification_counter.text());
      val++;
      $notification_counter.css({opacity: 0}).text(val).css({top: '-10px'}).transition({top: '-2px', opacity: 1});
    }
  };

  ChatManager.prototype.clearNotifications = function() {
    $notification_counter.text(null);
  };

  ChatManager.prototype.appendText = function(text) {
    var newText = $chat_textarea.val() + text;
    $chat_textarea.val(newText);
  };

  ChatManager.prototype.getRank = function(value) {
    for (var key in ranks) {
      if (ranks[key] == value) {
        return key;
      }
    }
  };

  ChatManager.prototype.reloadPage = function() {
    swal('Window is now reloading...');
    setTimeout(function() {
      location.reload();
    }, 2000);
  };

  ChatManager.prototype.handleCommand = function(text) { //before sent to socket
    var commandQuery = text.substring(1);

    var args = commandQuery.split(" ");

    if (args[0].toLowerCase() == 'help') {
      this.sendHelpMessage();
    } else if (args[0].toLowerCase() == 'ban') { //ban id:5345342324 r:you are gay as fuck d:5d6h1m
      if (args.length > 2) {
        var command = getCommandProperties(args);
        var data = {};
        if (command.id[0] && command.r) {
          if (command.d) {
            data.expire = futureDateFromText(command.d[0]);
          }
          data.banned_id = command.id[0];
          data.reason = command.r.join(' ');
          this.socket.emit(socket_outgoing.BAN_USER, data);
          return;
        }
      }
      this.sendHelpMessage('ban');
    } else if (args[0].toLowerCase() == 'mute') { //data.muter_id, data.muted_id, data.reason, data.duration
      if (args.length > 2) {
        var command = getCommandProperties(args);
        var data = {};
        if (command.id[0] && command.r) {
          if (command.d) {
            data.expire = futureDateFromText(command.d[0]);
          }
          data.muted_id = command.id[0];
          data.reason = command.r.join(' ');
          this.socket.emit(socket_outgoing.MUTE_USER, data);
          return;
        }
      }
      this.sendHelpMessage('mute');
    } else if (args[0].toLowerCase() == 'unban') { //data.unbanned_id, data.unbanner_id
      if (args.length == 2) {
        var command = getCommandProperties(args);
        var data = {};
        if (command.id[0]) {
          data.unbanned_id = command.id[0]
          this.socket.emit(socket_outgoing.UNBAN_USER, data);
          return;
        }
      }
      this.sendHelpMessage('unban');
    } else if (args[0].toLowerCase() == 'unmute') { //data.unmuted_id, data.unmuter_id
      if (args.length == 2) {
        var command = getCommandProperties(args);
        var data = {};
        if (command.id[0]) {
          data.unmuted_id = command.id[0]
          this.socket.emit(socket_outgoing.UNMUTE_USER, data);
          return;
        }
      }
      this.sendHelpMessage('unmute');
    } else if (args[0].toLowerCase() == 'reload') {
      this.socket.emit(socket_outgoing.RELOAD_PAGE, {});
    } else if (args[0].toLowerCase() == 'clear') {
      this.socket.emit(socket_outgoing.CLEAR_CHAT, {});
    } else if (args[0].toLowerCase() == 'bot') {
      if (args.length > 2 && args[1].toLowerCase() == 'send') {
        var command = getCommandProperties(args);
        if (command.m) {
          this.socket.emit(socket_outgoing.BOT_MESSAGE, {
            text: command.m.join(' ')
          });
          return;
        }
      }
      this.sendHelpMessage('bot');
    } else if (args[0].toLowerCase() == 'mode') {
      if (args.length == 2) {
        if (args[1].toLowerCase() == 'm:staff' || args[1].toLowerCase() == 'm:normal') {
          var command = getCommandProperties(args);
          if (command.m) {
            this.socket.emit(socket_outgoing.CHAT_MODE, {
              mode: command.m[0]
            });
            return;
          }
        }
      }
      this.sendHelpMessage('mode');
    } else if (args[0].toLowerCase() == 'promote') {
      if (args.length == 3 && (args[2].toLowerCase().indexOf('mod') != 0 || args[2].toLowerCase().indexOf('admin'))) {
        var command = getCommandProperties(args);
        if (command.id[0] && command.p) {
          this.socket.emit(socket_outgoing.PROMOTE_USER, {
            promote_id: command.id[0],
            rank: command.p[0]
          });
          return;
        }
      }
      this.sendHelpMessage('promote');
    } else if (args[0].toLowerCase() == 'demote') {
      if (args.length == 2) {
        var command = getCommandProperties(args);
        if (command.id && command.id[0]) {
          this.socket.emit(socket_outgoing.DEMOTE_USER, {
            demote_id: command.id[0]
          });
          return;
        }
      }
      this.sendHelpMessage('demote');
    } else if (args[0].toLowerCase() == 'promo') { //promo create|delete c:code a:amount d:dur
      if (args.length >= 3) {
        var option = args[1];
        if (option.toLowerCase() == 'create') { //data.code, data.amount, data.expire
          var command = getCommandProperties(args);
          var data = {};
          if (command.c && command.a) {
            if (command.d) {
              data.expire = futureDateFromText(command.d[0]);
            }
            data.amount = command.a[0];
            data.code = command.c.join(' ');
            this.socket.emit(socket_outgoing.PROMO_CODE_CREATE, data);
            return;
          }
        } else if (option.toLowerCase() == 'delete') { //data.code
          var command = getCommandProperties(args);
          if (command.c) {
            this.socket.emit(socket_outgoing.PROMO_CODE_DELETE, {
              code: command.c.join(' ')
            });
            return;
          }
        }
      }
      this.sendHelpMessage('promo_code');
    } else {
      this.sendHelpMessage();
    }
  };

  var chat_manager = new ChatManager();

  $('#chat-wrapper').on('click', '.chat-profile', function(event) {
    var steam64Id = $(this).parent().attr('chat-id');
    var name = $(this).parent().find('#profile-name').text();
    swal({
      title: name + "'s Steam64ID",
      text: "Use Ctrl+C or Cmd+C to copy",
      type: "input",
      inputValue: steam64Id,
      closeOnConfirm: true,
      animation: "slide-from-top"
    });
  });

  $chat_submit.on('click', function(event) {
    event.preventDefault();
    chat_manager.queryMessage($chat_textarea.val());
  });

  $chat_textarea.keypress(function(event) {
    if (event.which == 13) {
      event.preventDefault();
      chat_manager.queryMessage($chat_textarea.val());
    }
  });

  $(document).keypress(function(event) {
    if (event.which == 13 && isChatOpen && !$.modal.isActive()) {
      event.preventDefault();
      chat_manager.queryMessage($chat_textarea.val());
    }
  });

  function futureDateFromText(text) {
    var parts = text.split(',');
    var months = 0,
        days = 0,
        hours = 0,
        minutes = 0,
        seconds = 0;
    for (var index in parts) {
      var partArray = parts[index].match(/(\d+|[^\d]+)/g);
      if (partArray.length == 2) {
        switch(partArray[1]) {
          case 'mt':
            months += parseInt(partArray[0]);
            break;
          case 'd':
            days += parseInt(partArray[0]);
            break;
          case 'h':
            hours += parseInt(partArray[0]);
            break;
          case 'm':
            minutes += parseInt(partArray[0]);
            break;
          case 's':
            seconds += parseInt(partArray[0]);
            break;
          default:
        }
      }
    }
    var date = new Date();
    date.setMonth(date.getMonth() + months);
    date.setDate(date.getDate() + days);
    date.setHours(date.getHours() + hours);
    date.setMinutes(date.getMinutes() + minutes);
    date.setSeconds(date.getSeconds() + seconds);
    return date;
  }

  function getCommandProperties(array) {
    var command = {};
    var reading = false,
        readArray = [],
        identifier = '';
    for (var i = 1; i < array.length; i++) {
      var current = array[i];
      if (current.indexOf(":") != -1 && !reading) { //start reading
        logData(current);
      } else if (reading && current.indexOf(":") == -1) { //continue reading
        readArray.push(current);
      } else if (reading && current.indexOf(":") != -1){ //onto next object
        reading = false;
        identifier = '';
        readArray = [];
        logData(current);
      }
    }
    function logData(current) {
      reading = true;
      var parts = current.split(":");
      identifier = parts[0];
      readArray.push(parts[1]);
      command[identifier] = readArray;
    }
    return command;
  }

  function formatTime(days, hours, minutes, seconds) {
    var array = [];
    if (days != 0) {array.push(days + ' day' + (days == 1 ? '' : 's'));}
    if (hours != 0) {array.push(hours + ' hour' + (hours == 1 ? '' : 's'));}
    if (minutes != 0) {array.push(minutes + ' minute' + (minutes == 1 ? '' : 's'));}
    if (seconds != 0) {array.push(seconds + ' second' + (seconds == 1 ? '' : 's'));}
    return array.join(', ');
  }

  function formatDate(input) {
    if (input) {
      var date_future = new Date(Date.parse(input));
      var date_now = new Date();
      // get total seconds between the times
      var delta = Math.abs(date_future - date_now) / 1000;

      // calculate (and subtract) whole days
      var days = Math.floor(delta / 86400);
      delta -= days * 86400;

      // calculate (and subtract) whole hours
      var hours = Math.floor(delta / 3600) % 24;
      delta -= hours * 3600;

      // calculate (and subtract) whole minutes
      var minutes = Math.floor(delta / 60) % 60;
      delta -= minutes * 60;

      // what's left is seconds
      var seconds = Math.floor(delta % 60);  // in theory the modulus is not required
      return formatTime(days, hours, minutes, seconds);
    } else {
      return 'Never';
    }
  }

  function escapeHTML(unsafe) {
    return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes() || 00;
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

  window.chat_manager = chat_manager;
});
