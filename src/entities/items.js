// Can unlock a door. Any door (it's not coded, eg. colour-coded).
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

// Displays how close the closest jinn is, in number of rooms.
Crafty.c("JinnStone", {
    init: function() {
        this.requires("Text2").fontSize(48).text("").textColor("white");
        var player = Crafty("Player");
        var self = this;
        // Fast and cheap approximation: look at how many rooms
        // away we are (eg. 2 rooms vertically + 1 horizontally = 3/2 = 1.5)
        this.bind("EnterFrame", function() {
            var closest = 99999;

            Crafty.forEach("Jinn", function(jinn) {
                var jinnRoom = map.findRoomWith(jinn);
                var playerRoom = map.findRoomWith(player);
                var distance = closest;
                // jinRoom is undefined when the jinn is just in darkness
                if (typeof(jinnRoom) !== "undefined") {
                    distance = (Math.abs(jinnRoom.data.x - playerRoom.data.x) + Math.abs(jinnRoom.data.y - playerRoom.data.y)) / 2;
                }
                if (distance < closest) {
                    closest = distance;
                }
            });

            // Tweak this to only detect jinns in a certain range
            if (closest < 99999) {
                self.text("Closest jinn is " + closest + " rooms away");
            } else {
                self.text("No jinns nearby?");
            }

            // Stay in the top-left corner of the UI
            self.x = -Crafty.viewport.x;
            self.y = -Crafty.viewport.y;
        });
    }
});

// Temporarily holds a jinn on it for a few seconds -- enough time to get away
Crafty.c("JinnTrap", {
    init: function() {
        this.requires("Actor").size(96, 96).color("white");
        this.alpha = 0.5;
        var self = this;
        var player = Crafty("Player");
        
        // Center trap on player
        this.move(player.x - (this.width() - player.width()) / 2, player.y - (this.height() - player.height()) / 2);

        this.collide("Jinn", function(data) {

            self.die();

            var jinn = data[0].obj;
            jinn.trap();
        });
    }
})