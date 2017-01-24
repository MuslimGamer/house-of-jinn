const DOOR_SIZE = 64;

Crafty.c('Wall', {
    init: function() {
        this.requires("Actor").color('#443300');
    }
});

Crafty.c('Door', {
    init: function() {
        this.requires("Actor").color('#0088dd').size(DOOR_SIZE, 16);
        
        var self = this;
        this.collide("Player", function() {
            self.die();
        })
    },
    
    vertical: function() {
        this.size(16, DOOR_SIZE);
        return this;
    }
})

Crafty.c("WallWithDoor", {
    create: function(width, height, x, y) {
        if (typeof(x) == "undefined") 
        {
            x = 0;
        }
        if (typeof(y) === "undefined")
        {
            y = 0;
        }
        if (width > height)
        {
            var wallSize = (width - DOOR_SIZE) / 2;
            var w1 = Crafty.e("Wall").size(wallSize, height);
            var door = Crafty.e("Door");
            var w2 = Crafty.e("Wall").size(wallSize, height);
            w1.x = x;
            w1.y = y;
            door.x = w1.x + w1.width();
            door.y = w1.y;
            w2.x = door.x + door.width();
            w2.y = door.y;
        }
        else
        {
            var wallSize = (height - DOOR_SIZE) / 2;
            var w1 = Crafty.e("Wall").size(width, wallSize);
            var door = Crafty.e("Door").vertical();
            var w2 = Crafty.e("Wall").size(width, wallSize);
            w1.x = x;
            w1.y = y;
            door.x = w1.x;
            door.y = w1.y + w1.height();
            w2.x = door.x;
            w2.y = door.y + door.height();
        }
    }
});