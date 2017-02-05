map = {
    generate: function() {
        // Individual segments that may be a room or part of a room
        // eg. two adjacent locations without a dividing wall make up
        // a tall room. Three connected length-wise make a hallway.    
        this.locations = [];

        // (x, y) => room
        this.roomPositions = {};

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
                            free = currentRoom.N
                            break;
                        case 1:
                            free = currentRoom.S
                            break;
                        case 2:
                            free = currentRoom.E
                            break;
                        case 3:
                            free = currentRoom.W
                            break;
                    }
                }

                //Good direction selected. Start generating new room
                //ID = array index
                var newRoomId = this.locations.length;
                //Select room type from potential connectable array of room object
                var roomTypeSelect = Math.floor(Math.random() * currentRoom.connectionType.length);
                var roomType = currentRoom.connectionType[Math.round(Math.random() * roomTypeSelect)];

                //Setup parameters for room placement functions
                var dir = 0;
                var x = 0;
                var y = 0;
                switch (direction) {
                    case 0:
                        x = currentRoom.x;
                        y = currentRoom.y - 1;
                        dir = "North";
                        break;
                    case 1:
                        x = currentRoom.x;
                        y = currentRoom.y + 1;
                        dir = "South";
                        break;
                    case 2:
                        x = currentRoom.x + 1;
                        y = currentRoom.y;
                        dir = "East";
                        break;
                    case 3:
                        x = currentRoom.x - 1;
                        y = currentRoom.y;
                        dir = "West";
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

    setRoomAt: function(x, y, room)
    {
        var key = x + ", " + y;
        this.roomPositions[key] = room;
    },

    getRoomAt: function(x, y)
    {
        var key = x + ", " + y;
        return this.roomPositions[key];
    }
}