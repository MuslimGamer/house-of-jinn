Crafty.c("Room", {
    // Create a room precisely contained within this size
    create: function(x, y, width, height) {
        var wallThickness = parseInt(config("wall_thickness"));
        Crafty.e("WallWithDoorway").create(x, y, width, wallThickness); // top
        Crafty.e("WallWithDoorway").create(x, y + height - wallThickness, width, wallThickness); // bottom
        Crafty.e("WallWithDoorway").create(x, y, wallThickness, height); // left
        return Crafty.e("WallWithDoorway").create(x + width - wallThickness, y, wallThickness, height); // right
    }
});