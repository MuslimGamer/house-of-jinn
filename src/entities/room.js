Crafty.c("Room", {
    // Create a room precisely contained within this size
    create: function(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        var wallThickness = parseInt(config("wall_thickness"));
        this.floor = Crafty.e("Actor").size(width, height).move(x, y).color("grey");
        this.top = Crafty.e("WallWithDoorway").create(x, y, width, wallThickness);
        this.bottom = Crafty.e("WallWithDoorway").create(x, y + height - wallThickness, width, wallThickness);
        this.left = Crafty.e("WallWithDoorway").create(x, y, wallThickness, height);
        this.right = Crafty.e("WallWithDoorway").create(x + width - wallThickness, y, wallThickness, height);
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

    items: function(list) {
        var wallThickness = parseInt(config("wall_thickness"));
        for (var i = 0; i < list.length; i++) {
            var item = list[i];
            var itemX = randomBetween(this.x + wallThickness, this.x + this.width - wallThickness);
            var itemY = randomBetween(this.y + wallThickness, this.y + this.height - wallThickness);
            Crafty.e(item).move(itemX, itemY);
        }
    }
});