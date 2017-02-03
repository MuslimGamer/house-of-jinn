Crafty.c("Room", {
    // Create a room precisely contained within this size
    create: function(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.items = [];
        this.isLit = false;
        this.data = null; // RoomData instance

        var wallThickness = parseInt(config("wallThickness"));
        this.floor = Crafty.e("Actor").size(width, height).move(x, y).color("grey");
        this.top = Crafty.e("WallWithDoorway").create(x, y, width, wallThickness);
        this.bottom = Crafty.e("WallWithDoorway").create(x, y + height - wallThickness, width, wallThickness);
        this.left = Crafty.e("WallWithDoorway").create(x, y, wallThickness, height);
        this.right = Crafty.e("WallWithDoorway").create(x + width - wallThickness, y, wallThickness, height);
        
        this.darkness = Crafty.e("Darkness").move(this.x, this.y).size(this.width, this.height);
        return this;
    },

    // Seals off the gap in the given direction (nsew)
    seal: function(directions) {
        if (directions.indexOf("n") >= 0) {
            this.top.wall();
        }
        if (directions.indexOf("w") >= 0) {
            this.left.wall();
        }
        if (directions.indexOf("s") >= 0) {
            this.bottom.wall();
        }
        if (directions.indexOf("e") >= 0) {
            this.right.wall();
        }
        return this;
    },
    
    // Destroy walls
    open: function(directions) {
        if (directions.indexOf("n") >= 0) {
            this.top.open();
        }
        if (directions.indexOf("w") >= 0) {
            this.left.open();
        }
        if (directions.indexOf("s") >= 0) {
            this.bottom.open();
        }
        if (directions.indexOf("e") >= 0) {
            this.right.open();
        }
        return this;
    },

    // Creates doors in the given direction (nsew)
    door: function(directions) {
        if (directions.indexOf("n") >= 0) {
            var door = this.top.door();
            door.move(door.x, door.y - DOOR_WIDTH / 2);
        }
        if (directions.indexOf("w") >= 0) {
            var door = this.left.door();
            door.move(door.x - DOOR_WIDTH / 2, door.y);
        }
        if (directions.indexOf("s") >= 0) {
            var door = this.bottom.door();
            door.move(door.x, door.y + DOOR_WIDTH / 2);
        }
        if (directions.indexOf("e") >= 0) {
            var door = this.right.door();
            door.move(door.x + DOOR_WIDTH / 2, door.y);
        }
        return this;
    },

    // Locks doors in the given direction (nsew)
    lock: function(directions) {
        if (directions.indexOf("n") >= 0) {
            var door = this.top.filler;
            door.lock();
        }
        if (directions.indexOf("w") >= 0) {
            var door = this.left.filler;
            door.lock();
        }
        if (directions.indexOf("s") >= 0) {
            var door = this.bottom.filler;
            door.lock();
        }
        if (directions.indexOf("e") >= 0) {
            var door = this.right.filler;
            door.lock();
        }
        return this;
    },

    // Add items to this room, randomly-positioned
    addItems: function(list) {
        var wallThickness = parseInt(config("wallThickness"));
        for (var i = 0; i < list.length; i++) {
            var item = list[i];
            var itemX = randomBetween(this.x + wallThickness, this.x + this.width - wallThickness);
            var itemY = randomBetween(this.y + wallThickness, this.y + this.height - wallThickness);
            this.items.push(Crafty.e(item).move(itemX, itemY));
        }
        return this;
    },

    light: function() {
        if (!this.isLit) {
            this.isLit = true;
            this.darkness.alpha = 0;
        }
        return this;
    },

    lightIfVisible: function(direction)
    {
        var roomIndex = null;

        if (direction == "n") {
            roomIndex = this.data.N;
        } else if (direction == "e") {
            roomIndex = this.data.E;
        } else if (direction == "s") {
            roomIndex = this.data.S;
        } else if (direction == "w") {
            roomIndex = this.data.W;
        } else {
            throw("Invalid direction: " + direction);
        }

        if (roomIndex != null && this.data.openDirections.indexOf(direction) > -1)
        {
            var room = map.locations[roomIndex]
            map.getRoomAt(room.x, room.y).light();
        }
    },    

    darkenIfVisible: function(direction)
    {
        var roomIndex = null;

        if (direction == "n") {
            roomIndex = this.data.N;
        } else if (direction == "e") {
            roomIndex = this.data.E;
        } else if (direction == "s") {
            roomIndex = this.data.S;
        } else if (direction == "w") {
            roomIndex = this.data.W;
        } else {
            throw("Invalid direction: " + direction);
        }

        if (roomIndex != null && this.data.openDirections.indexOf(direction) > -1)
        {
            var room = map.locations[roomIndex]
            map.getRoomAt(room.x, room.y).darken();
        }
    },  

    darken: function() {
        if (this.isLit) {
            this.isLit = false;
            // Fog-of-war style: once lit, a room is always "remembered" by being
            // partially darkened only. Does this spoil it when jinns are inside?
            this.darkness.alpha = 0.9;
        }
        return this;
    },

    setupWalls: function(openDirections, wallDirections, doorDirections) {
        this.open(openDirections);
        this.seal(wallDirections);
        this.door(doorDirections);
        return this;
    }
   //Call rooms to shift position, keeping player room in center of screen.
   //Crafty view functions not yet working
  /* position: function() {
        this.floor.move(x, y);
        this.top.move(x, y);
        this.bottom.move(x, y + height - wallThickness);
        this.left.move(x, y);
        this.right.move(x + width - wallThickness, y);
        return this;
    }*/
});