$(function() {

  var $emotes_wrapper = $('#emotes-wrapper');

  var emotesArray = ['4Head', 'ANELE', 'BabyRage', 'BibleThump', 'BrokeBack', 'cmonBruh', 'CoolCat', 'CorgiDerp', 'EleGiggle', 'FailFish', 'FeelsBadMan', 'FeelsGoodMan', 'Kappa', 'KappaPride', 'Kreygasm', 'MrDestructoid', 'OSfrog', 'PogChamp', 'SMOrc', 'SwiftRage', 'WutFace'];

  const EMOTE_DIR = '../img/emotes/';

  function init() {
    for (var index in emotesArray) {
      createEmote(emotesArray[index]);
    }
  }

  function createEmote(emote) {
    var HTML = '<div id="emote-wrapper">' +
                  '<a href="#" onclick="handleEmoteClick($(this));" class="tooltip"><img src="' + (EMOTE_DIR + emote) + '.png"><span>' + emote + '</span></img></a>' +
               '</div>';
    $emotes_wrapper.append(HTML);
  }

  function handleEmoteClick(emote) {
    chat_manager.appendText(emote.children('span').text());
  }

  init();

  window.handleEmoteClick = handleEmoteClick;

});
