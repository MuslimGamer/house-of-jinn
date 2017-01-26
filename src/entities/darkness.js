Crafty.c("Darkness", {
    init: function() {
        this.requires("Actor").size(Game.view.width, Game.view.height).color("black");
        this.z = 99;
        this.alpha = 0.9;
    }
})