/////////
// Specific types of jinns
/////////

// Spawns bubbles in every direction, constantly. If one touches you,
// the jinn changes direction and charges at you full-force.
Crafty.c("BubblerJinn", {
    init: function() {
        this.lastSpawn = new Date();
        this.requires("WandererJinn").color("#8800ff").size(64, 64);

        this.bind("EnterFrame", function() {
            var now = new Date();
            if ((now - this.lastSpawn) >= config("bubblerSpawnsEveryNSeconds") * 1000) {
                this.lastSpawn = now;
                Crafty.e("Bubble").setParent(this);
            }
        })
    }
})

Crafty.c("Bubble", {
    init: function() {
        var BUBBLE_VELOCITY = config("bubblerSpawnVelocity");
        var BUBBLE_LIFETIME = config("bubblerSpawnLifespanSeconds");
        
        var vx = randomBetween(-BUBBLE_VELOCITY, BUBBLE_VELOCITY);
        var vy = randomBetween(-BUBBLE_VELOCITY, BUBBLE_VELOCITY);

        this.requires("Actor").size(16, 16).color("#8800ff");
        this.velocity(vx, vy);
        this.tween({ w: 0, h: 0 }, BUBBLE_LIFETIME * 1000);
        this.after(BUBBLE_LIFETIME, function() { this.die(); });
        var self = this;

        this.collide("Player", function() {
            if (self.parent.huntingPlayer == false) {
                self.parent.color("red");
                self.parent.huntingPlayer = true;
                // roar!!
                Crafty.forEach("Bubble", function(b) {
                    b.color("red");
                })
            }
        });

        if (config("killSpawnOnTrap") == true) {
            // Clones die when trapped
            this.collide("JinnTrap", function() {
                self.die();
            });
        }  
    },

    setParent: function(parent) {
        this.parent = parent;
        this.move(parent.x + (parent.width() / 2), parent.y + (parent.height() / 2));
        this.color(parent.color());
    }
});

// Picks whichever adjacent room brings it closest to the player, and walks into it.
// If both (or multiple) rooms are equidistant, picks randomly between them.
Crafty.c("StalkerJinn", {
    init: function() {
        this.requires("WalkerJinn").size(32, 32).color("#ff00ff");
        this.moving = false;
        this.onLostSight(this.moveCloserToPlayer);
    },

    moveCloserToPlayer: function() {
        var player = Crafty("Player");        
        // Don't do this every frame, just start this once and change target room
        // when we reach our desination.
        if (this.moving == false) {
            this.moving = true;
            var myRoom = map.findRoomWith(this);
            if (typeof(myRoom) === "undefined") {
                // Something went horribly wrong. Don't move.
                return;
            }
            var directions = myRoom.data.doorDirections + myRoom.data.openDirections; // string, eg. se => south/east
            var closest = [];
            var closestDistance = 2000000000;
            var playerRoom = map.findRoomWith(player).data;

            // No square root necessary, squared distance is fine
            for (var i = 0; i < directions.length; i++) {
                var direction = directions[i];

                var xOffset = 0; 
                var yOffset = 0;
                
                if (direction == "e") {
                    xOffset = 1;
                } else if (direction == "w") {
                    xOffset = -1;
                } else if (direction == "n") {
                    yOffset = -1;
                } else if (direction == "s") {
                    yOffset = 1;
                }

                var targetRoom = map.getRoomAt(myRoom.data.x + xOffset, myRoom.data.y + yOffset);
                // Don't compare actual distance; compare grid distance. This makes two rooms equal if they
                // are equidistant from the player (using room x/y just compares the top-left corner).
                distance = Math.pow(playerRoom.x - targetRoom.data.x, 2) + Math.pow(playerRoom.y - targetRoom.data.y, 2);
                if (distance < closestDistance) {
                    closest = [targetRoom];
                    closestDistance = distance;
                } else if (distance == closestDistance) {
                    closest.push(targetRoom);
                }
            }
            
            // If closestDistance is zero, we're about to kill the player. 
            // Roar or do something awesome.
            var target = closest[randomBetween(0, closest.length)];
            this.jinnMove(target, function() {
                this.moving = false;
                this.moveCloserToPlayer();
            });
        }
    }
});

// Walks from room to room. On sight, chases, and self-replicates continuously.
// Only the original (alpha/prime) can replicate. The others can only chase.
Crafty.c("SplitterJinn", {
    init: function() {
        this.requires("Jinn, Walker, ChargePlayerOnSight, WalkUntilSeesPlayer")
            .size(16, 16).color("#ffdd00");

        var player = Crafty("Player");
        this.lastSplit = new Date();
        this.canSplit = true;
        this.canHunt = true;

        this.onSight(function() {
            if (!this.canHunt) {
                return;
            }
            if (!this.canSplit) {
                this.huntPlayer();
            } else {
                var myRoom = map.findRoomWith(this);
                var playerRoom = map.findRoomWith(player);
                if (!player.isDead) {
                    // Split if it's been long enough.
                    var now = new Date();
                    if (now - this.lastSplit >= config("splitterSplitsEveryNSeconds") * 1000) {
                        this.lastSplit = now;

                        var clone = Crafty.e("SplitterJinn").dontSplit();
                        if (config("killSpawnOnTrap") == true) {
                            // Clones die when trapped
                            clone.collide("JinnTrap", function() {
                                clone.die();
                            });
                        }                  
                        
                        var targetX = randomBetween(0, 100) < 50 ? -1 : 1;
                        var targetY = randomBetween(0, 100) < 50 ? -1 : 1;
                        var distance = config("splitterDistanceOnSplit");

                        clone.move(this.x, this.y);
                        clone.canHunt = false;
                        // Wait a fractional second before you hunt. This keeps the clones
                        // from running exactly on top of the original. And makes it more scary.
                        clone.after(config("splitterCloneWaitTimeSeconds"), function() {
                            clone.canHunt = true;
                        });
                    }

                    this.huntPlayer();
                }
            }
        });
    },

    dontSplit: function() {
        this.canSplit = false;
        return this;
    }
});

// Walks from room to room. Really slowly. When he sees you, starts oozing
// toward you. If you leave that room, he appears from the walls again.
Crafty.c("JumperJinn", {
    init: function() {
        this.requires("Jinn, Walker, ChargePlayerOnSight, WalkUntilSeesPlayer")
            .size(32, 32).color("#55aaff");

        this.chargeMultiplier = 0.5; // charge slowly
        var player = Crafty("Player");

        this.onSight(function() {
            var myRoom = map.findRoomWith(this);
            var playerRoom = map.findRoomWith(player);
            if (!player.isDead) {
                if (myRoom == playerRoom) {
                    this.huntPlayer();
                } else {
                    // Teleport to the player's room. MUAHAHHAHAHA!
                    var roomWidth = config("roomWidth");
                    var roomHeight = config("roomHeight");
                    var teleportX = playerRoom.x + randomBetween(0, roomWidth / 4);
                    var teleportY = playerRoom.y + randomBetween(0, roomHeight / 4);
                    
                    if (Math.abs(playerRoom.x - player.x) < Math.abs(playerRoom.x + roomWidth - player.x)) {
                        // Player is closer to the LHS of the room; spawn on the RHS
                        teleportX += roomWidth / 2;
                    }
                    if (Math.abs(playerRoom.y - player.y) < Math.abs(playerRoom.y + roomHeight - player.y)) {
                        // Player is closer to the top of the room; spawn on the bottom
                        teleportY += roomHeight / 2;
                    }

                    this.move(teleportX, teleportY);
                }
            }
        });
    }
});

// Stays still. Once he sees you, unrelentingly chases you.
Crafty.c("ShyGuyJinn", {
    init: function() {
        var self = this;
        this.requires("Jinn, ChargePlayerOnSight").size(24, 24).color("blue");
        this.bind("EnterFrame", this.huntPlayer);
    }
});

// Walks from room to room. Once he sees you, unrelentingly chases you.
Crafty.c("WalkerJinn", {
    init: function() {
        this.requires("Jinn, Walker, ChargePlayerOnSight").size(32, 32).color("#882222");

        var self = this;
        var player = Crafty("Player");
        this.lostSightCallback = this.moveToAdjacentRoom;

        this.bind("EnterFrame", function() {
            // Hunt on sight. Don't hunt when out of sight.
            var myRoom = map.findRoomWith(this);
            var playerRoom = map.findRoomWith(player);
            if (myRoom == playerRoom && !this.huntingPlayer) {
                this.huntingPlayer = true;
            } else if (myRoom != playerRoom && this.huntingPlayer) {
                this.huntingPlayer = false;
                // Doesn't immediately stop moving. Walker will continue forward
                // to the room they last saw the player; when they reach, they will
                // look for a new adjacent room. This is because the tween ends
                // and calls into moveToAdjacentRoom; we don't need to do anything.
            }

            if (this.huntingPlayer) {
                this.chargeAtPlayer();
            } else {
                // Move to adjacent room
                this.lostSightCallback();
            }
        });
    },

    // Call to set what we do when we lose sight of the player
    onLostSight: function(callback) {
        this.lostSightCallback = callback;
    }
});

// Wanders randomly through the mansion. Once he sees you, chases you unrelentingly.
Crafty.c("WandererJinn", {
    init: function() {
        var self = this;
        this.requires("Jinn, ChargePlayerOnSight").size(64, 64).color("#aaffaa");
        this.bind("EnterFrame", this.huntPlayer);
        this.onStartCallback = this.pickNewTargetRoom;
        this.onStartCallback();
    },

    pickNewTargetRoom: function() {
        var targetRoomIndex = randomBetween(0, map.locations.length);
        targetRoom = map.locations[targetRoomIndex].entity;
        this.jinnMove(targetRoom, this.pickNewTargetRoom);
    },
})

/////////
// Base class with common behaviour, from which we build specific subclasses
/////////
Crafty.c("Jinn", {
    init: function() {
        var self = this;
        this.requires("Actor, Tween");
        this.collide("Player", this.gameOver);
        this.trapped = false;

        // Start in a random room. Not near the edges.
        const BORDER_BUFFER = 16;
        var player = Crafty("Player");

        var startX = player.x;
        var startY = player.y;

        var roomWidth = parseInt(config("roomWidth"));
        while(Math.abs(startX - player.x) + Math.abs(startY - player.y) <= roomWidth) {
            var targetRoomIndex = randomBetween(0, map.locations.length);
            var targetRoom = map.locations[targetRoomIndex].entity;
            startX = randomBetween(targetRoom.x + BORDER_BUFFER, targetRoom.x + targetRoom.width - (2 * BORDER_BUFFER));
            startY = randomBetween(targetRoom.y + BORDER_BUFFER, targetRoom.y + targetRoom.height - (2 * BORDER_BUFFER));
        }

        this.move(startX, startY);
        
        // Called when a jinn is first created, and also when a trapped jinn is
        // released. This method should make them start their "normal" behaviour.
        this.onStartCallback = null;
    },

    gameOver: function() {
        var player = Crafty("Player");
        player.die();
        var t = Crafty.e("Text2").text("Game Over!").fontSize(72);
        t.textColor("white");
        t.move(player.x, player.y);

        t.z = 99999;
        Crafty.viewport.centerOn(t, 1000);
        var t2 = Crafty.e("Text2").text("Click here to restart").fontSize(48).move(t.x, t.y + 72);
        t2.z = 99999;        
        t2.click(function() {
            // Hide a big where calling Game.start immediately causes Game Over to stay on-screen,
            // and the game doesn't actually restart.    Not sure why this happens; keeping a single
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
    },

    trap: function() {
        this.trapped = true;
        var self = this;

        var stopImmediately = function() {
            // Stop moving right now
            self.cancelTween("x");
            self.cancelTween("y");
        }

        // Supercede any commands to move
        this.bind("EnterFrame", stopImmediately);

        this.after(config("trapTimeSeconds"), function() { 
            self.trapped = false;
            self.unbind("EnterFrame", stopImmediately);
            if (self.onStartCallback != null) {
                self.onStartCallback();
            }
         });        

         // Jinn forgets about us
        this.huntingPlayer = false;
        this.sawPlayer = false;
    },

    // Do this jinn thing where we move at a constant velocity toward our target.
    // Once it reaches, waits jinnWaitTimeSeconds (see config.json), then invokes
    // onArriveCallback.
    jinnMove: function(targetRoom, onArriveCallback) {
        if (!this.trapped) {
            const BORDER_BUFFER = 16;
            // Move into the room, but stay at least BORDER_BUFFER pixels away from the edges.
            var targetX = randomBetween(targetRoom.x + BORDER_BUFFER, targetRoom.x + targetRoom.width - (2 * BORDER_BUFFER) - this.width());
            var targetY = randomBetween(targetRoom.y + BORDER_BUFFER, targetRoom.y + targetRoom.height - (2 * BORDER_BUFFER) - this.height());
            // move at a constant speed
            var velocity = config("jinnVelocity");
            var distanceInPixels = Math.sqrt(Math.pow(targetX - this.x, 2) + Math.pow(targetY - this.y, 2));
            var travelTimeInSeconds = distanceInPixels / velocity;
            this.move(targetX, targetY, travelTimeInSeconds);

            // Calling pickNewTargetRoom recursively causes something to keep accumulating; we end up picking
            // 1, 2, 4, 8, ... exponentially multiple targets at once. I tried everything and couldn't find
            // any other way around this.
            //
            // Since we know the travel time, just wait that long, plus the delay time, and move again.
            this.after(travelTimeInSeconds + config("jinnWaitTimeSeconds"), onArriveCallback);
        }
    }
});

/////////
// Components that encapsulate common behaviours
/////////
// Charges the player once they're in the same room.
Crafty.c("ChargePlayerOnSight", {
    init: function() {
        var player = Crafty("Player");
        this.huntingPlayer = false;
        this.lastCourseCorrection = new Date();
    },

    // Apply this in a binding to EnterFrame
    huntPlayer: function() {
        if (this.trapped == true) {
            return;
        }
        
        if (this.huntingPlayer == false) {
            // Charge the player.
            var myRoom = map.findRoomWith(this);
            var player = Crafty("Player");            
            var playerRoom = map.findRoomWith(player);

            if (myRoom == playerRoom) {
                this.huntingPlayer = true;
            }
        } else {
            // Use the jinn's specific charge multiplier, or 1 as the default
            // if no multiplier is specified.
            this.chargeAtPlayer(this.chargeMultiplier || 1);
        }
    },

    chargeAtPlayer: function(speedMultiplier) {

        if (typeof(speedMultiplier) === "undefined") {
            speedMultiplier = 1;
        }

        var now = new Date();
        // Correct our velocity every 0.1s. Doing this every frame, well, kills us.
        if (now - this.lastCourseCorrection >= 0.1 * 1000) {
            this.cancelTween("x");
            this.cancelTween("y");
            var player = Crafty("Player");
            var distance = Math.sqrt(Math.pow(this.x - player.x, 2) + Math.pow(this.y - player.y, 2));
            // When hunting, jinns move at 2x
            var speed = 2 * config("jinnVelocity");
            var travelTime = distance / speed;
            this.move(player.x, player.y, travelTime / speedMultiplier);
            this.lastCourseCorrection = now;
        }
    }
});

// Walks from room to room "legitimately" (only walks through openings and
// walls which have doors in them).
Crafty.c("Walker", {
    init: function() {
        this.onStartCallback = function() {
            // EnterFrame uses this to tell that it has to pick a new destination
            this.moving = false;
        };

        this.onStartCallback();
    },

    moveToAdjacentRoom: function() {
        // Don't do this every frame, just start this once and change target room
        // when we reach our desination.
        if (this.moving == false) {
            this.moving = true;
            var myRoom = map.findRoomWith(this);
            if (typeof(myRoom) === "undefined") {
                // Something went horribly wrong. Don't move.
                return;
            }
            var directions = myRoom.data.doorDirections + myRoom.data.openDirections; // string, eg. se => south/east
            var direction = directions[randomBetween(0, directions.length)];
            var xOffset = 0;
            var yOffset    = 0;

            if (direction == "e") {
                xOffset = 1;
            } else if (direction == "w") {
                xOffset = -1;
            } else if (direction == "n") {
                yOffset = -1;
            } else if (direction == "s") {
                yOffset = 1;
            }

            var targetRoom = map.getRoomAt(myRoom.data.x + xOffset, myRoom.data.y + yOffset);
            this.jinnMove(targetRoom, function() {
                this.moving = false;
                this.moveToAdjacentRoom();
            });
        }
    }
})

// Walk around until you see the player. Once seen, invokes .onSight(...)
// callback every frame.
Crafty.c("WalkUntilSeesPlayer", {
    init: function() {
        this.requires("Jinn, Walker, ChargePlayerOnSight");
        this.sawPlayer = false;
        var player = Crafty("Player");
        this.onSightCallback = null;

        this.bind("EnterFrame", function() {
            if (this.trapped == true) {
                return;
            }

            var myRoom = map.findRoomWith(this);
            var playerRoom = map.findRoomWith(player);

            if (!this.sawPlayer) {
                this.moveToAdjacentRoom();
                if (myRoom == playerRoom) {
                    this.sawPlayer = true;
                }
            } else {
                this.onSightCallback();
            }
        });
    },

    onSight: function(callback) {
        this.onSightCallback = callback;
    }
});
