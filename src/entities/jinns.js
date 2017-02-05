Crafty.c('Jinn', {
    init: function() {
        var self = this;
        this.requires("Actor").size(64, 64).color("#aaffaa");
        this.pickNewTargetRoom();
        this.collide("Player", function() {
            var player = Crafty("Player");
            player.die();
            var t = Crafty.e("Text2").text("Game Over!").fontSize(72);
            t.textColor("white");
            t.move(player.x, player.y);
            Crafty.viewport.centerOn(t, 1000);
        });
    },

    pickNewTargetRoom: function() {
        const BORDER_BUFFER = 16;
        var targetRoomIndex = randomBetween(0, map.locations.length);
        this.targetRoom = map.locations[targetRoomIndex].entity;
        this.targetX = randomBetween(this.targetRoom.x + BORDER_BUFFER, this.targetRoom.x + this.targetRoom.width - (2 * BORDER_BUFFER));
        this.targetY = randomBetween(this.targetRoom.y + BORDER_BUFFER, this.targetRoom.y + this.targetRoom.height - (2 * BORDER_BUFFER));
        console.log("Target: " + this.targetRoom.x + ", " + this.targetRoom.y);
        
        // move at a constant speed
        var velocity = parseInt(config("jinnVelocity"));
        var distanceInPixels = Math.sqrt(Math.pow(this.targetX - this.x, 2) + Math.pow(this.targetY - this.y, 2));
        var travelTimeInSeconds = distanceInPixels / velocity;
        this.move(this.targetX, this.targetY, travelTimeInSeconds);

        // Calling pickNewTargetRoom recursively causes something to keep accumulating; we end up picking
        // 1, 2, 4, 8, ... exponentially multiple targets at once. I tried everything and couldn't find
        // any other way around this. 
        //
        // Since we know the travel time, just wait that long, plus the delay time, and move again.
        this.after(travelTimeInSeconds + parseFloat(config("jinnWaitTimeSeconds")), this.pickNewTargetRoom);
    }
});