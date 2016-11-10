module.exports = function() {
  return function(req, res, next) {
    if (req.header('X-PJAX')) {
      req.pjax = true;
      res.locals.pjax = true;
    }
    next();
  }
}
