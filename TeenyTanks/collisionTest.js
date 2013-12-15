var loopInterval;
var fps = 25;
var ctx;
var canvas;

var level = [
	"WWWWWWWWWWWWWWWW",
	"WOOOOOEOOEOOOOOW",
	"WWEWWOWWWWOWWEWW",
	"WOOOOOEOOEOOOOOW",
	"WWOWWOWOOWOWWEWW",
	"WWOWWOWOOWOWWOWW",
	"OOOOOOEOOEOOOOOW",
	"WWEWWOWWWWOWWEWW",
	"WOOOOOEOOEOOOOOW",
	"WWWWWWWWWWWWWWWW",]

function Wall(x,y){
	this.x = x;
	this.y = y;
	this.colour = "black";
	this.width = 32;
	this.height = 32;
}
function Enemy(x,y){
	this.x = x;
	this.y = y;
	this.tarX = 0;
	this.tarY = 0;
	this.lastX ;
	this.lastY ;
	this.dx;
	this.dy;
	this.colour = rgb(rand(0,255),rand(0,255),rand(0,255));
	this.speed = 2;
	this.width = 32;
	this.height = 32;
}
function Path(){
	this.x = x;
	this.y = y;
	this.colour = "white";
	this.width = 32;
	this.height = 32;
}

var enemies = [];
var walls = [];
var paths = [];

$(function(){ 
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');

	//# Loop through 'level' and store objects
	x = 0, y = 0;
	for (row = 0; row < level.length; row++ ){
		substring = level[row].split('');
		for (col = 0; col < level[row].length; col++){

			if (substring[col] =='W'){ //32x32 WALL
				w = new Wall(x, y);
				walls.push(w);
			}
			if (substring[col] =='E'){ //Create Enemy
				e = new Enemy(x, y);
				enemies.push(e);	
			}
			if (substring[col] =='O'){ // PathPoint/Destinations
				p = new Path(x, y);
				paths.push(p);	
			}
			x += 32;
		}
		y += 32;
		x = 0;
	}

	loopInterval = setInterval(gameLoop, 1000 / fps);
});

function rand(min, max){
	ran = Math.floor((Math.random() * max) + min);
	return ran;
}

function rgb(r,g,b) {
    return 'rgb(' + [(r||0),(g||0),(b||0)].join(',') + ')';
}

function gameLoop(){
	clear();
	moveEnemies();
	draw();
}

function clear(){
	ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
}

function moveEnemies(){

	function nextPath(x,y,dx,dy){
		this.x = x;
		this.y = y;

		//# Directions the enemy will be facing to get there
		this.dx = dx;
		this.dy = dy;

		this.height = 32;	
		this.width = 32;
	}

	$.each(enemies, function(en, vale){
		e = enemies[en];
		pathsInSight = [];
		viablepaths = [];

		//Run if just created or reached destination
		if ((e.x == e.tarX && e.tarY == e.y) || (e.tarX == 0 && e.tarY == 0))
		{
			
			$.each(paths, function(pa, valp){ //Populate viable routes
				p = paths[pa];
				dx = 0;
				dy = 0;
				// Decide if enemy needs to move in X or Y
				if ((p.x == e.x)){

					if (e.y < p.y){
						dy = 1;
						rot = 180;
					} else {
						dy = -1;
						rot = 0;
					}
					next = new nextPath(p.x,p.y,0,dy)
					pathsInSight.push(next);

				} else if ((p.y == e.y)){

					if (e.x < p.x){
						dx = 1;
						rot = 90;
					} else {
						dx = -1;
						rot = 270;
					}
					next = new nextPath(p.x,p.y,dx,0,rot)
					pathsInSight.push(next);

				}
			});

			//#Check for viable paths
			$.each(pathsInSight, function(pis,val){
				destination = pathsInSight[pis];
				currentLocation = new nextPath(e.x,e.y,destination.dx,destination.dy)

				freeToMove = false;
				keepLooping = true;

				while (!(destination.x == currentLocation.x 
					&& destination.y == currentLocation.y) 
					&& keepLooping){

					currentLocation.x += 32 * currentLocation.dx;
					currentLocation.y += 32 * currentLocation.dy;

					// Check if current location is the same as a wall
					$.each(walls, function(w, val){
						wall = walls[w];

						if (wall.x == currentLocation.x 
							&& wall.y == currentLocation.y){
							freeToMove = false;
							keepLooping = false;
						}
					});

					// Next, check if reached destination safely
					if (destination.x == currentLocation.x 
						&& destination.y == currentLocation.y){
						freeToMove = true;
						keepLooping = false;
					}
				} 
		
				if (freeToMove){ 
					viablepaths.push(destination);
				}
			});

			//# Pick a random item with same X/Y and set enemies pathing
			pick = rand(0,viablepaths.length); //Choose a random item from array
			destination = viablepaths[pick];	
			e.tarX = destination.x; //Assign a new destination
			e.tarY = destination.y;
			
			e.dx = destination.dx;
			e.dy = destination.dy;

			e.lastX = e.tarX;
			e.lastY = e.tarY;

			e.rot = newPath.rot;

			e.x += e.dx * e.speed; 
			e.y += e.dy * e.speed; 
		
		} else {
			e.x += e.dx * e.speed; 
			e.y += e.dy * e.speed; 
		}
		enemies[en] = e;
	});

}

function draw(){

	$.each(walls, function(w, val){
	 	wall = walls[w];
		ctx.fillStyle = wall.colour;
		ctx.fillRect(wall.x,wall.y,wall.width,wall.height);
	});

	ctx.globalAlpha = 0.75;
	$.each(paths, function(p, val){
	 	path = paths[p];
		ctx.fillStyle = path.colour;
		ctx.fillRect(path.x,path.y,path.width,path.height);
	});
	ctx.globalAlpha = 1;

	$.each(enemies, function(e, val){
	 	enemy = enemies[e];
		ctx.fillStyle = enemy.colour;
		ctx.fillRect(enemy.x,enemy.y,enemy.width,enemy.height);
	});
}