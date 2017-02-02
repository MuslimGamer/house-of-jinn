map = {
    // Individual segments that may be a room or part of a room
    // eg. two adjacent locations without a dividing wall make up
    // a tall room. Three connected length-wise make a hallway.
    locations: [],
    generate: function() {

        var newRoom = Crafty.e("Entrance");
        newRoom.at(0, 0);
        this.locations.push(newRoom);

        //Move though Locations list, generating/Attaching rooms until EoList or 100 rooms processed.
        for (var gen = 0; gen < this.locations.length && gen < 50; gen++) {
            var attempts = 0;
            while (this.locations[gen].numRoomsToConnect && attempts < 5) {
                //Attempt to select a direction not already linked
                var free = 1;
                while (free != undefined) {
                    var dirselect = Math.floor(Math.random() * 4);
                    switch (dirselect) {
                        case 0:
                            free = this.locations[gen].N
                            break;
                        case 1:
                            free = this.locations[gen].S
                            break;
                        case 2:
                            free = this.locations[gen].E
                            break;
                        case 3:
                            free = this.locations[gen].W
                            break;
                    }
                }

                //Good direction selected. Start generating new room
                //ID = array index
                var newRoomId = this.locations.length;
                //Select room type from potential child-rooms array of room object
                var roomTypeSelect = Math.floor(Math.random() * this.locations[gen].connectionType.length);
                var roomType = this.locations[gen].connectionType[Math.round(Math.random() * roomTypeSelect)];

                //Setup parameters for room placement functions
                var dir = 0;
                var x = 0;
                var y = 0;
                switch (dirselect) {
                    case 0:
                        x = this.locations[gen].x;
                        y = this.locations[gen].y - 1;
                        dir = "North";
                        break;
                    case 1:
                        x = this.locations[gen].x;
                        y = this.locations[gen].y + 1;
                        dir = "South";
                        break;
                    case 2:
                        x = this.locations[gen].x + 1;
                        y = this.locations[gen].y;
                        dir = "East";
                        break;
                    case 3:
                        x = this.locations[gen].x - 1;
                        y = this.locations[gen].y;
                        dir = "West";
                        break;
                }

                //Prevent rooms being placed north of Entrance.
                //Entrance should be placed on edge of building, this prevents rooms wrapping around all sides.
                if (y < 0) {
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
                this.locations[newRoomId].canConnect(gen, dir); //Test if rooms compadible for connection. Form connection if pass.
            }
            //Set connection strings	
            this.locations[gen].gen_strings();
        }
    }
}