Crafty.c("Npc", {
    init: function() {
        this.requires("Actor").color("black").size(16, 32);
        var self = this;
        this.collide("Player", function() {
            self.die();
        });
    }
});