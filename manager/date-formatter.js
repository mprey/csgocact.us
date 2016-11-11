module.exports = {
  formatTime: function(days, hours, minutes, seconds) {
    var array = [];
    if (days != 0) {array.push(days + ' day' + (days == 1 ? '' : 's'));}
    if (hours != 0) {array.push(hours + ' hour' + (hours == 1 ? '' : 's'));}
    if (minutes != 0) {array.push(minutes + ' minute' + (minutes == 1 ? '' : 's'));}
    if (seconds != 0) {array.push(seconds + ' second' + (seconds == 1 ? '' : 's'));}
    return array.join(', ');
  },
  formatDate: function(input) {
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
}
