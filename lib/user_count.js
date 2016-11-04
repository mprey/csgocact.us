var numUsers = 0;

module.exports = {
  incrementCount: function() {
    numUsers++;
  },
  decrementCount: function() {
    numUsers--;
    if (numUsers < 0)
      numUsers = 0;
  },
  getCount: function() {
    return numUsers;
  }
}
