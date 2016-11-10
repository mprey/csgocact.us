$(function() {

  $.pjax.defaults.scrollTo = false;
  $.pjax.defaults.timeout = 5000;

  $('.pjax-trigger').on('click', function(event) {
    event.preventDefault();
    $.pjax({
      url: this.href,
      container: '.page-content'
    });
  });
  $(document).on('pjax:complete', function(event, xhr, textStatus, options) {
    updateNavBar();
  });
});
