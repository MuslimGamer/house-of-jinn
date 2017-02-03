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
        this.currentRoom.light();

        this.oldX = this.x;
        this.oldY = this.y;
        
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
        	Crafty.viewport.centerOn(this,100)
            var roomWidth = parseInt(config("roomWidth"));
            var roomHeight = parseInt(config("roomHeight"));

            // Coordinates in room indicies, not pixels. eg. (1, 0) is the first room on the right.
            var oldRoomX = Math.floor(this.oldX / roomWidth);
            var oldRoomY = Math.floor(this.oldY / roomHeight);            
            var oldRoom = map.getRoomAt(oldRoomX, oldRoomY);

            var currentX = Math.floor(this.x / roomWidth);
            var currentY = Math.floor(this.y / roomHeight);
            var currentRoom = map.getRoomAt(currentX, currentY);

            if (oldRoom != currentRoom)
            {
                if (typeof(oldRoom) != "undefined")
                {
                    oldRoom.darken();
                    oldRoom.darkenIfVisible("n");
                    oldRoom.darkenIfVisible("e");
                    oldRoom.darkenIfVisible("s");
                    oldRoom.darkenIfVisible("w");
                }

                if (typeof(currentRoom) != "undefined")
                {
                    currentRoom.light();
                    currentRoom.lightIfVisible("n");
                    currentRoom.lightIfVisible("e");
                    currentRoom.lightIfVisible("s");
                    currentRoom.lightIfVisible("w");
                }
            }

            this.oldX = this.x;
            this.oldY = this.y;
        });

        // Pretend we moved: trigger lighting up the current room
        Crafty.trigger("Moved", { "axis": "x", "oldValue": this.x });
    }
});