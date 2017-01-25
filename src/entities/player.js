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

        this.z = 1; // on top of floors
        
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
        })
    }
});