Crafty.c("proto_room",{
	//Room identifier
	id:0,						//Unique ID code, references index of locations array
	x:0,						//Virtual X-Y position for spacial cohesion of generated rooms. 
	y:0,
	//Connecting IDs
	N:undefined,
	S:undefined,
	E:undefined,
	W:undefined,
	
	OpenString:'',
	DoorString:'',
    WallString:'',
	//Room attributes
	Type:0,						//Identification string for room type subclass
	//Room generation attributes
	Furniture:[],
	Connection_type:[],			//Types of rooms this room node can parent. Type can be repeated to increase probability of spawning
	Connection_max:0,			//How many connections this node can support
	
	init: function(){
	},
		
    at: function(x,y){			//Assign X-Y position of room, check area is free. Return conflicting room ID if fails.

    	for(var scan = 0;scan< map.locations.length;scan++){
    		if (map.locations[scan].x==x&&map.locations[scan].y==y){    			
    			return map.locations[scan].id;	//Location already in use. Return ID of conflicting room 
    		}
    	}
    	//Location is free. Officially assign X-Y position to this room and return success.
    		this.x = x;
    		this.y = y;
    		return this.id;
    },
	
	connect: function(Room_id, dir)
	{
		this.Connection_max-=1;
		map.locations[Room_id].Connection_max-=1;
		switch(dir){
		case "North": //Room is placed to the north of parent
			this.S = Room_id
			map.locations[Room_id].N = this.id
			break;
		case "South": //Room is placed to the south of the parent
			this.N = Room_id
			map.locations[Room_id].S = this.id
			break;
		case "East":
			this.W = Room_id
			map.locations[Room_id].E = this.id
			break;
		case "West":
			this.E = Room_id
			map.locations[Room_id].W = this.id
		}
	},
    
    //Test if proposed connection is permitted (Rooms allowed more doors, room types compatible for linking).
    connect_test: function(Room_id, dir)
    {
    	if(this.Connection_max == 0 || map.locations[Room_id].Connection_max == 0){return 0;}
    	
    	
    	if (map.locations[Room_id].Connection_type.indexOf(this.Type) >= 0){
    		this.connect(Room_id,dir);
    		return 1;
    	}
    },
    
    gen_strings: function(){
    	if(this.N==undefined){this.WallString+='n';}
    	else{
    		if(this.Type == map.locations[this.N].Type){this.OpenString+='n';}
    		else{this.DoorString+='n';}
    	}
    	if(this.S==undefined){this.WallString+='s';}
    	else{
    		if(this.Type == map.locations[this.S].Type){this.OpenString+='s';}
    		else{this.DoorString+='s';}
    	}
    	if(this.E==undefined){this.WallString+='e';}
    	else{
    		if(this.Type == map.locations[this.E].Type){this.OpenString+='e';}
    		else{this.DoorString+='e';}
    	}
    	if(this.W==undefined){this.WallString+='w';}
    	else{
    		if(this.Type == map.locations[this.W].Type){this.OpenString+='w';}
    		else{this.DoorString+='w';}
    	}
    }
});


Crafty.c("Enterance",{
	init: function(){
		this.requires('proto_room')
		.attr({
			id: map.locations.length,
			Type:"Enterance",
			Connection_max: 3,
			Connection_type:['Dining','Living','Hallway','Hallway','Hallway','Study']
			
		})
	}
});

Crafty.c("Hallway",{
	init: function(){
		this.requires('proto_room')
		.attr({
			id: map.locations.length,
			Type:"Hallway",
			Connection_max:4,
			Connection_type:['Hallway','Hallway','Dining','Kitchen','Living','Bed_Large','Bed_Small','Bath_Large','Study']
		})
	}
});

Crafty.c("Living",{
	init: function(){
		this.requires('proto_room')
		.attr({
			id: map.locations.length,
			Type:"Living",
			Connection_max: 3,
			Connection_type:['Dining','Living','Hallway','Hallway']
		})
	}
});

Crafty.c("Dining",{
	init: function(){
		this.requires('proto_room')
		.attr({
			id: map.locations.length,
			Type:"Dining",
			Connection_max: 2,
			Connection_type:['Kitchen','Dining','Hallway','Hallway']

		})
	}
});

Crafty.c("Kitchen",{
	init: function(){
		this.requires('proto_room')
		.attr({
			id: map.locations.length,
			Type:"Kitchen",
			Connection_max: 1,
			Connection_type:["Kitchen"]
		})
	}
});

Crafty.c("Study",{
	init: function(){
		this.requires('proto_room')
		.attr({
			id: map.locations.length,
			Type:"Study",
			Connection_max: 1,
			Connection_type:['Study','Hallway']
		})
	}
});

Crafty.c("Bed_Large",{
	init: function(){
		this.requires('proto_room')
		.attr({
			id: map.locations.length,
			Type:"Bed_Large",
			Connection_max: 2,
			Connection_type:['Bed_Large','Bath_Large']
		})
	}
});

Crafty.c("Bath_Large",{
	init: function(){
		this.requires('proto_room')
		.attr({
			id: map.locations.length,
			Type:"Bath_Large",
			Connection_max: 1,
			Connection_type:["Bath_Large"]
			
		})
	}
});

Crafty.c("Bed_Small",{
	init: function(){
		this.requires('proto_room')
		.attr({
			id: map.locations.length,
			Type:"Bed_Small",
			Connection_max: 1,
			Connection_type:[]
		})
	}
});



