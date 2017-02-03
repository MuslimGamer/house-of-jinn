Crafty.c("Darkness", {
    init: function() {
        this.requires("Actor").size(parseInt(config("roomWidth")), parseInt(config("roomHeight"))).color("black");
        this.z = 99;
        this.alpha = 1;
    }
})