Game = {
    view: {
        // full-screen
        width: window.innerWidth,
        height: window.innerHeight
    },

    start: function() {
        // Game world is whatever fits on-screen
        Crafty.init(Game.view.width, Game.view.height);
        Crafty.background('#663300');

        // horrible cop-out. TODO: fix this if there's time.
        while (typeof(map.locations) === "undefined" || map.locations.length < 20) {
            map.generate();
        }
        map.createRoomEntities();

        console.log("Created " + map.locations.length + " rooms.");

        Crafty.viewport.clampToEntities = false; // Bubbler can cause camera to break
        var e = Crafty.e("Player");

        var jinnsToSpawn = config("jinns");
        for (var i = 0; i < jinnsToSpawn.length; i++) {
            var jinn = jinnsToSpawn[i];
            Crafty.e(jinn + "Jinn");
        }

        if (config("jinnStone") == true) {
            Crafty.e("JinnStone").uiOffset(16, 16);
        }

        Crafty.e("OrphanCounter").uiOffset(16, 64);
    }
}

window.addEventListener('load', Game.start);
