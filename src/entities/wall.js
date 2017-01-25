const DOOR_LENGTH = 64; // longer side
const DOOR_WIDTH = 8; // shorter side

Crafty.c('Wall', {
    init: function() {
        this.requires("Actor").color('#443300');
    }
});

Crafty.c('Door', {
    init: function() {
        this.requires("Actor").color('#dddddd').size(DOOR_LENGTH, DOOR_WIDTH);
        this.isLocked = false;
    },
    
    lock: function() {
        this.isLocked = true;
        this.color("#ffbb00");
        return this;
    },

    vertical: function() {
        this.size(DOOR_WIDTH, DOOR_LENGTH);
        return this;
    },
})

Crafty.c("WallWithDoorway", {
    create: function(x, y, width, height) {
        if (typeof(x) == "undefined") {
            x = 0;
        }
        if (typeof(y) === "undefined") {
            y = 0;
        }
        if (width > height) {
            this.orientation = "horizontal";
            var wallSize = (width - DOOR_LENGTH) / 2;
            var w1 = Crafty.e("Wall").size(wallSize, height);
            var w2 = Crafty.e("Wall").size(wallSize, height);
            w1.x = x;
            w1.y = y;
            w2.x = x + width - w2.width();
            w2.y = w1.y;

            this.doorwayX = w1.x + w1.width();
            this.doorwayY = w1.y;
        } else {
            this.orientation = "vertical";
            var wallSize = (height - DOOR_LENGTH) / 2;
            var w1 = Crafty.e("Wall").size(width, wallSize);
            var w2 = Crafty.e("Wall").size(width, wallSize);
            w1.x = x;
            w1.y = y;
            w2.x = w1.x;
            w2.y = y + height - w2.height();

            this.doorwayX = w1.x;
            this.doorwayY = w1.y + w1.height();            
        }
        return this;
    },

    door: function() {
        var door = Crafty.e("Door").move(this.doorwayX, this.doorwayY);
        if (this.orientation == "vertical")
        {
            door.vertical();
        }
        return door;
    },

    wall: function()
    {
        var filler = Crafty.e("Wall");
        filler.move(this.doorwayX, this.doorwayY).size(DOOR_LENGTH, DOOR_WIDTH);
        if (this.orientation == "vertical") {
            filler.size(DOOR_WIDTH, DOOR_LENGTH);
            filler.move(filler.x, filler.y);
        } else {
            filler.move(filler.x, filler.y);
        }
        return this;
    }
});