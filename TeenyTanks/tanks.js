var ctx;
var canvas;
var boxWidth; 
var boxHeight; 
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
var aEnemyHit;
var aCrater;
var aEnemyShoot;
var aDestroyed;
var aPlayerHit;
var aFlame;
var aLaser ;
var aMissile; 
var aSniper; 
var aMove; 
var aWallHit; 
var aSplash;
var aMorning;
var aSelect;
var aEquip;
var menuSound;
var fps = 25;
var intervalID; //Game loop var
var blockSize = 32; //BASE SIZE OF EACH ENTITY
var missileID;
var enemySpawnID;
var blocksX = 25; // Board Length
var blocksY = 20; // Board Height
var MAX_ENERGY = 100;
var MAX_ARMOUR = 100;
var wallOn = false; //SWITCH to turn Collision visible
var missileRe, laserRe, flameRe, snipeRe; //Weapon RELOAD
var healthRe, armourRe, energyRe, buffRe, debuffRE; //Powerup RELOAD
var menuID; // Index of list @ Menu
var showMessage = ""; // Message displayed in middile of screen
var showTimer;
var currentDay = 1; //start on day 1
var currentNight = 0;
var dayTimer = 0;
var nightTimer = 0;
var currentTime = "DAY";
var gamestate = "MENU"; //PAUSE, MENU
var visibility = 70; // Controls view distance at Night
var menuIndex = 0;
var highScore = 0;
var canSpawn = true; //Set enemies to be spawned
var kbdelay; // Protects against keyboard inputs running too many times
var kbfree = true;
var soundOn = true;

//# Bullet Object
//# Changes state using fire, missile, sniper, laser vars
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
}

function Passable(){
	
}

//# Main player, created as a function to allow possible multi-player
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
	this.armour = 0;
	this.collided = false;
	this.dead = false;
	this.weapon = "laser"; //starting off weapon
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
	this.hurtID;
}

//# Enemies created at random from spawnpoints
function Enemy ( name, x, y) { 
	this.name = name;
	this.colour = rgb(rand(0,255),rand(0,255),rand(0,255));
	this.width =  blockSize ;
	this.height = blockSize ;
	this.x = x;
	this.y = y;
	this.tarX = 0;
	this.tarY = 0;
	this.lastX;
	this.lastY;
	this.dx = 0;
	this.dy = 0;
	this.speed = rand(1,2);
	this.life = 100;
	this.spawnID = rand(0,9999);
	this.rot = 0;
	this.rotate = 0;
	this.moving = true;
	this.lastPath;
	this.radius = 60;
	this.canFire = true;
	this.missileID;
	this.sound = aEnemyShoot;
}

//# Standard collision object.
//# water attribute controls bullet collision
function Wall (x, y){
	this.x = x;
	this.y = y;
	this.width = blockSize;
	this.height = blockSize;
	this.colour = "white";
	this.damaged = false;
	this.water = false;
	this.side = false;
}
//# Left after a missile is fired.
function Crater (x,y){
	this.x = x;
	this.y = y;
	this.life = 40 + rand(5,20); //Create random spans for each
	this.height = 20;
	this.width = 20;
	this.rot = rand(0, 360);
	}

//ACCEPTABLE TYPES: HEALTH, ARMOUR, ENERGY, POWER
//# Poweup spawn point
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
	this.respawnID;
}

//WEAPON BLOCK
//# Weapon spawn point
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
	this.respawnID;
}

//# Begins free to spawns, when linked enemy is spliced; sets = free;
function SpawnPoint(x,y,free,spawnID){
	this.x = x;
	this.y = y;
	this.free = free;
	this.spawnID = spawnID; //Used to Link Enemy/Spawn Point
	this.night = false;
	//# No validation of two existing at the same time, 0.01% chance of happening
}

//# Used for Night Time Fog
function Pixel(x,y){
	this.x = x;
	this.y = y;
	this.visible = false;
	this.colour = "black";
	this.height = 32;
	this.width = 32;
}

//# WayPoint / Path Node - functions in moveEnemy 
function Path(x,y){
	this.x = x;
	this.y = y;
	this.colour = "black";
	this.height = 32;
	this.width = 32;
}

var level = [						//X = Night Spawns
	"*************************",	//7 = LEFT SIDE
	"7O  H  OE WW  O  O  WNOO9",	//* = 32x32 WALL
	"7OOSWO OOEO   O XO   EOO9",	//9 = RIGHT SIDE
	"7 WWWWWX  1223O W  1223 9",	//W = WALL
	"7O O  O  O4556  WO 4556 9",	//5 = FULL WATER
	"7 123WOO O4556O W  4556O9",	//6 = RIGHT WATER
	"7 456W    088=  WO 4556 9",	//4 = LEFT WATER
	"7O456OEO O    OWW  4556O9",	//2 = BOTTOM WATER
	"7 456O O    P O  O 088= 9",	//8 = TOP WATER
	"7 08=O  XE O  O  OO  X O9",	//1 = LEFT CORNER
	"7O  O O1223OW1223   WF  9",	//3 = RIGHT CORNER
	"7  WO  4556OW4556XEWWW O9", 	//0 = BOTTOM LEFT
	"7OOWWW 4556OO4556OO   OO9",	//P = Player
	"7  WE O088=WO088=  1223 9",	//E = Enemy/Spawnpoint
	"7  W    O    O   O 4556O9",	//F = FLANETHROWER
	"7OE O O   XAOO O OO4556 9",	//M = MISSILE
	"7OO1222222223      088= 9",	//L = LASER
	"7  4555555556O O WO  O O9",	//S = SNIPER
	"7LO088888888=OWWMWO  OBO9",	//REST = BUFFS
	"*************************",]	// EACH CHAR = 32x32

var KEY = {
	W: 87,
	S: 83,
	D: 68,
	A: 65,
	F: 70,
	G: 71,
	M: 77,
	LEFT: 37,
	UP: 38,
	RIGHT: 39,
	DOWN: 40,
	SHIFT: 16,
	ENTER: 13,
	SPACE: 32,
	ESCAPE: 27,
}
//# Level arrays - cleared on NewGame
var bullets = [];
var ebullets = [];
var enemies = []; 
var craters = [];
var walls = [];
var names = ["George", "Harry", "Frank", "Bill", "Fred", "Dennis","Dave","Monty","Homer","Steven"]; //Enemy Names
var players = []; 
var powerups = [];
var spawnpoints = [];
var pressedKeys = [];
var weapons = []; // Weapon Data
var pixels = []; // CHECK FOG OF WAR
var paths = []; // WAYPOINTS FOR ENEMIES

//Automatically called function once page is loaded
$(function(){ 
	//get the canvas which is the drawing area on the web page. it is a container
	canvas = document.getElementById('canvas');
	//get the 2d drawing context for the canvas
	ctx = canvas.getContext('2d');

	//Assign images src
	boxWidth = ctx.canvas.width;
	boxHeight = ctx.canvas.height;
	//# Background image was stitched together in TILED, a program which assembles tilesets
	//# The chosen tileset was obtained from here, which is released under a public license
	//# http://opengameart.org/content/lpc-a-shootem-up-complete-graphic-kit
	//# Many of the images were taken from this tiletset, such as the walls, water, platforms.
	bg.src = "images/bg.png";
	crater.src = "images/crater.png"; // Quick alpha object created to simulate some ground damage
	wallImage.src = "images/wall.png";
	platform.src = "images/platform.png";
	wallDamaged.src = "images/damagedwall.png";
	mask.src = "images/mask.png"; // Black image which dims approaching night/in menu
	missileWep.src = "images/missile_wep.png";
	flameWep.src = "images/flame_wep.png";
	laserWep.src = "images/laser_wep.png";
	sniperWep.src = "images/sniper_wep.png";
	healthPow.src = "images/health_pow.png";
	buffPow.src = "images/buff_pow.png";
	energyPow.src = "images/energy_pow.png";
	armourPow.src = "images/armour_pow.png";
	//# The player image was taken from a tutorial in Python which I thought could be useful
	//# Located here: http://www.emunix.emich.edu/~evett/GameProgramming/allegro_howTo.html
	tankImage.src = "images/player.png";
	enemyImage.src = "images/enemy.png";

	//Assign audio src
	aLaser = new Audio("sounds/laser.mp3")
	aMissile = new Audio("sounds/missile.mp3");
	aSniper = new Audio("sounds/sniper.mp3");
	aMove = new Audio("sounds/tank_move.mp3");
	aWallHit = new Audio("sounds/missile_wall.mp3");
	aSplash = new Audio("sounds/water.mp3");
	aMorning = new Audio("sounds/wakeup.mp3");
	aSelect = new Audio("sounds/select.mp3");
	aEquip = new Audio("sounds/equip.mp3");
	aFlame = new Audio("sounds/flame.mp3");
	aPlayerHit = new Audio("sounds/ehit.mp3");
	aEnemyHit = new Audio("sounds/phit.mp3");
	aCrater = new Audio("sounds/crater.mp3");
	aDestroyed  = new Audio("sounds/destroy.mp3");
	aEnemyShoot  = new Audio("sounds/enemyShoot.mp3");
	aMusic = new Audio("sounds/music.mp3");
	aMusic.volume = 0.3;

	//# Loop the background music
	aMusic.addEventListener('ended', function() {
    	this.currentTime = 1;
    	this.play();
	}, false);
	aMusic.play();

	//Attempt to gather and store previous High Scores
	// Taken and implemented from Tutorial code
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
});
// HANDLES THE MAP GENERATION
//# Takes input from 'level' var.
//# Each row is checked and sliced into substrings;
//# Each substring detected is checked agains the below list for it's effect.
//# ** Ran each NewGame and initially to give a game in the background.
function createLevel(){
	x = 0, y = 0;
	for (row = 0; row < level.length; row++ ){
		substring = level[row].split('');
		for (col = 0; col < level[row].length; col++){
			//##### SIDE COLLISIONS#######//
			//##### Top / Sides of Map
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
			//##### Corresponds to KEYPAD order.
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
			
			//##### GENERAL OBJECTS #######//
			//##### Powerps, normal Wall, Enemies, Players
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
				p = new Weapon("laser","BLUE", x, y);
				weapons.push(p);
			}
			if (substring[col] =='O'){
				p = new Path(x, y);
				paths.push(p);
			//#####
			//##### GENERAL COLLISIONS#######//

			}
			x += 32;
		}
		y += 32;
		x = 0;
	}

}
// MAIN GAME LOOP
//# Loop different loops depending on gamestate
//# Esc > Exit to Main Menu = "MENU" state.
//# Lazy way of ENUM.
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
		clear();
		addEnemy();	
		getInput();		
		checkCollision();
		moveEnemy();	
		moveBullets();
		movePlayer();	
		draw();
		updateLives();
		checkDestroyed();
	}
}
//CLEARS THE SCREEN
//# Wipes the canvas of previous loop draw()
function clear() {	
	ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
}


//CREATES VISION BLOCKING
//# Generates the list used to determine which pixel blocks
//# are available to view at night.
function fogOfWar(){
	pixels = []; 
	var x = 0, y = 0; //# Loop functions similar to createLevel();
	for (var row = 0; row < 20; row++ ){ 
		for (var col = 0; col < 25 ; col++){ 
			p = new Pixel(x, y);
			//# Check all pixels to see if they collide with player
			if (checkCollideWithFog(p)){
				p.visible = true; //# If yes, 32x32 pixel isn't blacked out.
			}
			pixels.push(p);
			x += 32;
		}
		y += 32; // Increase each row per iteration
		x = 0;
	}
}

//# Allows using RGB values as colours, useful for randomizing colours for debugging.
function rgb(r,g,b) {
    return 'rgb(' + [(r||0),(g||0),(b||0)].join(',') + ')';
}

function playAudio(sound, play, volume){
	if (soundOn){
		if (volume){
			sound.volume = volume;
		}
		if (play){
			sound.currentTime = 0;
			sound.play();
		} else if (!play) {
			sound.currentTime = 0;
			sound.pause();
		}
	}
}


function updateLives(){
	/*SUBTRACT LIVES FROM BULLETS*/
	$.each(bullets, function(b, val){
		if (!bullets[b].snipe){ //If bullet is not a sniper
			bullets[b].life--; //Subtract a life
		}
	});

	/*SUBTRACT LIVES FROM eBULLETS*/
	$.each(ebullets, function(b, val){
		if (ebullets[b]) {
			ebullets[b].life--; //Subtract a life
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

//# Splices objects that have been destroyed in the previous loop.
function checkDestroyed(){
	//if bullet is destroyed, create crater and destroy bullet
	$.each(bullets, function(b, val){
		bullet = bullets[b];
		if (bullet != undefined){
			if (bullet.life <= 0) {
				if (!bullet.hitTarget && !bullet.laser && !bullet.onWater 
					&& !bullet.flame && bullet.missile){
						c = new Crater(bullet.x - player.width/2, bullet.y - player.height/2);
						craters.push(c);
						playAudio(aCrater,true, 0.1);	
				}
				//# Play splash if missile
				if (bullet.onWater && bullet.misisle ){
					playAudio(aSplash,true, 0.15);
				}
					
				bullets.splice(b, 1); //# Same functionality as 'delete'
			} 
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
				clearInterval(enemies[e].missileID);
				$.each(spawnpoints, function(s, val){
					spawnpoint = spawnpoints[s];
					//# Find linked spawnID Enemy and free it up
					if (enemy.spawnID == spawnpoint.spawnID){
						spawnpoint.free = true;
						spawnpoint.spawnID = 0;
					}
					spawnpoints[s] = spawnpoint;
				});	

				playAudio(aDestroyed, true, 0.20);
				enemies.splice(e,1);
				player.score +=100; //# 1 KILL = 100
				player.killed++;	//# Incremented
			}
		}
	});
	
}

//#	Selects a random free spawnpoint and checks if the board is full
//# Additional spawns are available at night denoted by 'X' in the level var.
//# Spawned enemies movement is assigned from moveEnemy()
function addEnemy(){
	if (canSpawn){
		clearInterval(enemySpawnID);
		freeSpawns = []; //Blank list for available spawnpoints
		$.each(spawnpoints, function (s, val){
			spawnpoint = spawnpoints[s];
			if (spawnpoint.free){ //# Only allow day spawnzones at daytime
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

			//# If player is on spawn point, dont spawn
			if (!checkCollideWithPlayer(e)){
				enemies.push(e);
			}
			//# Update SpawnPoint details
			spawnpoints[key] = s;	
	
		} 

		//# Respawn time increases with each passing night
		var interval = rand(5,8) * 1000 - (500 * currentNight); //create random timing for another check
		enemySpawnID = setInterval(function(){canSpawn = true;}, interval);	
		canSpawn = false;
	}
}

//# Runs through each enemy on the board and checks two things:
//# 1. Is the enemy at it's target destination; if so, assign a new random one
//# 2. Check to see if player is moving (not near player); 
//# 					increase speed/slow and fire bullets when neccesary.
function moveEnemy(){
	function nextPath(x,y,dx,dy,rot){
		this.x = x;
		this.y = y;
		this.dx = dx;
		this.dy = dy;
		this.rot = rot;
	}
	function Bullet(x,y,dx,dy,colour){
		this.x = x;
		this.y = y;
		this.dx = dx;
		this.dy = dy;
		this.speed = 4;
		this.radius = 3;
		this.width = this.radius;
		this.height = this.radius;
		this.colour = "white";
		this.life = 40;
		this.power = 5;
		this.hitTarget = false;
		this.colour = colour;
		this.onWater = false;
	}
	function createBullet(e,x,y,rot,colour){
		enemies[e].canFire = false;
		enemies[e].missileID = setInterval(function(){ //Reset bullet reload
			if (enemies[e] != undefined){
				enemies[e].canFire = true; 
				clearInterval(enemies[e].missileID);
			}
		}, 1000); 

		// turn angle into DX/DY
		dx = parseFloat(Math.cos(rot) ) ;
		dy = parseFloat(Math.sin(rot) );            
		b = new Bullet(x,y,dx,dy,colour);

		//Push into array, slight lag behind current player x/y
		ebullets.push(b);

		playAudio(enemy.sound, true, 0.15)
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
				rot = 0;
				// Decide if enemy needs to move in X or Y
				if ((p.x == e.x)){

					if (e.y < p.y){
						dy = 1;
						rot = 180;
					} else {
						dy = -1;
						rot = 0;
					}
					next = new nextPath(p.x,p.y,0,dy,rot)
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
				//_ Temporary object to represent virtual steps
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

			e.rot = destination.rot;

			e.x += e.dx * e.speed; 
			e.y += e.dy * e.speed; 
		
		} else {
			//# Being within immediate radius = shooting and stop
			if (checkRadius(e,e.radius)){	
				//# Snippet from: https://gist.github.com/conorbuck/2606166
				//# Calc degrees from player to enemy so enemy can face

				distanceX = (player.y + player.height/2) - (e.y + e.height/2);
				distanceY = (player.x + player.height/2) - (e.x + e.width/2);

				x = e.x + (e.width/2) ;
				y = e.y + (e.height/2);
				//# Slightly alter the angle, allowing for some sense of missing
				bulletAngle = Math.atan2(distanceX + player.dx + rand(-25,25), distanceY + player.dy + rand(-15,15)) ;//* 180 / Math.PI;
				drawAngle = Math.atan2(distanceX, distanceY) * 180 / Math.PI + 90;

				//Draw rotation variable
				e.rotate = drawAngle;

				//#Create Bullet if allowed
				if (e.canFire){
					createBullet(en,x,y,bulletAngle,e.colour);
				}

			//# Being within wider radius = shooting and dont stop
			} else {
				//clearInterval(e.missileID);
				//e.canFire = true;
				e.rotate = e.rot;
				e.x += e.dx * e.speed; 
				e.y += e.dy * e.speed; 
			}
		}
		enemies[en] = e;
	});
}
//# Handles all keyboard input.
//# Most effects are sudden, such as a bullet being created,
//# energy being used up, brought to menu etc.
function getInput(){
	if (pressedKeys[KEY.W]){
		//move PLAYER UP
		player.dx = 0;
		player.dy = -1;
		player.up = true;	//Assign direction value to help rotation
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
	if (player.canFire){ //# Only allow fire if timer expired
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
		//Use up Energy to gain speed
		if (player.energy > 0 && pressedKeys[KEY.SHIFT]){
			player.speed = player.baseSpeed * 1.5;
			player.energy -= 1.5;
		} 
	}

	if (pressedKeys[KEY.ESCAPE]){
		//Menu entry
		player.pause = true;
		menuIndex = 0;
		gamestate = "MENU";
				
		}

	//Temporary fix for double input
	if (pressedKeys[KEY.M] && kbfree){
		kbfree = false;
		kbdelay = setInterval(function(){
			kbfree = true; clearInterval(kbdelay);
		}, 100);
		if (aMusic.duration > 0 && !aMusic.paused) {
			aMusic.pause();
		} else {
			aMusic.play();
		}
	}

	if (pressedKeys[KEY.G] && kbfree)
	{
		kbfree = false;
		kbdelay = setInterval(function(){
			kbfree = true; clearInterval(kbdelay);
		}, 100);

		if (soundOn) {
			soundOn = false;
		} else {
			soundOn = true;
		}
	}
	
	//Cancel speed plus and regain energy
	if ( player.energy <= 0 || !(pressedKeys[KEY.SHIFT])){
			player.speed = player.baseSpeed;
			if (player.energy < MAX_ENERGY)
				player.energy+= 0.75;;
		}		
}
//# Bullets spawns at current position (before collision/player movement) so slightly off.
function createBullet(x, y, dx, dy, rot){
		player.canFire = false;
		missileID = setInterval(function(){ //Reset bullet reload
			player.canFire = true; clearInterval(missileID);
		}, checkRof(player.weapon)); 

		weapon = player.weapon; //Grab weapon name
		b = new Bullet(x, y, dx, dy, checkWeapon(weapon), //Assign weapons stats
			checkSpeed(weapon), checkColour(weapon), rot);

		/* Each weapon has their own uniquities*/
		if (weapon == "sniper"){
			b.radius = 2;
			b.snipe = true;
			b.image = bSniper;
			playAudio(aSniper, true, 0.15);
		}
		if (weapon == "laser"){
			b.radius = 3;
			b.laser = true;
			b.image = bLaser;
			playAudio(aLaser, true, 0.15);
		}
		if (weapon == "flame"){
			b.radius = 3;
			b.flame = true;
			playAudio(aFlame, true, 0.15);
			b.image = bFlame;
		}
		if (weapon == "missile"){
			b.missile = true;
			b.image = bMissile;
			playAudio(aMissile, true, 0.15);
		}
		//Push into array, slight lag behind current player x/y
		bullets.push(b);
			
}
//#	Handles every collision: bullets vs enemies, player vs wall etc.
//#	Uses $.each to temporarily edit objects then reinsert back to list.
//#	ANY physical calculations are handled here before draw().
function checkCollision(){
	
	$.each(bullets, function(b, val){
		bullet = bullets[b];
		//FOR EACH BULLET, CHECK EACH ENEMIES
		$.each(enemies, function(e, val){
			enemy = enemies[e];
			if (checkCollide(bullet, enemy)){
				bullet.life = 0;
				enemy.life -= bullet.power;
				playAudio(aEnemyHit, true, 0.05);
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

		//#	Walls include invisible walls acting as lakes.
		$.each(walls, function(w, val){
			wall = walls[w];
			if (checkCollide(bullet, wall )){		
				if (wall.water){ //Check if colliding with water
					bullet.onWater = true;
				} 			
				if (!bullet.onWater){
					bullet.life = 0;
					bullet.hitTarget = true;
					bullet.dx = 0;
					bullet.dy = 0;
				}
				//#	Missiles can damage walls.
				if (bullet.missile && !bullet.onWater){ 
					wall.damaged = true;
					playAudio(aWallHit, true, 0.2);
				}
			} 
		});

		//#	At night, flamethrower greatly increases vision.
		if (bullet.flame && currentTime=="NIGHT"){
			//Iterate through each pixel (32x32 grid)
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
			player.collided = true; //Handled in MovePlayer()
		}
		
	});

	$.each(ebullets, function(b, val){
		bullet = ebullets[b];
		//FOR EACH BULLET, CHECK IF HITTING PLAYER
		$.each(enemies, function(e, val){
			enemy = enemies[e];
			if (bullet != undefined){
				if (checkCollideWithPlayer(bullet) && !bullet.hitTarget){
					bullet.life = 0;
					player.armour -= bullet.power;
					playAudio(aPlayerHit, true, 0.05);
					bullet.hitTarget = true;
					bullet.dx = 0;
					bullet.dy = 0;
				}
			}
			enemies[e] = enemy;
		});

		ebullets[b] = bullet;
	});

	$.each(ebullets, function(b, val){
		bullet = ebullets[b];
		//FOR EACH BULLET, CHECK IF HITTING PLAYER
		if (bullet != undefined){
			if (bullet.life <= 0) {			
				ebullets.splice(b, 1); //# Same functionality as 'delete'
			} 	
		}
	});

	//# Check if enemy bullet is hitting wall
	$.each(ebullets, function(b, val){
		bullet = ebullets[b];
		$.each(walls, function(w, val){
			wall = walls[w];
			if (bullet != undefined){
				bullet.onWater = false;

				if (checkCollide(wall, bullet)){
				
					if (wall.water){ //Check if colliding with water
						bullet.onWater = true;
					} 			
					if (!bullet.onWater){
						bullet.life = 0;
						bullet.hitTarget = true;
						bullet.dx = 0;
						bullet.dy = 0;
					}
					
				}
			ebullets[b] = bullet;
			}
			
		});

		//FOR EACH BULLET, CHECK IF HITTING PLAYER
		if (bullet != undefined){
			if (bullet.life <= 0) {			
				ebullets.splice(b, 1); //# Same functionality as 'delete'
			} 	
		}
	});

	//CHECK COLLISION BETWEEN PLAYER/POWERUP
	//# Each powerup collision checks if it's spawned, if so:
	//# Activate it's effect, set respawn timer.
	//# Later nights increase spawn times, adding difficulty.
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
						clearInterval(healthRe)}, 15000 + increase);
					break;
				case "armour":
					player.armour += 20;
					armourRe = setInterval(function(){powerups[p].spawned = true; 
						clearInterval(armourRe)}, 15000 + increase);
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

	//CHECK COLLISION BETWEEN PLAYER/WEAPON BLOCK
	//# Acts the exact same way as the above powerup collision.
	//# Has a shorter respawn penalty as you advance
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
	//# Colliding with an enemy flags a collide,
	//# deals damage and gives the player a brief immunity.
	$.each(enemies, function(e, val){
		enemy = enemies[e];
		if (checkCollideWithPlayer(enemy)){
			player.collided = true;
			if (!player.hurt){
				
				player.hurt = true; 
				player.armour -= 25;
				//# 1.5 seconds immunity after hit.
				hurt = setInterval(function(){ 
					player.hurt = false; clearInterval(player.hurtID);
				}, 1500);
			}
		}
		enemies[e] = enemy;
	});

	//CHECK COLLISION WITH CRATERS
	//# Spawned after a missile has landed on the ground,
	//# a crater slows the players speed: stacking craters = more loss.
	$.each(craters, function(c, val){
		if (checkCollideWithPlayer(craters[c])){
			player.dx -= player.dx * 0.1;
			player.dy -= player.dy * 0.1;
		}
	});
	
}
//# Handles damage calculation and new x,y after collision checks.
//# Player DX/DY directions are set here, and rotations
//# Upon player death, a menu screen is shown.
function movePlayer(){

	//# Subtract minus armour from life if no armour exists
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
		//Incrememnt score bonus by staying alive
		player.score += (currentDay * 200) + (currentNight * 200);
		gamestate = "MENU";

	}

	//If DX/DY are true, player is moving
	if (player.dx != 0 || player.dy != 0){
		player.moving = true;
	} else {
		player.moving = false;
	}

	//# Player touched enemy/wall in collision funct
	if (player.collided){
		player.x -= player.dx * player.speed * 0.1; // knock back slowly
  		player.y -= player.dy * player.speed * 0.1; // Simulates small judder effect
    	player.collided = false;
	} else {
		player.x += player.dx * player.speed;
    	player.y += player.dy * player.speed;
    	player.dx = 0;
		player.dy = 0;
	}

	//CHECK ROTATION
	//# Checks directional vars and calculates rotation
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

//# Takes in two objects and returns if they are overlapping
//# Snippet of code taken from:
//# http://blog.sklambert.com/html5-canvas-game-2d-collision-detection/
//# This has been edited to accomodate my code and lessen usability
function checkCollide(obj1, obj2){ 
	object1 = obj1;
	object2 = obj2;
	if (object1.x < object2.x + object2.width  && object1.x + object1.width  > object2.x &&
    object1.y < object2.y + object2.height && object1.y + object1.height > object2.y) {
		return true;
	}
}

//# Used to generate FOG/Overlay for Nighttime
function checkCollideWithFog(obj2){

	object1 = new Player();
	object2 = obj2;

	// Doesnt let visibility px drop below 40
	if (visibility < 40){
		visibility = 40;
	}

	// Decrease player X,Y by visibility: then increase height/width by vis *2
	// Simulates creating a large square around the player
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

//# Used to determine if the enemy is within shooting distance of enemy
function checkRadius(enemy,r){
	//# Temp solution to create obj with similar vars
	function tempObj(x,y) {
		this.x = x;
		this.y = y;
		this.height = 32;
		this.width = 32;
	}

	object1 = new tempObj(enemy.x,enemy.y);
	object2 = player;

	object1.x -= r ;
	object1.y -= r ;
	object1.height += r * 2;
	object1.width += r * 2;

	ctx.fillStyle = "blue";
	ctx.fillRect(object1.x ,object1.y,object1.width,object1.height);

	if (object1.x < object2.x + object2.width  
		&& object1.x + object1.width  > object2.x 
		&& object1.y < object2.y + object2.height 
		&& object1.y + object1.height > object2.y) {
			return true;
	}

}

//# Checks if a object hits the player before collision is checked
//# Very timey-wimey way of fixing things
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

	//# Move enemy bullets.
	$.each(ebullets, function(b, val){
		bullet = ebullets[b];

		bullet.x += bullet.dx * bullet.speed;//* bullet.speed; //calculate new position of x
		bullet.y += bullet.dy * bullet.speed;///* bullet.speed; //calculate new position of Y
		ebullets[b] = bullet;
	});
}

//# Takes in a min and max number, returns between that
//# Saves repeating code over and over.
function rand(min, max){
	ran = Math.floor((Math.random() * max) + min);
	return ran;
}

//# Tracks the Day/Night cycle going on
function checkTime(){
	//# Tracks kills on entry to D/N
	killed = 0;
	if (currentTime == "DAY"){
		if (dayTimer >= fps * 25){	
			clearInterval(showTimer);			
			currentNight++;;
			nightTimer = 0;
			killed = player.killed; //# 4 Kills at night = bonus score
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
			playAudio(aMorning, true, 0.5); //# Play Morning sound
		} else 
			nightTimer+= 1;
	}
}

/* CHECK FUNCTIONS */
//# Returns weapon stats from weapon input
//# Probably not the best way to do it.
function checkWeapon(weapon){
	power = 0;
	switch (weapon){
		case "laser":
			power = 20;
			break;
		case "flame":
			power = 5;
			break;
		case "missile":
			power = 30;
			break;
		case "sniper":
			power = 15;
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
			speed = 3;
			break;
		case "flame":
			speed = 4;
			break;
		case "missile":
			speed = 4;
			break;
		case "sniper":
			speed = 9;
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
			life = 40;
			break;
		case "flame":
			life = 30;
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
/* END WEAPON CHECKS */


//# Function found to handle drawing images much easier.
//# Use of rotational blitting gives less need for sprites/more complex mechanics.
//# REFERENCE: 
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

//# Responsible for all drawing to the screen.
//# Also handles dimming the screen using Alpha
//# 
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

	//draw enemy bullets
	$.each(ebullets, function(b, val){	
		bullet = ebullets[b];
		ctx.fillStyle = "black"; 
		ctx.beginPath(); 
		ctx.arc(bullet.x, bullet.y,bullet.radius,0,Math.PI*2,true);
		ctx.closePath();
		ctx.fill(); 
		ctx.fillStyle = bullet.colour; 
		ctx.beginPath(); 
		ctx.arc(bullet.x, bullet.y,bullet.radius - 1,0,Math.PI*2,true);
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
		drawImageRot(enemyImage, enemy.x, enemy.y, enemy.width, enemy.height, enemy.rotate);
		if (wallOn){ //If collision is pressed, show cubes.
			ctx.fillStyle = enemy.colour;
			ctx.fillRect(enemies[e].x,enemies[e].y,enemies[e].width,enemies[e].height);
		}
	});

	//# Handles drawing enemy names.
	//# Added for fun.
	$.each(enemies, function(e, val){
		enemy = enemies[e];
		ctx.fillStyle = "white";
		//ctx.fillText( enemy.name, enemy.x , enemy.y - 13);
		// ctx.fillText( enemy.tarX + " " +enemy.tarY, enemy.x , enemy.y - 26);
		// ctx.fillText( enemy.dx + " " +enemy.dy, enemy.x , enemy.y - 13);

		//IF ALIVE, DRAW HP BAR
		//# Drawing a red bar behind a green bar, simulates a depleting bar.
		if (enemy.life > 0){
			ctx.fillStyle = "red";
			ctx.fillRect(enemy.x, enemy.y - 5 , 100/3.5, 3)
			ctx.fillStyle = "green";
			ctx.fillRect(enemy.x, enemy.y - 5 , enemy.life /3.5, 3);
		}
	});

	
	/* Reduces transparency of masking overlay depending on current time*/
	//# These calculations are suited towards 30 seconds per day and night cycle.
	if (currentTime == "DAY"){
			ctx.globalAlpha = 0.4 + (dayTimer *0.001) - 0.2;
		} else if (currentTime == "NIGHT"){
				ctx.globalAlpha = 0.9;
		}

	//# Reset alpha before drawing UI
	ctx.drawImage(mask, 0,0);	
	ctx.globalAlpha = 1;

	//# FOG Overlay at Night
	if ( currentTime == "NIGHT"){
		$.each(pixels, function (p, val){
			pixel = pixels[p];
			if (pixel.visible == false){
				ctx.fillStyle = pixel.colour;
				ctx.fillRect(pixel.x, pixel.y, pixel.width, pixel.height);
			}
		});
	}	

	//# Draw bottom UI bar
	ctx.fillStyle = "black";
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
	ctx.fillText("SCORE: " + player.score, boxWidth - 195, boxHeight - 8);

	//OUTPUT MESSAGE IN CENTER SCREEN
	ctx.fillStyle = "white";
	ctx.font = "22pt Arbutus";
	ctx.fillText(showMessage, 350, 100);
	
	//# Draw top UI bar
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, 800, 20);

	//# OUTPUT TOP UI DATA
	ctx.font = "10pt Arbutus";
	ctx.fillStyle = "grey";
	if (currentTime=="DAY")
		ctx.fillStyle = "yellow";
	ctx.fillText("CURRENT DAY:  " + currentDay, 25, 15);

	ctx.fillStyle = "grey";
	if (currentTime=="NIGHT")
		ctx.fillStyle = "yellow";
	ctx.fillText("CURRENT NIGHT:  " + currentNight, 200, 15);

	ctx.font = "9pt Arbutus";
	ctx.fillStyle = "white";
	ctx.fillText("Weapons/Boosts respawn increased by " + currentDay * 2 + " seconds", 400, 15);

}

//Controls the menu for NewGame, Pausing etc
//# Allows for easy addition of menu items
function menu(){

	//Start-off position of list [0]
	index = menuIndex;

	//Show game in background @ 0.5 opacity
	ctx.globalAlpha = 0.5;
	ctx.drawImage(mask, 0,0);	
	ctx.globalAlpha = 1;

	//# Stores menu items
	menuItems = {"new" : "NEW GAME",};
	pauseItems = {"return" : "RETURN TO GAME", "exit" : "EXIT TO MENU"};
	list = []; //store item objects

	//# Class for ListItems
	function Item(x,y,width,height,id,text){
		this.x = x;
		this.y = y;
		this.width = width; 
		this.height = height;
		this.id = id;
		this.text = text;
		this.selected = false;
	}

	indentY = 0; //Used to easily add new information lines

	//#SHOW ENDING SCREEN #//
	if (player.dead){

		//#Set NEW HIGH SCORE
		if(highScore == 0 || player.score > highScore){
			try{
				localStorage.setItem("highScore", player.score);
			}catch(e){
				alert("problem storing data");
			}
		}

		goX = 250;
		goY = 120;
		goWidth = 300;
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
		ctx.fillText("YOU SURVIVED: " + currentDay + " DAY(S): "+currentDay*200,  textX, textY); textY += spacing;
		ctx.fillText("YOU SURVIVED: " + currentNight + " NIGHT(S): " + currentNight *200,  textX, textY); textY += spacing;
		ctx.fillText("ENEMIES KILLED: " + player.killed + ".",  textX, textY); textY += spacing;
		ctx.fillText("YOU SCORED: " + player.score, textX, textY); textY += spacing;
		
		ctx.font = "10pt Arbutus";
		if (player.score > highScore){
			ctx.fillStyle = "gold";
			ctx.fillText("NEW HIGH SCORE OF " + player.score + "!",  textX, textY); textY += spacing;
			ctx.fillStyle = "white";
		} else {
			ctx.fillStyle = "gold";
			ctx.fillText("HIGHSCORE TO BEAT: " + highScore,  textX, textY); textY += spacing;
			ctx.fillStyle = "white";
		}
	} 

	menuX = 250; //begin draw
	menuY = 120 + indentY;
	width = 300; //block vars
	height = 64;


	ctx.fillStyle = "white";
	ctx.font = "25pt Arbutus";
	ctx.textAlign = 'center';
	if (player.dead){
		ctx.fillText("GAME OVER", menuX + width/2, 100);
	} else 
		ctx.fillText("TEENY TANKS", menuX + width/2, 100);
	

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


	//# Menu navigation with keys
	if (pressedKeys[KEY.UP] && kbfree){
		kbfree = false;
		list[index].selected = false;
		index--;
		if (index < 0)
		{
			index = list.length - 1;
		} 
		list[index].selected = true;
		playAudio(aSelect, true, 0.2);
		kbdelay = setInterval(function(){
			kbfree = true; clearInterval(kbdelay);
		}, 100);
	} else if (pressedKeys[KEY.DOWN] && kbfree ){
		kbfree = false;
		list[index].selected = false;
		index++;
		if (index > list.length - 1)
		{
			index = 0;
		} 
		list[index].selected = true;
		playAudio(aSelect, true, 0.2);
		kbdelay = setInterval(function(){
			kbfree = true; clearInterval(kbdelay);
		}, 100);
		
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

	if (pressedKeys[KEY.ENTER] && kbfree){
		kbfree = false;
		$.each(list, function (i, val){
			item = list[i];
			if (item.selected)
			{
				//# Handles each button press;
				if (item.id == "new"){				
					newGame();
					gamestate = "INGAME"
				}				
				if (item.id == "return"){
					player.pause = false;
					gamestate = "INGAME";
				}
				if (item.id == "exit"){
					player.pause = false;
					player.dead = true;
				}
				menuIndex = 0;		
			}
		});
		kbdelay = setInterval(function(){
			kbfree = true; clearInterval(kbdelay);
		}, 100);

	}

	ctx.fillStyle = "YELLOW";	
	ctx.fillText("Play in Fullscreen (F11) if the window scrolls as you play, or zoom out!", boxWidth - 400, boxHeight -150);
	ctx.fillText("MADE BY OGRAN", boxWidth - 100, boxHeight -40);
}

function newGame(){
	//clean arrays before going into main loop
	bullets = [];
	ebullets = [];
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

	//Attempt to gather and store previous High Scores
	// Taken and implemented from Tutorial code
	if(typeof(localStorage)!="undefined"){
		try{
			highScore = localStorage.getItem("highScore");
			if (highscore)
			highScore = 0;
		}catch(e){
		}
	}else{
		alert("Does not support local storage");
	}

	//Restore level objects
	createLevel();

	wallOn = false; //SWITCH to turn Collision not visible
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


