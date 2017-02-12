map = {
    generate: function() {
        // Individual segments that may be a room or part of a room
        // eg. two adjacent locations without a dividing wall make up
        // a tall room. Three connected length-wise make a hallway. 
        // These are RoomData instances.   
        this.locations = [];

        // (x, y) => room (NOT room data)
        this.roomPositions = {};

        // 5x5 mansion
        this.width = 5;
        this.height = 5;

        this.generateAsymmetricalMansion();
        this.createRoomEntities();
    },

    setRoomAt: function(x, y, room) {
        var key = x + ", " + y;
        this.roomPositions[key] = room;
    },

    getRoomAt: function(x, y) {
        var key = x + ", " + y;
        return this.roomPositions[key];
    },
	
	findRoomWith: function(e) {
		var x = Math.floor(e.x / parseInt(config("roomWidth")));
		var y = Math.floor(e.y / parseInt(config("roomHeight")));
		return map.getRoomAt(x, y);
	},

    generateSymmetricalMansion: function() {
        var roomsWide = this.width;
        var roomsHigh = this.height;

        // generate a roomsHigh x roomsHigh mansion
        // any room randomly on the top or bottom can be the entrance
        var isTop = randomBetween(0, 100) < 50;
        var entranceRoomX = parseInt(Math.floor(roomsWide / 2));
        var entranceRoomY = isTop ? 0 : roomsHigh - 1;
        
        var roomWidth = config("roomWidth");
        var roomHeight = config("roomHeight");

        // Create a bunch of hallways. 
        for (var roomY = 0; roomY < roomsHigh; roomY++) {
            for (var roomX = 0; roomX < roomsWide; roomX++) {
                var room = Crafty.e("Hallway");
                room.x = roomX;
                room.y = roomY;
                this.locations.push(room);
            }
        }

        // Set up connections and randomly pick types. There's no easy way to do
        // this that guarantees everything is connected (all rooms are reachable),
        // while maintaining requirements of which room can connect to which.
        // We may end up changing a room type a few times, and connecting to a few
        // more things than we should; that's okay. Right?

        for (var roomY = 0; roomY < roomsHigh; roomY++) {
            for (var roomX = 0; roomX < roomsWide; roomX++) {
                var room = this.locations[roomY * roomsWide + roomX];
                var type = room.Type;
                for (var i = 0; i < room.numRoomsToConnect - room.numConnections(); i++) {
                    var connectingRoomType = room.connectionType[randomBetween(0, room.connectionType.length)];
                    var directions = room.unconnectedDirections();
                    var direction = directions[randomBetween(0, directions.length)];
                    var x = room.x;
                    var y = room.y;
                    switch (direction) {
                        case "North":
                            y -= 1;
                            break;
                        case "South":
                            y += 1;
                            break;
                        case "East":
                            x += 1;
                            break;
                        case "West":
                            x -= 1;
                            break;
                    }
                    var target = map.locations[y * map.width + x];
                    target.Type = connectingRoomType;
                    var targetIndex = this.locations.indexOf(target);
                    room.connect(targetIndex, direction);
                }
            }
        }

        // Iterate and finally set direction data. This is to guarantee consistent two-way doors.
        // If we call this before all the rooms are connected, someone may onnect to us and thus
        // cause a one-way connection.
        for (var i = 0; i < this.locations.length; i++) {
            this.locations[i].setDirectionData();
        }
    },

    generateAsymmetricalMansion: function() {
        var newRoom = Crafty.e("Entrance");
        newRoom.at(0, 0);
        this.locations.push(newRoom);

        //Move though Locations list, generating/Attaching rooms until EoList or 100 rooms processed.
        for (var roomIndex = 0; roomIndex < this.locations.length && roomIndex < 50; roomIndex++) {
            var attempts = 0;
            var currentRoom = this.locations[roomIndex];

            while (currentRoom.numRoomsToConnect > 0 && attempts < 5) {
                //Attempt to select a direction not already linked
                var free = 1;
                while (free != undefined) {
                    var direction = Math.floor(Math.random() * 4);
                    switch (direction) {
                        case 0:
                            free = currentRoom.N;
                            break;
                        case 1:
                            free = currentRoom.S;
                            break;
                        case 2:
                            free = currentRoom.E;
                            break;
                        case 3:
                            free = currentRoom.W;
                            break;
                    }
                }

                //Good direction selected. Start generating new room
                //ID = array index
                var newRoomId = this.locations.length;
                //Select room type from potential connectable array of room object
                var roomTypeSelect = randomBetween(0, currentRoom.connectionType.length);
                var roomType = currentRoom.connectionType[randomBetween(0, roomTypeSelect)];

                //Setup parameters for room placement functions
                var dir = "";
                var x = currentRoom.x;
                var y = currentRoom.y;
                switch (direction) {
                    case 0:
                        y -= 1;
                        dir = "South";
                        break;
                    case 1:
                        y += 1;
                        dir = "North";
                        break;
                    case 2:
                        x += 1;
                        dir = "West";
                        break;
                    case 3:
                        x -= 1;
                        dir = "East";
                        break;
                }

                //Prevent rooms being placed north of Entrance.
                //Entrance should be placed on edge of building, this prevents rooms wrapping around all sides.
                if (x < 0 || y < 0) {
                    attempts += 1;
                    continue;
                }

                //New room spawn
                var newRoom = Crafty.e(roomType)

                //Place room and test if location not yet occupied
                var doesRoomExist = newRoom.at(x, y)

                //If X-Y position already occupied, ID of conflicting room returned
                //If ID returned != ID expected, room not placed. Attempt connection to existing room instead
                if (doesRoomExist == newRoomId) {
                    this.locations.push(newRoom);
                } else {
                    attempts += 1;
                    newRoom.destroy; //Room can not be placed. Purge
                    newRoomId = doesRoomExist; //Use ID of already placed room, attempt to make connection if possible.
                }
                //Create connection with neighbouring room (New or old).
                if (this.locations[newRoomId].canConnect(roomIndex, dir) == true)
                {
                    this.locations[newRoomId].connect(roomIndex, dir);
                }
            }
            //Set connection strings	
            currentRoom.setDirectionData();
        }
    },

    createRoomEntities: function() {
        var roomWidth = config("roomWidth");
        var roomHeight = config("roomHeight");

        for (var roomIndex = 0; roomIndex < this.locations.length; roomIndex++) {
            var currentRoom = this.locations[roomIndex];

            var newRoom = Crafty.e("Room")
                .create(currentRoom.x * roomWidth, currentRoom.y * roomHeight, roomWidth, roomHeight)
                .setupWalls(currentRoom.openDirections, currentRoom.wallDirections, currentRoom.doorDirections);
            
            newRoom.data = currentRoom;
            currentRoom.entity = newRoom;
            this.setRoomAt(currentRoom.x, currentRoom.y, newRoom);
        }

        console.log("Created " + this.locations.length + " rooms.");
    }
}