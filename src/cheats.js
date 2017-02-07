cheats = {
  // Lights up all the rooms, permanently.
  enlighten: function() {
    Crafty.forEach("Room", function(r) { r.darkness.die(); });
  }
}
