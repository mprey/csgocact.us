function getProfile(id,cb) {
  $.getJSON("/api/steam_data/" + id, function(body) {
    var data = JSON.parse(JSON.stringify(body));
    var returned = data.response.players[0];
    if (returned) {
      var profile = {
        id: returned.steamid,
        name: returned.personaname,
        images: [returned.avatar, returned.avatarmedium, returned.avatarfull]
      };
      return cb(profile);
    }
    return cb(null);
  });
}
