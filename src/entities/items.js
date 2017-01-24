Crafty.c("Key", {
    init: function() {
        var self = this;
        this.requires("Actor").size(32, 12).color("#ffbb00")
        .collide("Player", function(data) {
            var player = data[0].obj;
            player.keys += 1;
            self.die();
            console.log("Got a key.");
        })
    }
});