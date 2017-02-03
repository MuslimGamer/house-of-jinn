Crafty.c("Darkness", {
    init: function() {
        this.requires("Actor").size(Game.view.width * 5, Game.view.height * 5).color("black");
        this.z = 99;
        this.alpha = 0.9;
    }
})