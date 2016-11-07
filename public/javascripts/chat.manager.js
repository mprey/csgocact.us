$(function() {

  var $chat_textarea = $('#chat-textarea');
  var $chat_online = $('#chat-online');
  var $chat_submit = $('#chat-submit');
  var $chat_emote = $('#emote-wrapper a');
  var $notification_counter = $('.notification-counter');
  var $chat_wrapper = $('#chat-wrapper');

  var emotes = ['4Head', 'ANELE', 'BabyRage', 'BibleThump', 'BrokeBack', 'cmonBruh', 'CoolCat', 'CorgiDerp', 'EleGiggle', 'FailFish', 'FeelsBadMan', 'FeelsGoodMan', 'Kappa', 'KappaPride', 'Kreygasm', 'MrDestructoid', 'OSfrog', 'PogChamp', 'SMOrc', 'SwiftRage', 'WutFace'];

  var messagePing = new Audio('audio/message_ping.wav');

  var ranks = {
    NORMAL: 0,
    MOD: 1,
    ADMIN: 2,
    DEVELOPER: 3,
    BOT: 4
  };

  var socket_incoming = {
    UPDATE_ONLINE: 'CHAT_IN_UPDATE_ONLINE',
    INCREMENT_ONLINE: 'CHAT_IN_INCREMENET_ONLINE',
    DECREMENT_ONLINE: 'CHAT_IN_DECREMENT_ONLINE',
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
    INIT_CHAT: 'CHAT_OUT_INIT_CHAT'
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
    PROMOTE: '/promote id:[id] p:[moderator:admin]',
    DEMOTE: '/demote id:[id]',
    DURATION_EX: 'Duration example: "d:3mt,5d,4h,5m,6s"',
    REASON_EX: 'Reason example: "r:Banned for spamming"'
  };

  function ChatManager() {
    this.socket = socket;

    var instance = this;

    this.socket.on(socket_incoming.INIT_CHAT, this.initChat);
    this.socket.on(socket_incoming.INCREMENT_ONLINE, this.incrementOnline);
    this.socket.on(socket_incoming.DECREMENT_ONLINE, this.decrementOnline);

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
    chat_manager.updateOnline(data.current_users);
    data.previous_messages.forEach(function(obj) {
      obj.no_sound = true;
      chat_manager.addChatMessage(obj);
    });
  }

  ChatManager.prototype.replaceWithEmotes = function(text) {
    var newText = text;
    for (var index in emotes) {
      if (newText.indexOf(emotes[index]) >= 0) {
        newText = newText.split(emotes[index]).join('<img class="chat-emote" src="images/emotes/' + emotes[index] + '.png">');
      }
    }
    return newText;
  };

  ChatManager.prototype.handleUserBan = function(data) { //data.profile_name, data.expire_date, data.reason
    this.addBotMessage({
      text: '<br>User \'<strong>' + data.profile_name + '</strong>\' has been banned until ' + data.expire_date + '<br><br><strong>Reason: </strong>' + data.reason + '<br>'
    });
  };

  ChatManager.prototype.handleUserMute = function(data) { //data.profile_name, data.expire_date, data.reason
    this.addBotMessage({
      text: '<br>User \'<strong>' + data.profile_name + '</strong>\' has been muted until ' + data.expire_date + '<br><br><strong>Reason: </strong>' + data.reason + '<br>'
    });
  };

  ChatManager.prototype.handleUserUnmute = function(data) { //data.profile_name
    this.addBotMessage({
      text: '<br>User \'<strong>' + data.profile_name + '</strong>\' has been unmuted. Kappa<br>'
    });
  };

  ChatManager.prototype.handleUserUnban = function(data) { //data.profile_name
    this.addBotMessage({
      text: '<br>User \'<strong>' + data.profile_name + '</strong>\' has been unbanned. BibleThump<br>'
    });
  };

  ChatManager.prototype.setChatMode = function(data) { //data.mode ('normal' or 'staff')
    this.addBotMessage({
      text: '<br>Chat mode has been changed to: <strong>' + (data.mode == 'normal' ? 'Normal' : 'Staff Only') + '</strong><br>'
    });
  };

  ChatManager.prototype.incrementOnline = function() {
    var current = parseInt($chat_online.text());
    current++;
    $chat_online.text(current);
  };

  ChatManager.prototype.updateOnline = function(amount) {
    $chat_online.text(amount);
  };

  ChatManager.prototype.decrementOnline = function() {
    var current = parseInt($chat_online.text());
    current--;
    $chat_online.text(current);
  };

  ChatManager.prototype.queryMessage = function(text) { //before sent to socket
    if (!text || text.length == 0) return;

    $chat_textarea.val('');

    if (text.substring(0, 1) == '/') {
      this.handleCommand(text);
      return;
    }

    this.socket.emit(socket_outgoing.SEND_CHAT, {
      text: text
    });
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
    this.addChatMessage(data);
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

    var contentText = chat_manager.replaceWithEmotes(data.text);

    var rankText = '';

    if (data.rank > 0) {
      var rank = chat_manager.getRank(data.rank).toLowerCase();
      rankText = '<span class="rank ' + rank + '">' + rank + '</span>';
    }

    var divText = '<div class="chat-message clearfix" chat-id="' + data.id + '"><img class="chat-profile" src="' + data.profile_img + '"><div class="chat-message-content clearfix"><span class="chat-time">' + timeText + '</span><h5>' + rankText + ' ' + data.profile_name + '</h5><p>' + contentText + '</p></div></div>'
    var hrBreak = '<hr class="chat-break">';

    $chat_wrapper.append(divText + hrBreak);

    chat_manager.scrollToBottom();
    if (!data.no_sound) {chat_manager.playPing();}
  };

  ChatManager.prototype.addNotification = function() {
    var val = isNaN(parseInt($notification_counter.text())) ? 0 : parseInt($notification_counter.text());
    val++;

    $notification_counter.css({opacity: 0}).text(val).css({top: '-10px'}).transition({top: '-2px', opacity: 1});
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
    this.addBotMessage({
      text: 'Window is now reloading...'
    });
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
        if (command.id && command.r) {
          if (command.d) {
            data.expire = futureDateFromText(command.d[0]);
          }
          data.banned_id = command.idea;
          data.reason = command.r;
          this.socket.emit(socket_outgoing.BAN_USER, data);
          return;
        }
      }
      this.sendHelpMessage('ban');
    } else if (args[0].toLowerCase() == 'mute') { //data.muter_id, data.muted_id, data.reason, data.duration
      if (args.length > 3) {
        //TODO
      }
      this.sendHelpMessage('mute');
    } else if (args[0].toLowerCase() == 'unban') { //data.unbanned_id, data.unbanner_id
      if (args.length == 2) {
        //TODO
      }
      this.sendHelpMessage('unban');
    } else if (args[0].toLowerCase() == 'unmute') { //data.unmuted_id, data.unmuter_id
      if (args.length == 2) {
        //TODO
      }
      this.sendHelpMessage('unmute');
    } else if (args[0].toLowerCase() == 'reload') {
      this.socket.emit(socket_outgoing.RELOAD_PAGE, {});
    } else if (args[0].toLowerCase() == 'clear') {
      this.socket.emit(socket_outgoing.CLEAR_CHAT, {});
    } else if (args[0].toLowerCase() == 'bot') {
      if (args.length > 2 && args[1].toLowerCase() == 'send') {
        //TODO parse args from index 2->indefinite into bot message string
      }
      this.sendHelpMessage('bot');
    } else if (args[0].toLowerCase() == 'mode') {
      if (args.length == 2) {
        //TODO
      }
      this.sendHelpMessage('mode');
    } else if (args[0].toLowerCase() == 'promote') {
      if (args.lenth == 3) {
        //TODO
      }
      this.sendHelpMessage('promote');
    } else if (args[0].toLowerCase() == 'demote') {
      if (args.length == 2) {
        //TODO
      }
      this.sendHelpMessage('demote');
    } else {
      this.sendHelpMessage();
    }
  };

  var chat_manager = new ChatManager();

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
    if (event.which == 13 && isChatOpen) {
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
