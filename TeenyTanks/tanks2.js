// JavaScript Document
var ctx;
var canvas;
var boxWidth; //eg 600
var boxHeight; //400
var bg = new Image();
var crater = new Image();
var tankImage = new Image();
var wallImage = new Image();
var platform = new Image();
var wallDamaged = new Image();
var missileWep = new Image();
var laserWep = new Image();
var sniperWep = new Image();
var flameWep = new Image();
var healthPow = new Image();
var buffPow = new Image();
var armourPow = new Image();
var energyPow = new Image();
var enemyImage = new Image();
var bMissile = new Image();
var bLaser = new Image();
var bFlame = new Image();
var bSniper = new Image();
var mask = new Image(); //ALPHA TRANSPARENCY MASK
var aLaser ;
var aMissile; 
var aSniper; 
var aMove; 
var aWallHit; 
var aMissileShell;
var aSplash;
var aMorning;
var aSelect;
var aEquip;
var menuSound;//need to add audio/music
var fps = 25;
var intervalID; //Game loop var
var status = ""; //DEBUG--- 
var blockSize = 32; //SIZE OF EACH ENTITY
var hurt; // counter for hurt method
var missileID;
var enemySpawnID;
var blocksX = 25;
var blocksY = 20;
var MAX_ENERGY = 100;
var MAX_ARMOUR = 100;
var animationFrames = [0,1,2,3,4,5,6];
var frameIndex = 0;
var wallOn = false; //SWITCH to turn Collision visible
var missileRe, laserRe, flameRe, snipeRe; //Weapon RELOAD
var healthRe, armourRe, energyRe, buffRe, debuffRE; //Powerup RELOAD
var menuID;
var showMessage = "";
var showTimer;
var currentDay = 1; //start on day 1
var currentNight = 0;
var dayTimer = 0;
var nightTimer = 0;
var currentTime = "DAY";
var gamestate = "MENU"; //PAUSE, MENU, INFO
var visibility = 70;
var menuIndex = 0;
var highScore = 0;
var canSpawn = true;

//Bullet Object
function Bullet (x,y, dx, dy, power, speed, colour, rof) {
	this.colour = colour;
	this.x = x + (player.width /2) + (player.dx * player.speed);
	this.y = y + (player.height /2) + (player.dy * player.speed);
	this.dx = dx;
	this.dy = dy;
	this.speed = speed;
	this.radius = 3;
	this.life = checkLife(player.weapon);
	this.height = this.radius;
	this.width = this.radius;
	this.hitTarget = false;
	this.power = power;
	this.snipe = false;
	this.laser = false;
	this.flame = false;
	this.missile = false;
	this.onWater = false;
	this.rot = 0;
	this.image;
}

function Player(name, x, y) {
	this.name = name;
	this.colour = "yellow";
	this.width = blockSize - 6;
	this.height = blockSize - 6;
	this.x = x ;
	this.y = y ;
	this.dx = 0;
	this.dy = 0;
	this.baseSpeed = 2;
	this.speed = this.baseSpeed;
	this.life = 100;
	this.won = false
	this.energy = MAX_ENERGY;
	this.canFire = true; //allow fire true
	this.armour = 100;
	this.collided = false;
	this.dead = false;
	this.weapon = "sniper"; //starting off weapon
	this.buffed = false;
	this.hurt = false;
	this.score = 0;
	this.moving = false;
	this.rot = 0;
	this.left = false;
	this.right = false;
	this.up = false;
	this.down = false;
	this.pause = false;
	this.killed = 0;
}

function Enemy ( name, x, y) { 
	this.name = name;
	this.colour = rgb(100,200,(rand(0,255)));
	this.width =  blockSize - 4;
	this.height = blockSize - 4;
	this.x = x ;
	this.y = y ;
	this.tarX = 0;
	this.tarY = 0;
	this.lastX = 0;
	this.lastY = 0;
	this.dx = 0;
	this.dy = 0;
	this.speed = rand(1,2);
	this.life = 100;
	this.spawnID = rand(0,9999);
	this.rot = 0;
	this.temprot = 0; //save temp rotation
	
}

function Wall (x, y){
	this.x = x;
	this.y = y;
	this.width = blockSize;
	this.height = blockSize;
	this.colour = "white";
	this.damaged = false;
	this.water = false;
	this.side = false;
	this.blocking = false;
}

function Crater (x,y){
	this.x = x;
	this.y = y;
	this.life = 40 + rand(5,20); //Create random spans for each
	this.height = 20;
	this.width = 20;
	this.rot = rand(0, 360);
	}

//ACCEPTABLE TYPES: HEALTH, ARMOUR, ENERGY, POWER
function PowerUp(type, colour, x, y){
	this.type = type;
	this.x = x;
	this.y = y;
	this.powx = x + 4; //WEP SPAWN LOC
	this.powy = y + 4; //WEP SPAWN LOC
	this.width = blockSize;
	this.height = blockSize;
	this.powwidth = this.width - 8; //PLATFORM
	this.powheight = this.height - 8; //PLATFORM
	this.colour = colour; //CHANGE FOR IMAGE LATER
	this.spawned = true;
	this.rot = 0;
}

//WEAPON BLOCK
function Weapon(type, colour, x, y){
	this.type = type;
	this.x = x; //PLATFORM POS
	this.y = y; //PLATFORM POS
	this.wepx = x + 4; //WEP SPAWN LOC
	this.wepy = y + 4; //WEP SPAWN LOC
	this.width = blockSize; //PLATFORM
	this.height = blockSize; //PLATFORM
	this.wepwidth = this.width -8; //PLATFORM
	this.wepheight = this.height -8 ; //PLATFORM
	this.colour = colour;
	this.spawned = true;
	this.rot = 0;
}

//SPAWN POINTS; NEED TO BE CLEAR TO SPAWN
function SpawnPoint(x,y,free,spawnID){
	this.x = x;
	this.y = y;
	this.free = free;
	this.spawnID = spawnID; //Used to Link Enemy/Spawn Point
	this.night = false;
	//*^^ Need to add validation for no double entries ^^*//
}

function Pixel(x,y){
	this.x = x;
	this.y = y;
	this.visible = false;
	this.colour = "black";
	this.height = 32;
	this.width = 32;
}

function Path(x,y){
	this.x = x;
	this.y = y;
	this.colour = "black";
	this.height = 32;
	this.width = 32;
}

var level = [						//X = Night Spawns
	"*************************",	//7 = LEFT SIDE
	"7O  H     WW        WN  9",	//* = 32x32 WALL
	"7  SW  O  X   O  O   E O9",	//9 = RIGHT SIDE
	"7 WWWWW   1223  W  1223 9",	//W = WALL
	"7O    O  O4556  W  4556 9",	//5 = FULL WATER
	"7 123WO  O4556  W  4556 9",	//6 = RIGHT WATER
	"7 456W    088=  W  4556 9",	//4 = LEFT WATER
	"7 456OE  O    OWW  4556 9",	//2 = BOTTOM WATER
	"7 456       P      088= 9",	//8 = TOP WATER
	"7 08=O     O  O  OO    O9",	//1 = LEFT CORNER
	"7O    O1223 W1223   WF  9",	//3 = RIGHT CORNER
	"7  W   4556  4556  WWW  9", 	//0 = BOTTOM LEFT
	"7  WWW 4556 O4556       9",	//P = Player
	"7L W  E088=W 088=  1223E9",	//E = Enemy/Spawnpoint
	"7  W  O   X        4556O9",	//F = FLANETHROWER
	"7O  E O E  AOO O O 4556 9",	//M = MISSILE
	"7OO1222222223      088= 9",	//L = LASER
	"7  4555555556O OWW      9",	//S = SNIPER
	"7  088888888=   MWO  OB 9",	//REST = BUFFS
	"*************************",]	// EACH CHAR = 32x32
	// EACH CHAR = 32x32

	// var level = [						//X = Night Spawns
	// "*************************",	//7 = LEFT SIDE
	// "7O  H  O  WW      O WN  9",	//* = 32x32 WALL
	// "7  SW  O   O  O  O     O9",	//9 = RIGHT SIDE
	// "7 WWWWW   1223  W  1223 9",	//W = WALL
	// "7O    O  O4556  W  4556 9",	//5 = FULL WATER
	// "7 123WO  O4WW   W  4556 9",	//6 = RIGHT WATER
	// "7 456W    WOWWWWWW 4556 9",	//4 = LEFT WATER
	// "7 456O   O OWOOOWW 4556 9",	//2 = BOTTOM WATER
	// "7 456      OWOW W  088= 9",	//8 = TOP WATER
	// "7 08=O  O  OW WOWOO    O9",	//1 = LEFT CORNER
	// "7O    O1223OW0WOW   WF  9",	//3 = RIGHT CORNER
	// "7  W   4556OW0WOW  WWW  9", 	//0 = BOTTOM LEFT
	// "7  WWW 4556OW WOW   P   9",	//P = Player
	// "7L W   088=OW0WOW  1223 9",	//E = Enemy/Spawnpoint
	// "7  W  O    OWOWOW  4556O9",	//F = FLANETHROWER
	// "7O    O    OW WW O 4556 9",	//M = MISSILE
	// "7OOOOOOOOOOOW0WOOOOOOOOO9",	//L = LASER
	// "7WWWWWWWWWWWW0WWWWWWWWWW9",	//S = SNIPER
	// "7  O     OO  EOO   OO   9",	//REST = BUFFS
	// "*************************",]	// EACH CHAR = 32x32


var KEY = {
	W: 87,
	S: 83,
	D: 68,
	A: 65,
	F: 70,
	G: 71,
	LEFT: 37,
	UP: 38,
	RIGHT: 39,
	DOWN: 40,
	SHIFT: 16,
	ENTER: 13,
	SPACE: 32,
	ESCAPE: 27,
}

var bullets = [];
var friendlyBullets = []; //NEED TO IMPLEMENT FOR MULT PLAYERS/AI
var enemies = []; 
var craters = [];
var walls = [];
var names = ["George", "Harry", "Frank", "Bill", "Fred", "Dennis","Dave","Monty","Homer","Steven"]; //Enemy Names
var players = []; //NEED TO OPEN UP MULTIPLAYER
var powerups = [];
var spawnpoints = [];
var pressedKeys = [];
var weapons = [];
var pixels = []; //CHECK FOG OF WAR
var paths = [];

//Automatically called function once page is loaded
$(function(){ 
	//get the canvas which is the drawing area on the web page. it is a container
	canvas = document.getElementById('canvas');
	//get the 2d drawing context for the canvas
	ctx = canvas.getContext('2d');

	//Assign images src
	boxWidth = ctx.canvas.width;
	boxHeight = ctx.canvas.height;
	bg.src = "images/bg.png";
	crater.src = "images/crater.png";
	wallImage.src = "images/wall.png";
	platform.src = "images/platform.png";
	wallDamaged.src = "images/damagedwall.png";
	mask.src = "images/mask.png";
	missileWep.src = "images/missile_wep.png";
	flameWep.src = "images/flame_wep.png";
	laserWep.src = "images/laser_wep.png";
	sniperWep.src = "images/sniper_wep.png";
	healthPow.src = "images/health_pow.png";
	buffPow.src = "images/buff_pow.png";
	energyPow.src = "images/energy_pow.png";
	armourPow.src = "images/armour_pow.png";
	tankImage.src = "images/player.png";
	enemyImage.src = "images/enemy.png";

	//Assign audio src
	aLaser = new Audio("sounds/laser.mp3")
	aMissile = new Audio("sounds/missile.mp3");
	aSniper = new Audio("sounds/sniper.mp3");
	aMove = new Audio("sounds/tank_move.mp3");
	aWallHit = new Audio("sounds/missile_wall.mp3");
	aMissileShell = new Audio("sounds/missile_shell.mp3");
	aSplash = new Audio("sounds/water.mp3");
	aMorning = new Audio("sounds/wakeup.mp3");
	aSelect = new Audio("sounds/select.mp3");
	aEquip = new Audio("sounds/equip.mp3");
	aMusic = new Audio("sounds/music.mp3");
	aMusic.volume = 0.15;

	// //# Loop the background music
	// aMusic.addEventListener('ended', function() {
 //    	this.currentTime = 0;
 //    	this.play();
	// }, false);
	// aMusic.play();

	//Attempt to gather and store previous High Scores
	if(typeof(localStorage)!="undefined"){
		try{
			highScore = localStorage.getItem("highScore");
			if(highScore == null)
				highScore = 0;
		}catch(e){
		}
	}else{
		alert("Does not support local storage");
	}

	//Set and create level arrays
	createLevel();

	//menuID = setInterval(menuLoop,1000/1); 
	intervalID = setInterval(gameLoop,1000/fps); 
	//setInterval will attempt to run the code every X milliseconds.

	$(document).keydown(function(e){
		pressedKeys[e.which] = true;
	});
	$(document).keyup(function(e){
		pressedKeys[e.which] = false;
	});	

	$("#canvas").attr("contentEditable", "true")
	$("#canvas")[0].contentEditable = true;				
});

function createLevel(){
	x = 0, y = 0;
	for (row = 0; row < level.length; row++ ){
		substring = level[row].split('');
		for (col = 0; col < level[row].length; col++){
			//##### SIDE COLLISIONS#######//
			//#####
			if (substring[col] == '*' ){ //side
				w = new Wall(x, y);
				w.side = true;
				walls.push(w);
			}
			if (substring[col] ==7){ //side ||>>
				w = new Wall(x, y);
				w.side = true;
				w.width -= w.width /2;
				walls.push(w);
			}
			if (substring[col] ==9){ //side <<|| 
				w = new Wall(x, y);
				w.side = true;
				w.x += w.width /2;
				walls.push(w);
			}
			//#####
			//##### SIDE COLLISIONS#######//


			//##### WATER COLLISIONS#######//
			//#####
			if (substring[col] ==5){ //water
				w = new Wall(x, y);
				w.water = true;
				walls.push(w);
			}
			if (substring[col] == 8){ // --
				w = new Wall(x, y);
				w.y -= w.height /2;
				w.water = true;
				walls.push(w);
			}
			if (substring[col] == 4){ // <<|
				w = new Wall(x, y);
				w.x += w.width /2;
				w.water = true;
				walls.push(w);
			}
			if (substring[col] == 6){ // |>>
				w = new Wall(x, y);
				w.width -= w.width /2;
				w.water = true;
				walls.push(w);
			}
			if (substring[col] == 2){ // ^^
				w = new Wall(x, y);
				w.y += w.height /2;
				w.water = true;
				walls.push(w);
			}
			if (substring[col] == 1){ // TOP LEFT
				w = new Wall(x, y);
				w.x += blockSize /2;
				w.y += blockSize /2;
				w.width -= blockSize/2;
				w.height -= blockSize/2;
				w.water = true;
				walls.push(w);
			}
			if (substring[col] == 3){ //  TOP RIGHT
				w = new Wall(x, y);
				w.y += blockSize /2;
				w.width -= blockSize/2;
				w.height -= blockSize/2;
				w.water = true;
				walls.push(w);
			}
			if (substring[col] == '0'){ // BOTTOM LEFT>
				w = new Wall(x, y);
				w.x += blockSize /2;
				w.width -= blockSize/2;
				w.height -= blockSize/2;
				w.water = true;
				walls.push(w);
			}
			if (substring[col] == '='){ // BOTTOM RIGHT
				w = new Wall(x, y);
				w.width -= w.width /2;
				w.height -= w.height /2;
				w.water = true;
				walls.push(w);
			}
			//#####
			//##### WATER COLLISIONS#######//
			

			if (substring[col] =='W'){ //32x32 WALL
				w = new Wall(x, y);
				walls.push(w);
			}
			if (substring[col] =='E'){ //Create Enemy/SpawnPoint.free = false
				e = new Enemy(names[rand(0,names.length )],x, y);
				s = new SpawnPoint(x,y,false, e.spawnID);
				enemies.push(e);	
				spawnpoints.push(s);	
			}
			if (substring[col] =='X'){ //NIGHT TIME SPAWNPOINT
				s = new SpawnPoint(x,y,true, 0);
				s.night = true;	
				spawnpoints.push(s);	
			}
			if (substring[col] =='P'){
				player = new Player("Ogran",x, y);
			}
			if (substring[col] =='H'){
				p = new PowerUp("health","GREEN", x, y);
				powerups.push(p);
			}
			if (substring[col] =='A'){
				p = new PowerUp("armour","BLUE", x, y);
				powerups.push(p);
			}
			if (substring[col] =='N'){
				p = new PowerUp("energy","PURPLE", x, y);
				powerups.push(p);
			}
			if (substring[col] =='B'){
				p = new PowerUp("buff","ORANGE", x, y);
				powerups.push(p);
			}
			if (substring[col] =='F'){
				p = new Weapon("flame","RED", x, y);
				weapons.push(p);
			}
			if (substring[col] =='S'){
				p = new Weapon("sniper","WHITE", x, y);
				weapons.push(p);
			}
			if (substring[col] =='M'){
				p = new Weapon("missile","BROWN", x, y);
				weapons.push(p);
			}
			if (substring[col] =='L'){
				p = new Weapon("laser","PINK", x, y);
				weapons.push(p);
			}
			if (substring[col] =='O'){
				p = new Path(x, y);
				paths.push(p);
			}
			x += 32;
		}
		y += 32;
		x = 0;
	}

}

function gameLoop(){
	//CONTROLS WHAT SHOWS
	if (gamestate == "MENU"){
		clear();		
		draw(); //Draw current game in BG
		menu();
	}
	if (gamestate == "INGAME"){	
		checkTime();
		fogOfWar();
		updateLives();
		checkDestroyed();
		clear();
		addEnemy();	
		getInput();
		checkCollision();
		moveBullets();
		movePlayer();
		moveEnemy();
		draw();
	}
}

function clear() {	
	ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
}

//CREATES VISION BLOCKING
function fogOfWar(){
	pixels = [];
	var x = 0, y = 0;
	for (var row = 0; row < 20; row++ ){ //25
		for (var col = 0; col < 25 ; col++){ //20
			p = new Pixel(x, y);
			//IF OUT OF RANGE OF PLAYER
			if (checkCollideWithFog(p)){
				p.visible = true;
			}
			pixels.push(p);
			x += 32;
		}
		y += 32;
		x = 0;
	}
}

function rgb(r,g,b) {
    return 'rgb(' + [(r||0),(g||0),(b||0)].join(',') + ')';
}

function playAudio(sound, play, volume){
	if (volume){
		sound.volume = volume;
	}
	if (play){
		sound.currentTime = 0;
		sound.play();
	} else if (!play) {
		sound.currentTime = 0;
	}
}


function updateLives(){
	/*SUBTRACT LIVES FROM BULLETS, CRATERS*/
	$.each(bullets, function(b, val){
		if (!bullets[b].snipe){ //If bullet is not a sniper
			bullets[b].life--; //Subtract a life
		}
	});
	
	/*UPDATE DEG FOR EACH WEAPON*/
	$.each(weapons, function(w, val){
		weapon = weapons[w];
		if (weapon.rot < 360){ //If weapon has rotated
			weapon.rot++;
		} else {
			weapon.rot = 0;
		}
		weapons[w] = weapon;
	});

	/* ROTATE ANTI CLOCKWISE */
	$.each(powerups, function(p, val){
		powerup = powerups[p];
		if (powerup.rot != 0){ //Finished rotating
			powerup.rot--;
		} else {
			powerup.rot = 360;
		}
		powerups[p] = powerup;
	});
}

function checkDestroyed(){

	//if bullet is destroyed, create crater and destroy bullet
	$.each(bullets, function(b, val){
		bullet = bullets[b];
		if (bullet.life <= 0) {
			if (!bullet.hitTarget && !bullet.laser && !bullet.onWater 
				&& !bullet.flame && bullet.missile){
					c = new Crater(bullet.x - player.width/2, bullet.y - player.height/2);
					craters.push(c);	
			}
			if (bullet.onWater){
				playAudio(aSplash,true,0.10);
			}
				
			bullets.splice(b, 1);
		} 
	});

	//CHECK AND DESTROY DEAD POWERUPS
	$.each(powerups, function(p, val){
		if (powerups[p].life <= 0){
			powerups.splice(p,1);
		} 
	});
	
	//CHECK AND DESTROY DEAD TANKS
	$.each(enemies, function(e, val){
		enemy = enemies[e];
		if (enemy != undefined){
			if (enemy.life <= 0){
				$.each(spawnpoints, function(s, val){
					spawnpoint = spawnpoints[s];
					if (enemy.spawnID == spawnpoint.spawnID){
						spawnpoint.free = true;
						spawnpoint.spawnID = 0;
					}
					spawnpoints[s] = spawnpoint;
				});	
				enemies.splice(e,1);
				player.score +=100;
				player.killed++;
			}
		}
	});
	
}

//#	Selects a random free spawnpoint and populates it
//#	Assigns same ID to Spawn/Enemy; to allow clearup
function addEnemy(){
	if (canSpawn){
		clearInterval(enemySpawnID);
		freeSpawns = [];
		$.each(spawnpoints, function (s, val){
			spawnpoint = spawnpoints[s];
			if (spawnpoint.free){ //Only add enemy spawns at day
				if (currentTime	 == "DAY" && !spawnpoint.night){
					freeSpawns.push(s);
				}
				
				if (currentTime	 == "NIGHT" && spawnpoint.night){ //NIGHT TIME ONLY SPAWNS
					freeSpawns.push(s);
				}
			}
		});

		if (freeSpawns.length  >  0){ //if a spawnpoint is free
			key = rand(0, freeSpawns.length); //pick random index from list
			key = freeSpawns[key]; // choose free spawnpoint, store into key
			e = new Enemy(names[rand(0,names.length )],spawnpoints[key].x, spawnpoints[key].y);
			s = new SpawnPoint(spawnpoints[key].x,spawnpoints[key].y,false, e.spawnID);
			//# If player is underneath, dont spawn
			if (!checkCollideWithPlayer(e)){
				enemies.push(e);
				//Find newly created enemy ID to set target point	
				if (spawnpoints[key].night){
					s.night = true;
				}
				spawnpoints[key] = s;	
			}	
		} 

		var interval = rand(4,8) * 1000; //create random timing for another check
		enemySpawnID = setInterval(function(){canSpawn = true;}, interval);	
		canSpawn = false;
	}
}
function setPath(id){
	function nextPath(x,y,dx,dy,rot){
		this.x = x;
		this.y = y;
		this.dx = dx;
		this.dy = dy;
		this.rot = rot;
	}
	
		e = enemies[id];
		viablepaths = [];
		if ((e.x == e.tarX && e.tarY == e.y) || (e.tarX == 0 && e.tarY == 0))
		{
			$.each(paths, function(pa, valp){ //Populate viable routes
				p = paths[pa];
				dx = 0;
				dy = 0;
				if ((p.x == e.x) && (p.x != e.lastX)){
					if (e.y < p.y){
						dy = 1;
						rot = 180;
					} else {
						dy = -1;
						rot = 0;
					}
					next = new nextPath(p.x,p.y,0,dy,rot)
					viablepaths.push(next);
				} else if ((p.y == e.y) && (p.x != e.lastY)){
					if (e.x < p.x){
						dx = 1;
						rot = 90;
					} else {
						dx = -1;
						rot = 270;
					}
					next = new nextPath(p.x,p.y,dx,0,rot)
					viablepaths.push(next);
				}

			});

			e.lastX = e.tarX;
			e.lastY = e.tarY;
			pick = rand(0,viablepaths.length);
			newPath = viablepaths[pick];
			e.tarX = newPath.x;
			e.tarY = newPath.y;
			e.dx = newPath.dx;
			e.dy = newPath.dy;
			e.rot = newPath.rot;

		} else {
			e.x += e.dx * e.speed; 
			e.y += e.dy * e.speed; 
		}

		enemies[id] = e;

}
// function setPath(id){

// 	function nextPath(x,y,dx,dy,rot){
// 		this.x = x;
// 		this.y = y;
// 		this.dx = dx;
// 		this.dy = dy; 
// 		this.rot = rot;
// 		this.height = 32;
// 		this.width = 32;
// 	}

// 	//WORKS FINE
// 	e = enemies[id];
// 	viablepaths = [];
	
// 	if ((e.x == e.tarX && e.tarY == e.y) || (e.tarX == 0 && e.tarX == 0)){
// 		$.each(paths, function(pa, valp){ //Populate viable routes
// 			p = paths[pa];
// 			dx = 0;
// 			dy = 0;
// 			var next;
// 			var pathSafe = false;
// 			var loop = false; // trakcs if to search for viability
// 			if (p.x == e.x){
// 				if (e.y < p.y){
// 					dy = 1;
// 					var rot = 180;
// 				} else {
// 					dy = -1;
// 					var rot = 0;
// 				}
// 				next = new nextPath(p.x,p.y,0,dy,rot);
// 				pathSafe = true;
// 				loop = true;
// 				viablepaths.push(next);
// 			} else if (p.y == e.y){
// 				if (e.x < p.x){
// 					dx = 1;
// 					var rot = 90;
// 				} else {
// 					dx = -1;
// 					var rot = 270;
// 				}
// 				next = new nextPath(p.x,p.y,dx,0,rot);
// 				pathSafe = true;
// 				loop = true;	
// 				viablepaths.push(next);
// 			}
// 		});

// 		//BULLSHIT FUCKING DOESNT WORK FFS FUCKING HATE THIS SHITWTFBALLSOMG FUCK THIS

// 		// 	if (loop){
// 		// 		var tempe = new nextPath(e.x,e.y);
// 		// 		var tempnext = new nextPath(next.x,next.y,next.dx,next.dy,next.rot);
// 		// 		loopCounter = 0;
// 		// 		walkable = [];
// 		// 	}

// 		// 	//# Only go ahead if spawnpoint is on x/y axis of player
// 		// 	while (loop){

// 		// 		loopCounter++;

// 		// 		if ((tempnext.dx == -1 || tempnext.dx == 1) && (tempnext.dy == 0)){
// 		// 			tempe.x += (32 * next.dx);
// 		// 		}
// 		// 		if ((tempnext.dy == -1 || tempnext.dy == 1) && (tempnext.dx == 0)){
// 		// 			tempe.y += (32 * tempnext.dy);
// 		// 		}

// 		// 		status = "X: " + tempe.x + " Y: " + tempe.y + " .";

// 		// 		//Check if wall is in the way
// 		// 		$.each(walls, function(wa,val){
// 		// 			wall = walls[wa];
// 		// 				if (wall.x ==tempe.x && wall.y ==tempe.y){
// 		// 					//wall[wa].blocking = true;
							
// 		// 					loop = false;			
// 		// 				}
// 		// 		});

// 		// 		if (checkCollide(tempe,next)){
// 		// 			pathSafe = true;
// 		// 			ctx.fillStyle = "orange";
// 		// 			ctx.fillRect(tempe.x,tempe.y,tempe.width,tempe.height);
// 		// 			walkable.push()
// 		// 			loop = false;

// 		// 		} 

// 		// 		if (loopCounter >= 512) loop = false; //protect infinite loops
				
// 		// 	}
// 		// 		if (pathSafe){
// 		// 			viablepaths.push(next);
// 		// 		}
								
// 		// });

// 		e.lastX = e.tarX;
// 		e.lastY = e.tarY;
// 		pick = rand(0,viablepaths.length );
// 		newPath = viablepaths[pick];
// 		e.tarX = newPath.x;
// 		e.tarY = newPath.y;
// 		e.dx = newPath.dx;
// 		e.dy = newPath.dy;
// 		e.rot = newPath.rot;

// 	} else {
// 		e.x += e.dx * e.speed; 
// 		e.y += e.dy * e.speed; 
// 	}

// 	enemies[id] = e;
// }


function moveEnemy(){
 	$.each(enemies, function(e, val){
 		setPath(e);
 	});
 }

function getInput(){
	if (pressedKeys[KEY.W]){
		//move PLAYER UP
		player.dx = 0;
		player.dy = -1;
		player.up = true;	
	}
	if (pressedKeys[KEY.S]){
		//move PLAYER DOWN
		player.dx = 0;
		player.dy = 1;
		player.down = true;
	}
	if (pressedKeys[KEY.A]){
		//move PLAYER LEFT
		player.dx += -1;
		player.dy += 0;
		player.left = true;
	}
	if (pressedKeys[KEY.D]){
		//move PLAYER RIGHT
		player.dx += 1;
		player.dy += 0;
		player.right = true;
	}
	if (player.canFire){
		if (pressedKeys[KEY.UP]){
			//move BULLET UP
			createBullet(player.x, player.y, 0, -1, 0);
		} else if (pressedKeys[KEY.LEFT]){
			//move BULLET LEFT
			createBullet(player.x, player.y,-1, 0, 270)
		} else if (pressedKeys[KEY.DOWN]){
			//move BULLET DOWN
			createBullet(player.x, player.y,0, 1 , 180)
		} else if (pressedKeys[KEY.RIGHT]){
			//move BULLET RIGHT
			createBullet(player.x, player.y,1, 0, 90)
		}
	}
	
	if (pressedKeys[KEY.SHIFT]){
		//energy SPEED
		if (player.energy > 0 && pressedKeys[KEY.SHIFT]){
			player.speed = player.baseSpeed * 1.5;
			player.energy -= 1.5;
		} 
	}

	if (pressedKeys[KEY.ESCAPE]){
		player.pause = true;
		menuIndex = 0;
		gamestate = "MENU";
		}

	if (pressedKeys[KEY.F]){
		player.life = 0;
	}

	if (pressedKeys[KEY.G]){
		//show collision 
		if (wallOn){
			wallOn = false;
		} else {
			wallOn = true;
		}
	}
	
	//CANCEL energy 
	if ( player.energy <= 0 || !(pressedKeys[KEY.SHIFT])){
			player.speed = player.baseSpeed;
			if (player.energy < MAX_ENERGY )
				player.energy+= 0.75;;
		}		
}

// x,y, dx, dy, power, speed, color
function createBullet(x, y, dx, dy, rot){
		player.canFire = false;
		missileID = setInterval(function(){
			player.canFire = true; clearInterval(missileID);
		}, checkRof(player.weapon)); 

		weapon = player.weapon;
		b = new Bullet(x, y, dx, dy, checkWeapon(weapon), 
			checkSpeed(weapon), checkColour(weapon), rot);

		if (weapon == "sniper"){
			b.radius = 2;
			b.snipe = true;
			b.image = bSniper;
			playAudio(aSniper, true, 0.5);
		}
		if (weapon == "laser"){
			b.radius = 3;
			b.laser = true;
			b.image = bLaser;
			playAudio(aLaser, true, 0.5);
		}
		if (weapon == "flame"){
			b.radius = 4;
			b.flame = true;
			b.image = bFlame;
		}
		if (weapon == "missile"){
			b.missile = true;
			b.image = bMissile;
			playAudio(aMissile, true, 0.5);
			playAudio(aMissileShell, true, 0.1);
		}
		bullets.push(b);		
}

function checkCollision(){
	
	$.each(bullets, function(b, val){
		bullet = bullets[b];
		//FOR EACH BULLET, CHECK EACH ENEMIES
		$.each(enemies, function(e, val){
			enemy = enemies[e];
			if (checkCollide(bullet, enemy)){
				bullet.life = 0;
				enemy.life -= bullet.power;
				bullet.hitTarget = true;
				bullet.dx = 0;
				bullet.dy = 0;
			}
			enemies[e] = enemy;
		});
		bullets[b] = bullet;
	});

	$.each(bullets, function(b, val){
		bullet = bullets[b];
		bullet.onWater = false; 

		$.each(walls, function(w, val){
			wall = walls[w];
			if (checkCollide(bullet, wall )){		
				if (wall.water){ //If  on water and not 
					bullet.onWater = true;
				} 			
				if (!bullet.onWater){
					bullet.life = 0;
					bullet.hitTarget = true;
					bullet.dx = 0;
					bullet.dy = 0;
				}
				if (bullet.missile){
					wall.damaged = true;
					playAudio(aWallHit, true, 0.2);
				}
			} 
		});

		if (bullet.flame && currentTime=="NIGHT"){
			$.each(pixels, function(p, val){
				pixel = pixels[p];
				if (checkCollide(bullet,pixel) && !pixel.visible){
					pixel.visible = true;
				}
				pixels[p] = pixel;
			});
		}

		bullets[b] = bullet;
	});

	//CHECK COLLISION BETWEEN WALL/PLAYER
	$.each(walls, function(w, val){
		wall = walls[w];
		if (checkCollideWithPlayer(wall)){
			player.collided = true;
		}
	});

	//CHECK COLLISION BETWEEN PLAYER/POWERUP
	$.each(powerups, function(p, val){
		powerup = powerups[p];
		if (checkCollideWithPlayer(powerup) && powerup.spawned){					
			type = powerup.type;
			powerup.spawned = false;
			increase = currentDay * 2000; //2 SECOND INCREASE PER DAY
			switch(powerup.type){
				case "health":
					player.life += 20;
					healthRe = setInterval(function(){powerups[p].spawned = true; 
						clearInterval(healthRe)}, 10000 + increase);
					break;
				case "armour":
					player.armour += 20;
					armourRe = setInterval(function(){powerups[p].spawned = true; 
						clearInterval(armourRe)}, 10000 + increase);
					status = "flame";
					break;
				case "energy":
					player.energy += 20;
					energyRe = setInterval(function(){powerups[p].spawned = true; 
						clearInterval(energyRe)}, 6000 + increase);
					break;
				case "buff":
					player.buffed = true;
					buffRe = setInterval(function(){powerups[p].spawned = true; 
						clearInterval(buffRe)}, 30000 + increase);
					debuffRE = setInterval(function(){player.buffed = false; 
						clearInterval(debuffRe)}, 15000);
					break;
			}	
			powerups[p] = powerup;
		}
	});

	//CHECK COLLISION BETWEEN PLAYER/WEAPON
	$.each(weapons, function(w, val){
		weapon = weapons[w];
		if (checkCollideWithPlayer(weapon) && weapon.spawned){			
			playAudio(aEquip, true, 0.20);		
			type = weapon.type;
			weapon.spawned = false;
			increase = currentDay * 1000;
			switch(weapon.type){
				case "laser":
					laserRe = setInterval(function(){weapons[w].spawned = true; 
						clearInterval(laserRe)}, 5000 + (increase * 2));
					break;
				case "flame":
					flameRe = setInterval(function(){weapons[w].spawned = true; 
						clearInterval(flameRe)}, 7000 + (increase * 2));
					status = "flame";
					break;
				case "missile":
					missileRe = setInterval(function(){weapons[w].spawned = true; 
						clearInterval(missileRe)}, 10000 + (increase * 2));
					break;
				case "sniper":
					snipeRe = setInterval(function(){weapons[w].spawned = true; 
						clearInterval(snipeRe)}, 25000 + (increase * 2));
					break;
			}	
			weapons[w] = weapon;
			player.weapon = weapon.type;
		}
	});

	//CHECK COLLISION WITH ENEMIES
	$.each(enemies, function(e, val){
		enemy = enemies[e];
		if (checkCollideWithPlayer(enemy)){
			player.collided = true;
			if (!player.hurt){
				clearInterval(hurt);
				player.hurt = true; 
				player.armour -= 25;
				hurt = setInterval(function(){ player.hurt = false}, 1500);
			}
		}
		enemies[e] = enemy;
	});

	//CHECK COLLISION WITH CRATERS
	$.each(craters, function(c, val){
		if (checkCollideWithPlayer(craters[c])){
			player.dx -= player.dx * 0.1;
			player.dy -= player.dy * 0.1;
		}
	});
	
}

function movePlayer(){

	if (player.armour < 0){
		player.life += player.armour ;
		player.armour = 0;
	} else if (player.armour > MAX_ARMOUR){
		player.armour = MAX_ARMOUR;
	}

	if (player.life > 200){
		player.life = 200;
	}

	if (player.life <= 0){
		player.life = 0;
		player.pause = false;
		player.dead = true;
		gamestate = "MENU";

	}

	//If DX/DY are true, player is moving
	if (player.dx != 0 || player.dy != 0){
		player.moving = true;
	} else {
		player.moving = false;
	}

	if (player.collided){
		player.x -= player.dx * player.speed * 0.1;
  		player.y -= player.dy * player.speed * 0.1;
    	player.collided = false;
	} else {
		player.x += player.dx * player.speed;
    	player.y += player.dy * player.speed;
    	player.dx = 0;
		player.dy = 0;
	}

	//CHECK ROTATION
	if (player.up && player.left){
		player.rot = 320;
	} else if (player.up && player.right){
		player.rot = 45;
	} else if (player.down && player.left){
		player.rot = 225;
	} else if (player.down && player.right){
		player.rot = 135 ;
	} else {
		if (player.up){
			player.rot = 0;
		}
		if (player.down){
			player.rot = 180;
		}
		if (player.right){
			player.rot = 90;
		}
		if (player.left){
			player.rot = 270;
		}
	}

	player.left = false;
	player.right = false;
	player.up = false;
	player.down = false;

	player.dx = 0;
	player.dy = 0;
}

function checkCollide(obj1, obj2){ 
	object1 = obj1;
	object2 = obj2;
	if (object1.x < object2.x + object2.width  && object1.x + object1.width  > object2.x &&
    object1.y < object2.y + object2.height && object1.y + object1.height > object2.y) {
		return true;
	}

}

function checkCollideWithFog(obj2){

	object1 = new Player();
	object2 = obj2;

	if (visibility < 40){
		visibility = 40;
	}

	object1.x = player.x - visibility + (player.dx  * player.speed);
	object1.y = player.y - visibility + (player.dy  * player.speed);
	object1.height += visibility * 2;
	object1.width += visibility * 2;

	if (object1.x < object2.x + object2.width  
		&& object1.x + object1.width  > object2.x 
		&& object1.y < object2.y + object2.height 
		&& object1.y + object1.height > object2.y) {
			return true;
	}

}

function checkCollideWithPlayer(obj2){

	object1 = new Player();
	object2 = obj2;

	object1.x = player.x + (player.dx  * player.speed);
	object1.y = player.y + (player.dy  * player.speed);

	if (object1.x < object2.x + object2.width  
		&& object1.x + object1.width > object2.x 
		&& object1.y < object2.y + object2.height 
		&& object1.y + object1.height > object2.y) {
			return true;
	}
}
	
function moveBullets() {
	//move bullet position
	$.each(bullets, function(b, val){
		bullet = bullets[b];
		bullet.x += bullet.dx * bullet.speed; //calculate new position of x
		bullet.y += bullet.dy * bullet.speed; //calculate new position of Y
		bullets[b] = bullet;
	});
}

function rand(min, max){
	ran = Math.floor((Math.random() * max) + min);
	return ran;
}

function checkTime(){
	if (currentTime == "DAY"){
		if (dayTimer >= fps * 25){	
			clearInterval(showTimer);			
			currentNight++;;
			nightTimer = 0;
			killed = player.killed;
			if ((player.killed - killed) > 4){
				player.score += 250;
			}		
			currentTime = "NIGHT";
			showMessage = "NIGHT #"+currentNight+"!"
			showTimer = setInterval(function(){
				showMessage = "";
			}, 3000);
		} else 
			dayTimer+= 1;
	}

	if (currentTime == "NIGHT"){
		if (nightTimer >= fps * 25){
			clearInterval(showTimer);	
			currentDay++;
			dayTimer = 0;
			killed = player.killed;
			if ((player.killed - killed) > 4){
				player.score += 250;
			}
			currentTime = "DAY";
			showMessage = "DAY #"+currentDay+"!"
			showTimer = setInterval(function(){
				showMessage = "";
			}, 3000);
			visibility -= 10;
			//playAudio(aMorning, true, 0.5);
		} else 
			nightTimer+= 1;
	}
}

function checkWeapon(weapon){
	power = 0;
	switch (weapon){
		case "laser":
			power = 10;
			break;
		case "flame":
			power = 5;
			break;
		case "missile":
			power = 15;
			break;
		case "sniper":
			power = 20;
			break;
	}

	if (player.buffed){
		power *= 2;
	}
	return power;
}

function checkSpeed(weapon){
	speed = 0;
	switch (weapon){
		case "laser":
			speed = 4;
			break;
		case "flame":
			speed = 5;
			break;
		case "missile":
			speed = 8;
			break;
		case "sniper":
			speed = 10;
			break;
	}
	return speed;
}

function checkColour(weapon){
	colour = "";
	switch (weapon){
		case "laser":
			colour = "red";;
			break;
		case "flame":
			colour = "orange";
			break;
		case "missile":
			colour = "brown";
			break;
		case "sniper":
			colour = "white";
			break;
	}
	return colour;
}

function checkRof(weapon){ //1000 ROF = 1 second delay
	rof = 0;
	switch (weapon){
		case "laser":
			rof = 500;
			break;
		case "flame":
			rof = 400;
			break;
		case "missile":
			rof = 1500;
			break;
		case "sniper":
			rof = 3000;
			break;
		}
	return rof;
}

function checkLife(weapon){ 
	life = 0;
	switch (weapon){
		case "laser":
			life = 50;
			break;
		case "flame":
			life = 40;
			break;
		case "missile":
			life = 20;
			break;
		case "sniper":
			life = 40;
			break;
		}
	return life;
}

function drawImageRot(img,x,y,width,height,deg){

//Convert degrees to radian 
	var rad = deg * Math.PI / 180;

    //Set the origin to the center of the image
    ctx.translate(x + width / 2, y + height / 2);

    //Rotate the canvas around the origin
    ctx.rotate(rad);

    //draw the image    
    ctx.drawImage(img,width / 2 * (-1),height / 2 * (-1),width,height);

    //reset the canvas  
    ctx.rotate(rad * ( -1 ) );
    ctx.translate((x + width / 2) * (-1), (y + height / 2) * (-1));
}

function draw(){ 
	ctx.drawImage(bg, 0,0);

	//Draw Craters
	$.each(craters, function(c, val){
		drawImageRot(crater, craters[c].x, craters[c].y, craters[c].width, craters[c].height, craters[c].rot);
	});
	
	//Draw Powerups	
	$.each(powerups, function(p, val){
		p = powerups[p];
		ctx.fillStyle = p.colour;
		ctx.drawImage(platform, p.x, p.y); // draw base platform

		if (p.spawned){
			if (p.type == "health")
					drawImageRot(healthPow, p.powx, p.powy, p.powwidth, p.powheight, p.rot);
			if (p.type == "armour")
					drawImageRot(armourPow, p.powx, p.powy, p.powwidth, p.powheight, p.rot);
			if (p.type == "energy")
					drawImageRot(energyPow, p.powx, p.powy, p.powwidth, p.powheight, p.rot);	 
			if (p.type == "buff") 
				drawImageRot(buffPow, p.powx, p.powy, p.powwidth, p.powheight, p.rot);			 
		}
	});

	//Draw Weapons
	$.each(weapons, function(w, val){
		w = weapons[w];
		ctx.fillStyle = w.colour;
		ctx.drawImage(platform, w.x, w.y); // draw base platform

		if (w.spawned){ //Do if isnt taken/isnt respawning
			if (w.type == "missile")
				drawImageRot(missileWep, w.wepx, w.wepy, w.wepwidth, w.wepheight, w.rot);
			if (w.type == "sniper")
				drawImageRot(sniperWep, w.wepx, w.wepy, w.wepwidth, w.wepheight, w.rot);
			if (w.type == "flame")
				drawImageRot(flameWep, w.wepx, w.wepy, w.wepwidth, w.wepheight, w.rot);
			if (w.type == "laser")
				drawImageRot(laserWep, w.wepx, w.wepy, w.wepwidth, w.wepheight, w.rot);
		}
	});

	//DRAW WALLS
	$.each(walls, function(w, val){
	 	var wall = walls[w];
		if (wall != undefined){
			if (wall.water || wall.side){
				//DO/draw NOTHING
			} else {

				if (wall.damaged){		
					ctx.drawImage(wallDamaged, wall.x,wall.y );
				} else { //NOT DAMAGED
					ctx.drawImage(wallImage, wall.x,wall.y );
				}
			}	
			if (wallOn){
				ctx.fillStyle = walls[w].colour;
				if (wall.water){
					ctx.fillStyle = "aqua";
				}
				if (!wall.water && !wall.side){
					ctx.fillStyle = "pink";
				}
		 		ctx.fillRect(walls[w].x,walls[w].y,walls[w].width,walls[w].height);
			}	
		 }
	});

	//draw bullets
	$.each(bullets, function(b, val){	
		ctx.fillStyle = "black"; 
		ctx.beginPath(); 
		ctx.arc(bullets[b].x, bullets[b].y,bullets[b].radius,0,Math.PI*2,true);
		ctx.closePath();
		ctx.fill(); 
		ctx.fillStyle = bullets[b].colour; 
		ctx.beginPath(); 
		ctx.arc(bullets[b].x, bullets[b].y,bullets[b].radius - 1,0,Math.PI*2,true);
		ctx.closePath();
		ctx.fill(); 
	});

	//draw player
	if (player.hurt){
		ctx.fillStyle = rgb(255,255,rand(0,200));	
	} else {
		ctx.fillStyle = player.colour;
	}
	drawImageRot(tankImage, player.x, player.y, player.width, player.height, player.rot);
	if (wallOn){
		ctx.fillStyle = player.colour;
		ctx.fillRect(player.x,player.y,player.width,player.height);

		$.each(paths, function(pa, val){
			ctx.fillStyle = "black"
			p = paths[pa];
			ctx.fillRect(p.x,p.y,p.width,p.height);
		});
	}
	

	//draw enemies
		
	$.each(enemies, function(e, val){
		enemy = enemies[e];
		ctx.fillStyle = enemies[e].colour;
		drawImageRot(enemyImage, enemy.x, enemy.y, enemy.width, enemy.height, enemy.rot);
		if (wallOn){
			ctx.fillStyle = enemy.colour;
			ctx.fillRect(enemies[e].x,enemies[e].y,enemies[e].width,enemies[e].height);
		}
	});

	//draw enemy names
	ctx.textAlign = "left";
	ctx.font = "7pt Arbutus";
	$.each(enemies, function(e, val){
		enemy = enemies[e];
		ctx.fillStyle = "white";

		//IF ALIVE, DRAW HP BAR
		if (enemy.life > 0){
			ctx.fillStyle = "red";
			ctx.fillRect(enemy.x, enemy.y - 5 , 100/3.5, 3)
			ctx.fillStyle = "green";
			ctx.fillRect(enemy.x, enemy.y - 5 , enemy.life /3.5, 3);
		}
	});

	
	/* Reduces transparency of masking overlay depending on current time*/
	if (currentTime == "DAY"){
		ctx.globalAlpha = 0.4 + (dayTimer *0.001) - 0.2;
	} else if (currentTime == "NIGHT"){
		ctx.globalAlpha = 0.9;
	}

	ctx.drawImage(mask, 0,0);	
	ctx.globalAlpha = 1;

	
	if ( currentTime == "NIGHT"){
		//WIP FOG
		$.each(pixels, function (p, val){
			pixel = pixels[p];
			if (pixel.visible == false){
				ctx.fillStyle = pixel.colour;
				ctx.fillRect(pixel.x, pixel.y, pixel.width, pixel.height);
			}
		});
	}	

	ctx.fillStyle = "grey";
	ctx.fillRect(0, 609, 800, 32);

	ctx.textAlign = "left";
	ctx.font = "13pt Arbutus";
	ctx.fillStyle = "brown";

	//DRAW HEALTHBAR + STATS
	//HP
	ctx.fillStyle = "green";
	if (player.life <= 0){
		ctx.fillText("HP: " + player.life, 32, boxHeight - 18);
	} else if (player.life > 100){
		ctx.fillText("HP:  " + player.life, 32, boxHeight - 18);
		ctx.fillRect(32,boxHeight - 16,100, 25);
		ctx.fillStyle = "#6CC417"; // OVERFLOW HP BAR
		ctx.fillRect(32,boxHeight - 16,player.life - 100, 15);
	}else {
		ctx.fillText("HP:  " + player.life, 32, boxHeight - 18);
		ctx.fillRect(32,boxHeight - 16,player.life, 15);
	}
	
	//ARMOUR
	ctx.fillStyle = "blue";
	if (player.armour > 100){
		ctx.fillText("AMR:  " + player.armour, 160, boxHeight - 18);
		ctx.fillRect(160, boxHeight - 35,100, 15);
		ctx.fillStyle = "#3F0092"; // OVERFLOW ARMOUR BAR
		ctx.fillRect(160,boxHeight - 16,player.armour - 100, 15);
	} else {
		ctx.fillText("AMR:  " + player.armour, 160, boxHeight - 18);
		ctx.fillRect(160, boxHeight - 16,player.armour, 15);
	} 

	//ENERGY
	ctx.fillStyle = "yellow";
	ctx.fillText("ENERGY: " + parseInt(player.energy), 288, boxHeight - 18);
	if (player.energy == MAX_ENERGY){
		ctx.fillStyle = "orange";
	}
	ctx.fillRect(288 ,boxHeight - 16,player.energy,15);

	//SCORE
	ctx.font = "16pt Arbutus";
	ctx.fillStyle = "white";
	ctx.fillText("SCORE: " + player.score, boxWidth - 175, boxHeight - 8);

	//OUTPUT MESSAGE

	ctx.fillStyle = "white";
	ctx.font = "22pt Arbutus";
	ctx.fillText(showMessage, 350, 100);
	
	ctx.fillStyle = "grey";
	ctx.fillRect(0, 0, 800, 20);

	//DEBUG 
	ctx.font = "10pt Arbutus";
	ctx.fillStyle = "black";
	if (currentTime=="DAY")
		ctx.fillStyle = "yellow";
	ctx.fillText("CURRENT DAY:  " + currentDay, 25, 15);

	ctx.fillStyle = "black";
	if (currentTime=="NIGHT")
		ctx.fillStyle = "yellow";
	ctx.fillText("CURRENT NIGHT:  " + currentNight, 200, 15);

	ctx.font = "9pt Arbutus";
	ctx.fillStyle = "white";
	ctx.fillText("Weapons/Boosts respawn increased by " + currentDay * 2 + " seconds", 400, 15);

	ctx.fillText("PASS TEST 1: " + status, 10, 600);
	// ctx.fillText("PASS TEST 2: " + status, 10, 580);	
	// ctx.fillText("PASS TEST 3: " + player.moving, 10, 500);	

}

//Establish Menu Items
function menu(){

	index = menuIndex;

	//BLACK BACKGROUND
	ctx.globalAlpha = 0.5;
	ctx.drawImage(mask, 0,0);	
	ctx.globalAlpha = 1;

	menuItems = {"new" : "NEW GAME",};
	pauseItems = {"return" : "RETURN TO GAME", "exit" : "EXIT TO MENU"};
	list = []; //store item objects


	function Item(x,y,width,height,id,text){
		this.x = x;
		this.y = y;
		this.width = width; 
		this.height = height;
		this.id = id;
		this.text = text;
		this.selected = false;
	}

	indentY = 0;

	//#SHOW ENDING SCREEN #//
	if (player.dead){
		goX = 300;
		goY = 120;
		goWidth = 200;
		goHeight = 150;
		borderWidth = 5;
		indentY += goHeight + 30;

		ctx.fillStyle = "red"; //BG
		ctx.fillRect(goX - borderWidth,goY - borderWidth,goWidth + (borderWidth *2), goHeight + (borderWidth*2));
		ctx.fillStyle = "grey";
		ctx.fillRect(goX, goY, goWidth, goHeight);

		ctx.fillStyle = "white";
		ctx.font = "8pt Arbutus";
		ctx.textAlign = 'center';

		textY = goY + 20; //Begin draw
		textX = goX + goWidth /2;
		spacing = 30;

		ctx.fillText("YOU SCORED: " + player.score, textX, textY); textY += spacing;
		if (player.score > highScore){
			ctx.fillStyle = "gold";
			ctx.fillText("NEW HIGH SCORE OF " + player.score + "!",  textX, textY); textY += spacing;
			ctx.fillStyle = "white";
		} else {
			ctx.fillStyle = "gold";
			ctx.fillText("HIGHSCORE TO BEAT: " + highScore,  textX, textY); textY += spacing;
			ctx.fillStyle = "white";
		}
		ctx.fillText("YOU SURVIVED: " + currentDay + " DAY(S).",  textX, textY); textY += spacing;
		ctx.fillText("YOU SURVIVED: " + currentNight + " NIGHT(S).",  textX, textY); textY += spacing;
		ctx.fillText("ENEMIES KILLED: " + player.killed + ".",  textX, textY); textY += spacing;
	} 

	menuX = 300; //begin draw
	menuY = 120 + indentY;
	width = 200; //block vars
	height = 64;


	ctx.fillStyle = "white";
	ctx.font = "25pt Arbutus";
	ctx.textAlign = 'center';
	if (player.dead){
		ctx.fillText("GAME OVER", menuX + width/2, 100);
	} else 
		ctx.fillText("MENU", menuX + width/2, 100);
	

	//# Populate the appropriate  menu
	if (player.pause){
		$.each(pauseItems, function (i, val){
			item = new Item(menuX, menuY, width, height, i, val);
			list.push(item);
			menuY += height + 5;
		});
	} else if (!player.pause){
		$.each(menuItems, function (i, val){
			item = new Item(menuX, menuY, width, height, i, val);
			list.push(item);
			menuY += height + 5;
		});
	}

	list[index].selected = true;

	if (pressedKeys[KEY.UP]){
		list[index].selected = false;
		index--;
		if (index < 0) 
		{
			index = list.length - 1;
		} 
		list[index].selected = true;
		playAudio(aSelect, true, 0.2);

	} else if (pressedKeys[KEY.DOWN] ){
		list[index].selected = false;
		index++;
		if (index > list.length - 1)
		{
			index = 0;
		} 
		list[index].selected = true;
		playAudio(aSelect, true, 0.2);
	}

	menuIndex = index;

	//DRAW
	$.each(list, function(l, val){
		item = list[l];

		if (item.selected){
			ctx.fillStyle = "green"; 
			ctx.fillRect(item.x - 5,item.y - 5,item.width + 10, item.height + 10);
		}
		ctx.fillStyle = "grey"; 
		ctx.fillRect(item.x,item.y ,item.width, item.height);

		ctx.fillStyle = "white";
		ctx.font = "12pt Arbutus";
		ctx.textAlign = 'center';
		ctx.fillText(item.text, item.x += item.width/2, item.y += item.height/2);
	});

	if (pressedKeys[KEY.ENTER]){
		$.each(list, function (i, val){
			item = list[i];
			if (item.selected)
			{
				if (item.id == "new"){				
					menuIndex = 0;
					newGame();
					gamestate = "INGAME"
				}				
				if (item.id == "return"){
					player.pause = false;
					gamestate = "INGAME";
					menuIndex = 0;
				}
				if (item.id == "exit"){
					player.pause = false;
					gamestate = "MENU";
				}
				menuIndex = 0;		
			}
		});
	}
	
	ctx.fillStyle = "YELLOW";	
	//ctx.fillText("*Nearly all menuz is brok3n - Ogran", boxWidth - 250, boxHeight -64);
}

function newGame(){
	//clean arrays
	bullets = [];
	friendlyBullets = []; 
	craters = [];
	walls = [];
	players = []; 
	powerups = [];
	spawnpoints = [];
	pressedKeys = [];
	weapons = [];
	pixels = []; 
	paths = [];
	enemies = [];

	//Restore level objects
	createLevel();

	//Assign target paths for enemies
	$.each(enemies, function(e, val){
		setPath(e);
	});


	wallOn = false; //SWITCH to turn Collision visible
	showMessage = "";
	currentDay = 1; //start on day 1
	currentNight = 0;
	dayTimer = 0;
	nightTimer = 0;
	currentTime = "DAY";
	visibility = 70;
	menuIndex = 0;
	canSpawn = true;
}


