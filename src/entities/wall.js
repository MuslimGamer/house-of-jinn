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
            this.w1 = Crafty.e("Wall").size(wallSize, height);
            this.w2 = Crafty.e("Wall").size(wallSize, height);
            this.w1.x = x;
            this.w1.y = y;
            this.w2.x = x + width - this.w2.width();
            this.w2.y = this.w1.y;

            this.doorwayX = this.w1.x + this.w1.width();
            this.doorwayY = this.w1.y;
        } else {
            this.orientation = "vertical";
            var wallSize = (height - DOOR_LENGTH) / 2;
            this.w1 = Crafty.e("Wall").size(width, wallSize);
            this.w2 = Crafty.e("Wall").size(width, wallSize);
            this.w1.x = x;
            this.w1.y = y;
            this.w2.x = this.w1.x;
            this.w2.y = y + height - this.w2.height();

            this.doorwayX = this.w1.x;
            this.doorwayY = this.w1.y + this.w1.height();            
        }
        return this;
    },
    
    open: function(){
    	this.w1.destroy();
    	this.w2.destroy();
    	
    },

    door: function() {
        this.filler = Crafty.e("Door").move(this.doorwayX, this.doorwayY);
        if (this.orientation == "vertical")
        {
            this.filler.vertical();
        }
        return this.filler; // chain so you can lock it
    },

    wall: function()
    {
        this.filler = Crafty.e("Wall");
        this.filler.move(this.doorwayX, this.doorwayY).size(DOOR_LENGTH, DOOR_WIDTH);
        if (this.orientation == "vertical") {
            this.filler.size(DOOR_WIDTH, DOOR_LENGTH);
            this.filler.move(this.filler.x, this.filler.y);
        } else {
            this.filler.move(this.filler.x, this.filler.y);
        }
        return this;
    },

    z: function(value) {
        this.w1.z = value;
        this.w2.z = value;
        if (typeof(this.filler) != "undefined") {
            this.filler.z = value;
        }
    }
});