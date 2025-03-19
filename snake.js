
//the canvas used to draw the state of the game
var ctx;

var config = new Object();
config.grid_size = 20;
config.number_obstacles =12;
config.square_size = 25;
config.snake_length = 5;
config.search = 'BFS';
config.runTimeout = 0;

function init() {
    var canvas = document.getElementById('canvas');
    canvas.width = config.grid_size * config.square_size;
    canvas.height = config.grid_size * config.square_size;

    ctx = canvas.getContext("2d");

    var message = new Object();
    message.do = 'init';
    message.config = config;
    worker.postMessage(message);

    change_search();
}

//Redraw the screen based on the state of the game, which is passed from the worker
function refresh_view(data){

	console.log(data);
	if(data.stats.food >= 100)
		stop();

	document.getElementById('moves_val').innerHTML = data.stats.moves;
	document.getElementById('food_val').innerHTML = data.stats.food;
	document.getElementById('avg_moves_val').innerHTML = data.stats.moves/(data.stats.food);
	document.getElementById('avg_nodes_val').innerHTML = data.stats.count/(data.stats.food);

	for(var i=0;i<config.grid_size;i++){
		for(var j=0;j<config.grid_size;j++){
			switch(data.squares[i][j]){
			case 0:
				//empty
				ctx.fillStyle = "#000";
				ctx.beginPath();
				ctx.rect(i*config.square_size, j*config.square_size, config.square_size-1, config.square_size-1);
				ctx.closePath();
				ctx.fill();
				ctx.beginPath();
				ctx.rect(i*config.square_size, j*config.square_size, config.square_size, config.square_size);
				ctx.closePath();
				ctx.fillStyle = "#000";
				ctx.stroke();
				ctx.strokeStyle="#303d38";
				break;
			case 1:
				//path
				ctx.fillStyle = "#000";
				ctx.beginPath();
				ctx.rect(i*config.square_size,j*config.square_size, config.square_size, config.square_size);
				ctx.closePath();
				ctx.fill();
				break;
			case 3:
				//wall
				ctx.fillStyle = "#05442c";
				ctx.beginPath();
				ctx.rect(i*config.square_size,j*config.square_size, config.square_size, config.square_size);
				ctx.closePath();
				ctx.fill();
				break;
			case 2:
				//food
				ctx.fillStyle = "yellow";
				ctx.beginPath();
				ctx.rect(i*config.square_size,j*config.square_size, config.square_size, config.square_size);
				ctx.closePath();
				ctx.fill();
				break;
			case 4:
				//obstacle
				ctx.fillStyle = "#804000";
				ctx.beginPath();
				ctx.rect(i*config.square_size,j*config.square_size, config.square_size, config.square_size);
				ctx.closePath();
				ctx.fill();
				break;
			default:
				if(data.squares[i][j] == 5){
					//head
					ctx.fillStyle = "#00FF00";
					ctx.beginPath();
					ctx.rect(i*config.square_size,j*config.square_size, config.square_size, config.square_size);
					ctx.closePath();
					ctx.fill();
					break;
				}

				if(data.squares[i][j] == 10){
					//tail
					ctx.fillStyle = "#0000A0";
					ctx.beginPath();
					ctx.rect(i*config.square_size,j*config.square_size, config.square_size, config.square_size);
					ctx.closePath();
					ctx.fill();
					break;
				}
				//body
				ctx.fillStyle = "#800080";
				ctx.beginPath();
				ctx.rect(i*config.square_size,j*config.square_size, config.square_size, config.square_size);
				ctx.closePath();
				ctx.fill();
				break;				
			}
		}
	}
}


var worker = new Worker("snake-worker.js");


worker.onmessage = function (event) {
    if (event.data.type == 'move') {
        refresh_view(event.data);
    } else if (event.data.type == 'sound') {
        var sound = document.getElementById(event.data.sound + '_sound');
        sound.play();
    } else {
        console.log(event.data);
    }
};


worker.onerror = function(error) {  
	console.log(error.message);
};  


function start(){
	var message = new Object();
	message.do = 'start';
	worker.postMessage(message);
}


function stop(){
	var message = new Object();
	message.do = 'stop';
	worker.postMessage(message);
}

function pause(){
	var message = new Object();
	message.do = 'pause';
	worker.postMessage(message);
}

function resume(){
	var message = new Object();
	message.do = 'resume';
	worker.postMessage(message);
}


function change_search(){
	var message = new Object();
	message.do = 'set_search';
	message.search = document.getElementById('search').value;
	worker.postMessage(message);
}

function change_level() {
    var level = parseInt(document.getElementById('level').value);
    switch (level) {
        case 1:
            config.grid_size = 20;
            config.number_obstacles = 12;
            break;
        case 2:
            config.grid_size = 25;
            config.number_obstacles = 20;
            break;
        case 3:
            config.grid_size = 30;
            config.number_obstacles = 30;
            break;
    }

    var canvas = document.getElementById('canvas');
    canvas.width = config.grid_size * config.square_size;
    canvas.height = config.grid_size * config.square_size;

    init();
}