var express = require('express');
var router = express.Router;

router.get('/:id', function(req, res) {
  console.log('profile request with id: ' + req.params.id);
});

module.exports = router;
