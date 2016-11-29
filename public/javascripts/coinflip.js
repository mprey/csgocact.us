$(function() {

  $('.page-content').on('click', '#cf-dropdown-trigger', function(event) {
    var header = $(this).parent().parent();
    $(this).hide();
    if ($(this).hasClass('opened')) {
      $(this).next().show();
    } else {
      $(this).prev().show();
    }
    header.addClass('border-bottom');
    $(this).parent().parent().parent().find('.table-wrapper').slideToggle(function() {
      if (!($(this).is(':visible'))) {
        header.removeClass('border-bottom');
      }
    });
  });

});
