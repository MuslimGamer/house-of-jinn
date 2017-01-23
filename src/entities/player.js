Crafty.c('Player', {
    init: function() {
        this.requires("Actor")
            .size(32, 32)
            .color('red')
            .move(100, 100)
			.controllable();
    }
});