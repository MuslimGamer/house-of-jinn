Crafty.c("RoomData", {
    //Room identifier
    id: 0, //Unique ID code, references index of locations array
    x: 0, //Virtual X-Y position for spacial cohesion of generated rooms. 
    y: 0,
    //Connecting IDs
    N: undefined,
    S: undefined,
    E: undefined,
    W: undefined,
    entity: null, // Crafty.e("Room") for this room data

    openDirections: '',
    doorDirections: '',
    wallDirections: '',
    //Room attributes
    Type: 0, //Identification string for room type subclass
    //Room generation attributes
    Furniture: [],
    connectionType: [], //Types of rooms this room node can parent. Type can be repeated to increase probability of spawning
    numRoomsToConnect: 0, //How many connections this node can support

    init: function() {},

    at: function(x, y) { //Assign X-Y position of room, check area is free. Return conflicting room ID if fails.

        for (var roomIndex = 0; roomIndex < map.locations.length; roomIndex++) {
            if (map.locations[roomIndex].x == x && map.locations[roomIndex].y == y) {
                return map.locations[roomIndex].id; //Location already in use. Return ID of conflicting room 
            }
        }
        //Location is free. Officially assign X-Y position to this room and return success.
        this.x = x;
        this.y = y;
        return this.id;
    },

    connect: function(roomId, dir) {
        this.numRoomsToConnect -= 1;
        var targetRoom = map.locations[roomId];
        targetRoom.numRoomsToConnect -= 1;
        switch (dir) {
            case "North": //Room is placed to the north of parent
                this.N = roomId
                targetRoom.S = this.id
                break;
            case "South": //Room is placed to the south of the parent
                this.S = roomId
                targetRoom.N = this.id
                break;
            case "East":
                this.E = roomId
                targetRoom.W = this.id
                break;
            case "West":
                this.W = roomId
                targetRoom.E = this.id
        }
    },

    //Test if proposed connection is permitted (Rooms allowed more doors, room types compatible for linking).
    canConnect: function(roomId, dir) {
        var targetRoom = map.locations[roomId];
        // Do both rooms have a free connection?
        if (this.numRoomsToConnect == 0 || targetRoom.numRoomsToConnect == 0) {
            return false;
        }

        // Is the target room allowed to connect to this type of room?
        if (targetRoom.connectionType.indexOf(this.Type) >= 0) {
            return true;
        }
    },

    setDirectionData: function() {
        if (this.N == undefined) {
            this.wallDirections += 'n';
        } else {
            if (this.Type == map.locations[this.N].Type) {
                this.openDirections += 'n';
            } else {
                this.doorDirections += 'n';
            }
        }
        if (this.S == undefined) {
            this.wallDirections += 's';
        } else {
            if (this.Type == map.locations[this.S].Type) {
                this.openDirections += 's';
            } else {
                this.doorDirections += 's';
            }
        }
        if (this.E == undefined) {
            this.wallDirections += 'e';
        } else {
            if (this.Type == map.locations[this.E].Type) {
                this.openDirections += 'e';
            } else {
                this.doorDirections += 'e';
            }
        }
        if (this.W == undefined) {
            this.wallDirections += 'w';
        } else {
            if (this.Type == map.locations[this.W].Type) {
                this.openDirections += 'w';
            } else {
                this.doorDirections += 'w';
            }
        }
    },

    numConnections: function() {
        var total = 0;
        if (typeof(this.N) !== "undefined") { total++; }
        if (typeof(this.S) !== "undefined") { total++; }
        if (typeof(this.E) !== "undefined") { total++; }
        if (typeof(this.W) !== "undefined") { total++; }
        return total;
    },

    unconnectedDirections: function() {
        var toReturn = [];
        if (this.y > 0 && typeof(this.N) === "undefined") { toReturn.push("North"); }
        if (this.y < map.height - 1 && typeof(this.S) === "undefined") { toReturn.push("South"); }
        if (this.x < map.width - 1 && typeof(this.E) === "undefined") { toReturn.push("East"); }
        if (this.x > 0 && typeof(this.W) === "undefined") { toReturn.push("West"); }
        return toReturn;
    }
});


Crafty.c("Entrance", {
    init: function() {
        this.requires('RoomData')
            .attr({
                id: map.locations.length,
                Type: "Entrance",
                numRoomsToConnect: 3,
                connectionType: ['Dining', 'Living', 'Hallway', 'Hallway', 'Hallway', 'Study']

            })
    }
});

Crafty.c("Hallway", {
    init: function() {
        this.requires('RoomData')
            .attr({
                id: map.locations.length,
                Type: "Hallway",
                numRoomsToConnect: 4,
                connectionType: ['Hallway', 'Hallway', 'Dining', 'Kitchen', 'Living', 'Bed_Large', 'Bed_Small', 'Bath_Large', 'Study']
            })
    }
});

Crafty.c("Living", {
    init: function() {
        this.requires('RoomData')
            .attr({
                id: map.locations.length,
                Type: "Living",
                numRoomsToConnect: 3,
                connectionType: ['Dining', 'Living', 'Hallway', 'Hallway']
            })
    }
});

Crafty.c("Dining", {
    init: function() {
        this.requires('RoomData')
            .attr({
                id: map.locations.length,
                Type: "Dining",
                numRoomsToConnect: 2,
                connectionType: ['Kitchen', 'Dining', 'Hallway', 'Hallway']

            })
    }
});

Crafty.c("Kitchen", {
    init: function() {
        this.requires('RoomData')
            .attr({
                id: map.locations.length,
                Type: "Kitchen",
                numRoomsToConnect: 1,
                connectionType: ["Kitchen"]
            })
    }
});

Crafty.c("Study", {
    init: function() {
        this.requires('RoomData')
            .attr({
                id: map.locations.length,
                Type: "Study",
                numRoomsToConnect: 1,
                connectionType: ['Study', 'Hallway']
            })
    }
});

Crafty.c("Bed_Large", {
    init: function() {
        this.requires('RoomData')
            .attr({
                id: map.locations.length,
                Type: "Bed_Large",
                numRoomsToConnect: 2,
                connectionType: ['Bed_Large', 'Bath_Large']
            })
    }
});

Crafty.c("Bath_Large", {
    init: function() {
        this.requires('RoomData')
            .attr({
                id: map.locations.length,
                Type: "Bath_Large",
                numRoomsToConnect: 1,
                connectionType: ["Bath_Large"]

            })
    }
});

Crafty.c("Bed_Small", {
    init: function() {
        this.requires('RoomData')
            .attr({
                id: map.locations.length,
                Type: "Bed_Small",
                numRoomsToConnect: 1,
                connectionType: []
            })
    }
});