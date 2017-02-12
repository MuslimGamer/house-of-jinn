Game = {
    view: {
        // full-screen
        width: window.innerWidth,
        height: window.innerHeight
    },

    start: function() {
        // Game world is whatever fits on-screen
        Crafty.init(Game.view.width, Game.view.height);
        Crafty.background('#008800');
        map.generate();
        Crafty.viewport.clampToEntities = false; // Bubbler can cause camera to break
        var e = Crafty.e("Player");

        // var jinnsToSpawn = config("jinns");
        // for (var i = 0; i < jinnsToSpawn.length; i++) {
        //     var jinn = jinnsToSpawn[i];
        //     Crafty.e(jinn + "Jinn");
    }
}

window.addEventListener('load', Game.start);
