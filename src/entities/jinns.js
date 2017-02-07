/////////
// Specific types of jinns
/////////

Crafty.c("ShyGuyJinn", {
  init: function() {
    var self = this;
    this.requires("Jinn, ChargePlayerOnSight").size(24, 24).color("blue");
  }
});

Crafty.c("WalkerJinn", {
  init: function() {
    var self = this;
    var player = Crafty("Player");
    this.moving = false;

    this.requires("Jinn, ChargePlayerOnSight").size(32, 32).color("#882222");

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
        this.cancelTween("x");
        this.cancelTween("y");
        // Calculating distance and moving at an appropriate speed is overrated.
        // It's expensive, and we're doing this every frame. never mind that.
        // Instead, just charge toward the player at a relatively fast rate.
        // We're going to cancel and re-issue this tween every frame.
        // We don't want to slow down when super close, so if Close Enough, move Super Fast.
        if (Math.abs(this.x - player.x) + Math.abs(this.y - player.y) <= 150) {
          this.move(player.x, player.y, config("jinnHuntPounceTweenTime"));
        } else {
          this.move(player.x, player.y, config("jinnHuntTweenTime"));
        }
      } else {
        // Move to adjacent room
        if (this.moving == false) {
          this.moveToAdjacentRoom();
        }
      }
    });
  },

  moveToAdjacentRoom: function() {
    this.moving = true;
    var myRoom = map.findRoomWith(this);
    var directions = myRoom.data.doorDirections + myRoom.data.openDirections; // string, eg. se => south/east
    var direction = directions[randomBetween(0, directions.length)];
    var xOffset = 0;
    var yOffset  = 0;

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
});

Crafty.c("WandererJinn", {
  init: function() {
    var self = this;
    this.requires("Jinn, ChargePlayerOnSight").size(64, 64).color("#aaffaa");
    this.pickNewTargetRoom();
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
Crafty.c('Jinn', {
  init: function() {
    var self = this;
    this.requires("Actor, Tween");
    this.collide("Player", this.gameOver);

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
  },

  gameOver: function() {
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
  },

  jinnMove: function(targetRoom, onArriveCallback) {
    const BORDER_BUFFER = 16;
    var targetX = randomBetween(targetRoom.x + BORDER_BUFFER, targetRoom.x + targetRoom.width - (2 * BORDER_BUFFER));
    var targetY = randomBetween(targetRoom.y + BORDER_BUFFER, targetRoom.y + targetRoom.height - (2 * BORDER_BUFFER));
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
});

/////////
// Components that encapsulate common behaviours
/////////
Crafty.c("ChargePlayerOnSight", {
  init: function() {
    var player = Crafty("Player");
    this.huntingPlayer = false;
    this.bind("EnterFrame", function() {
      if (this.huntingPlayer == false) {
        // Charge the player. This is a one-way process (we never go back
        // to wandering from room to room) because the player just doesn't
        // have any chance of survival. Sorry, old man, it's game over.
        var myRoom = map.findRoomWith(this);
        var playerRoom = map.findRoomWith(player);
        if (myRoom == playerRoom) {
          this.huntingPlayer = true;
        }
      } else {
        this.cancelTween("x");
        this.cancelTween("y");
        // Calculating distance and moving at an appropriate speed is overrated.
        // It's expensive, and we're doing this every frame. never mind that.
        // Instead, just charge toward the player at a relatively fast rate.
        // We're going to cancel and re-issue this tween every frame.
        // We don't want to slow down when super close, so if Close Enough, move Super Fast.
        if (Math.abs(this.x - player.x) + Math.abs(this.y - player.y) <= 150) {
          this.move(player.x, player.y, config("jinnHuntPounceTweenTime"));
        } else {
          this.move(player.x, player.y, config("jinnHuntTweenTime"));
        }
      }
    });
  }
});
