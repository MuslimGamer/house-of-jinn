Crafty.c('Player', {
    init: function() {
        var self = this;
        this.keys = 0; // any key for any door

        this.requires("Actor")
            .size(32, 32)
            .color('red')
            .move(100, 100)
			.controllable()
            .collideWith("Wall");

        this.z = 1000; // on top of floors
        this.currentRoom = Crafty.first("Room");
        
        // Resolve so that we stop moving
        this.collideWith("Door", function(data) {
            var door = data.obj;
            if (!door.isLocked) {
                door.die();
            } else if (self.keys > 0) {
                door.die();
                self.keys -= 1;
                console.log("Unlocked.");
            } else {
                console.log("Locked.");
            }
        });

        this.bind("Moved", function(oldPosition) {     
            // Use AABB to figure out what room the player is in. Light the first one found.
            // When the player straddles two rooms, we pick the first room that fully encloses
            // the player. There's no such room. So currentRoom stays at the old room. Nicely done.
            var foundRoom = false;
            Crafty.forEach("Room", function(room) {
                if (!foundRoom) {
                    if (self.x >= room.x && self.y >= room.y && 
                    self.x + self.width() <= room.x + room.width &&
                    self.y + self.height() <= room.y + room.height) {
                        self.currentRoom = room;
                        self.currentRoom.light();
                        foundRoom = true;
                    } else {
                        room.darken();
                    }
                }
            });
        });

        // Pretend we moved: trigger lighting up the current room
        Crafty.trigger("Moved", { "axis": "x", "oldValue": this.x });
    }
});