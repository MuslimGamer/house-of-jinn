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
        console.log("Map generated, " + map.locations.length + " Rooms generated");

        var roomWidth = parseInt(config("roomWidth"));
        var roomHeight = parseInt(config("roomHeight"));

        for (var roomIndex = 0; roomIndex < map.locations.length; roomIndex++) {
            var currentRoom = map.locations[roomIndex];
            newRoom = Crafty.e("Room")
                .create(currentRoom.x * roomWidth, currentRoom.y * roomHeight, roomWidth, roomHeight)
                .setupWalls(currentRoom.openDirections, currentRoom.wallDirections, currentRoom.doorDirections);
            newRoom.data = currentRoom;
            currentRoom.entity = newRoom;
            map.setRoomAt(currentRoom.x, currentRoom.y, newRoom);
        }
        var e = Crafty.e("Player");

        //for (var i = 0; i < 4; i++)
        //{
            Crafty.e("Jinn");
        //}
    }
}

window.addEventListener('load', Game.start);

