Crafty.c("Room", {
    // Create a room precisely contained within this size
    create: function(x, y, width, height) {
        var wallThickness = parseInt(config("wall_thickness"));
        this.top = Crafty.e("WallWithDoorway").create(x, y, width, wallThickness);
        this.bottom = Crafty.e("WallWithDoorway").create(x, y + height - wallThickness, width, wallThickness);
        this.left = Crafty.e("WallWithDoorway").create(x, y, wallThickness, height);
        this.right = Crafty.e("WallWithDoorway").create(x + width - wallThickness, y, wallThickness, height);
        return this;
    },

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
    }
});