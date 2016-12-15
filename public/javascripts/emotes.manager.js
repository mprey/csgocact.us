$(function() {

  var $emotes_wrapper = $('#emotes-wrapper');

  var emotesArray = ['4Head', 'ANELE', 'BabyRage', 'BibleThump', 'BrokeBack', 'cmonBruh', 'CoolCat', 'CorgiDerp', 'EleGiggle', 'FailFish', 'FeelsBadMan', 'FeelsGoodMan', 'Kappa', 'Kreygasm', 'MrDestructoid', 'OSfrog', 'PogChamp', 'SMOrc', 'SwiftRage', 'WutFace'];

  var EMOTE_DIR = 'images/emotes/';

  function init() {
    for (var index in emotesArray) {
      createEmote(emotesArray[index]);
    }
  }

  function createEmote(emote) {
    var HTML = '<div id="emote-wrapper">' +
                  '<a href="#0" class="tooltip"><img src="' + (EMOTE_DIR + emote) + '.png"><span>' + emote + '</span></img></a>' +
               '</div>';
    $emotes_wrapper.append(HTML);
  }

  $emotes_wrapper.on('click', '#emote-wrapper', function(event) {
    event.preventDefault();
    chat_manager.appendText($(this).find('span').text());
  });

  init();

});
