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

            var t2 = Crafty.e("Text2").text("Click here to restart").fontSize(48).move(t.x, t.y + 72)
                .click(function() {
                    // Hide a big where calling Game.start immediately causes Game Over to stay on-screen,
                    // and the game doesn't actually restart.  Not sure why this happens; keeping a single
                    // entity around seems to resolve the issue.
                    var e = Crafty.e("Actor").size(0, 0);
                    var eId = e[0];
                    // Kill off EVERYTHING. Except e.
                    t.die();
                    t2.die();
                    var everything = Crafty("*");
                    for (var i = 0; i < everything.length; i++) {
                        var entityId = everything[i];
                        if (entityId != eId) {
                            Crafty(entityId).destroy();
                        }
                    }
                    Game.start();
                    Crafty(e).destroy();
                });
            t2.textColor("white");
        });
    },

    pickNewTargetRoom: function() {
        const BORDER_BUFFER = 16;
        var targetRoomIndex = randomBetween(0, map.locations.length);
        this.targetRoom = map.locations[targetRoomIndex].entity;
        this.targetX = randomBetween(this.targetRoom.x + BORDER_BUFFER, this.targetRoom.x + this.targetRoom.width - (2 * BORDER_BUFFER));
        this.targetY = randomBetween(this.targetRoom.y + BORDER_BUFFER, this.targetRoom.y + this.targetRoom.height - (2 * BORDER_BUFFER));
        
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