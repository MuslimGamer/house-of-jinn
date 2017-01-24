Crafty.c('Player', {
    init: function() {
        this.requires("Actor")
            .size(32, 32)
            .color('red')
            .move(100, 100)
			.controllable()
            .collideWith("Wall");
        
        // Resolve so that we stop moving
        this.collideWith("Door", function(data) {
            var door = data.obj;
            if (!door.isLocked)
            {
                door.die();
            }
            else
            {
                console.log("Locked.");
            }
        })
    }
});