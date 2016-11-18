$(function() {

  $.pjax.defaults.scrollTo = false;
  $.pjax.defaults.timeout = 5000;

  $('.pjax-trigger').on('click', function(event) {
    event.preventDefault();
    $.pjax({
      url: this.href,
      container: 'main'
    });
  });

  $(document).on('pjax:complete', function(event, xhr, textStatus, options) {
    updateNavBar();
    setTimeout(function() {
      $('main').css('display', 'block');
      $('#spinner-container').css('display', 'none');
    }, 500);
  });

  $(document).on('pjax:start', function(event, xhr, textStatus, options) {
    $('main').css('display', 'none');
    $('main').css('padding-top', '0'); //this is buggy?
    $('#spinner-container').css('display', 'block');
  });

});
