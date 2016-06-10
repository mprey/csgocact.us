var SteamStrategy = require('passport-steam').Strategy;
var User = require('./../models/user').User;

module.exports = function(passport) {
  /**
   *  Set up Steam Strategy used by Passport
   *    - attaches Steam username and photos to object
   */
  passport.use(new SteamStrategy({
      returnURL: process.env.AUTH_RETURN,
      realm: process.env.AUTH_REALM,
      apiKey: process.env.AUTH_API_KEY
    },
    function(identifier, profile, done) {
      process.nextTick(function () {
        var id = identifier.match(/\d+$/)[0];
        User.findOneAndUpdate({ _id: id }, { name: profile.displayName, photos: profile.photos }, { new: true }, function (err, user) {
          if (user) {
            return done(err, user);
          } else if (!err) {
            var newUser = new User({
              _id: id,
              name: profile.displayName,
              photos: JSON.stringify(profile.photos)
            });
            newUser.save(function (err1) {
              return done(err1, newUser);
            });
          }
          return (err, user);
        });
      });
    }
  ));

  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function(obj, done) {
    User.findById(obj, function(err, user) {
      done(err, user);
    });
  });
}
