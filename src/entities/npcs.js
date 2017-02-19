Crafty.c("Npc", {
    init: function() {
        this.requires("Actor").color("black").size(16, 32);
        var self = this;
        this.collide("Player", function() {
            self.die();
        });
    }
});

Crafty.c("NpcGenerator", {
    createOrphans: function(n) {
        // Pick N rooms first. May include the player's room.
        var rooms = getRandomSubset(map.locations, n);
        var EDGES_BUFFER = 32;
        var roomWidth = config("roomWidth");
        var roomHeight = config("roomHeight");

        for (var i = 0; i < n; i++) {
            var npc = Crafty.e("Npc");
            // Pick random location within the room. If the player is in the room,
            // you may start a new game and auto-grab an NPC. srsly, yo? ugh.
            var x = randomBetween(EDGES_BUFFER, roomWidth - (2 * EDGES_BUFFER));
            var y = randomBetween(EDGES_BUFFER, roomHeight - (2 * EDGES_BUFFER));
            var room = rooms[i];
            // room.x/y are indicies, not actual coordinates
            npc.move((room.x * roomWidth) + x, (room.y * roomHeight) + y);
        }
    }
});