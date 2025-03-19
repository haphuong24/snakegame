function Point(pos_x,pos_y){
	this.x = pos_x;
	this.y = pos_y;
}

function Node(parent,point,children,g_score,h_score){
	this.parent = parent;
	this.point = point;
	this.children = children;
	this.g_score = g_score;
	this.h_score = h_score;
	this.f_score = g_score + h_score;
}


var config = new Object();
config.obstacleInterval = null;
var stats = new Object();
stats.moves = 0;
stats.food = 0;
stats.count = 0;
var squares;
var snake;
var food;
var length=0;
var moves = new Array();



function init(){
	squares = new Array(config.grid_size);
	for(var i=0;i<config.grid_size;i++){
		squares[i] = new Array(config.grid_size);
	}

	for(var i=0;i<config.grid_size;i++){
		for(var j=0;j<config.grid_size;j++){
			if(i == 0 || j == 0 || i == config.grid_size-1 || j == config.grid_size-1){
				squares[i][j] = 3;
			}else{
				squares[i][j] = 0;
			}
		}
	}
	
	snake = place_snake(config.snake_length);
	place_obstacles(config.number_obstacles);
	place_food();
	refresh_view();
}


onmessage = function (event) {
    console.log(event.data.do);
    switch (event.data.do) {
        case 'start':
            start();
            break;
        case 'stop':
            stop();
            break;
        case 'pause':
            pause();
            break;
        case 'resume':
            resume();
            break;
        case 'init':
            config = event.data.config;
            init();
            break;
        case 'set_search':
            config.search = event.data.search;
            break;
        case 'end':
            endGame();
            break;
    }
};


function run(){

	if(stats.food >= 100){
		clearTimeout(config.runTimeout);
		return;
	}
	
	if(moves.length == 0){
		//no moves left, so search for more based on the current search selected.
		switch(config.search){
			case 'BFS':
				findpath_bfs();
				break;
			case 'DFS':
				findpath_dfs();
				break;
			case 'A* - H1':
				findpath_a("H1");
				break;
			case 'A* - H2':
				findpath_a("H2");
				break;
			case 'A* - (H1+H2)/2':
				findpath_a("H1+H2");
				break;
		}
	}else{
		//we still have moves left, so move the snake to the next square.
		move(moves.shift());
	}

	refresh_view();

	clearTimeout(config.runTimeout);
	config.runTimeout = setTimeout(run, 100);
}

//Breadth First Search
function findpath_bfs(){
	postMessage("running BFS");
	// Creating our Open and Closed Lists
	var openList = new Array();
	var closedList = new Array(config.grid_size);
	for(var i=0;i<config.grid_size;i++){
		closedList[i] = new Array(config.grid_size);
	}
	//initialize closedList values to 0
	for(var i=0;i<config.grid_size;i++){
		for(var j=0;j<config.grid_size;j++){
			closedList[i][j] = 0;
		}
	}
	
	// Adding our starting point to Open List
	openList.push(new Node(null,snake[0],new Array()));
	// Loop while openList contains some data.
	while (openList.length != 0) {
		var n = openList.shift();
		if(closedList[n.point.x][n.point.y] == 1)
			continue;
		stats.count++;
		// Check if node is food
		if (squares[n.point.x][n.point.y] == 2) {

			//if we have reached food, climb up the tree until the root to obtain path
			do{
				moves.unshift(n.point);
				if(squares[n.point.x][n.point.y] == 0)
					squares[n.point.x][n.point.y] = 1;
				n = n.parent;
			}while(n.parent != null);
			break;
		}
		// Add current node to closedList
		closedList[n.point.x][n.point.y] = 1;
		
		// Add adjacent nodes to openlist to be processed.
		if(closedList[n.point.x][n.point.y-1] == 0 && (squares[n.point.x][n.point.y-1] == 0 || squares[n.point.x][n.point.y-1] == 2))
			n.children.unshift(new Node(n,new Point(n.point.x,n.point.y-1),new Array()));
	//		if(squares[n.point.x][n.point.y-1]!=2)
	//		squares[n.point.x][n.point.y-1]=10;
		if(closedList[n.point.x+1][n.point.y] == 0 && (squares[n.point.x+1][n.point.y] == 0 || squares[n.point.x+1][n.point.y] == 2))
			n.children.unshift(new Node(n,new Point(n.point.x+1,n.point.y),new Array()));
	//		if(squares[n.point.x+1][n.point.y]!=2)
	//		squares[n.point.x+1][n.point.y]=10;
		if(closedList[n.point.x][n.point.y+1] == 0 && (squares[n.point.x][n.point.y+1] == 0 || squares[n.point.x][n.point.y+1] == 2))
			n.children.unshift(new Node(n,new Point(n.point.x,n.point.y+1),new Array()));
	//		if(squares[n.point.x][n.point.y+1]!=2)
	//		squares[n.point.x][n.point.y+1]=10;
		if(closedList[n.point.x-1][n.point.y] == 0 && (squares[n.point.x-1][n.point.y] == 0 || squares[n.point.x-1][n.point.y] == 2))
			n.children.unshift(new Node(n,new Point(n.point.x-1,n.point.y),new Array()));
	//		if(squares[n.point.x-1][n.point.y]!=2)
	//		squares[n.point.x-1][n.point.y]=10;
		for(var i=0;i<n.children.length;i++){
			openList.push(n.children[i]);
		}
	}
}

//Depth First Search
function findpath_dfs(){
	postMessage("running DFS");
	// Creating our Open and Closed Lists
	var openList = new Array();
	var closedList = new Array(config.grid_size);
	for(var i=0;i<config.grid_size;i++){
		closedList[i] = new Array(config.grid_size);
	}
	//initialize closedList values to 0
	for(var i=0;i<config.grid_size;i++){
		for(var j=0;j<config.grid_size;j++){
			closedList[i][j] = 0;
		}
	}
	
	
	// Adding our starting point to Open List
	openList.push(new Node(null,snake[0],new Array()));
	// Loop while openList contains some data.
	while (openList.length != 0) {
		var n = openList.shift();
		if(closedList[n.point.x][n.point.y] == 1)
			continue;
		stats.count++;
		// Check if node is food
		if (squares[n.point.x][n.point.y] == 2) {
			//if we have reached food, climb up the tree until the root to obtain path
			do{
				moves.unshift(n.point);
				if(squares[n.point.x][n.point.y] == 0)
					squares[n.point.x][n.point.y] = 1;
				n = n.parent;
			}while(n.parent != null)
			break;
		}
		// Add current node to closedList
		closedList[n.point.x][n.point.y] = 1;
		
		
		// Add adjacent nodes to openlist to be processed.
		if(closedList[n.point.x][n.point.y-1] == 0 && (squares[n.point.x][n.point.y-1] == 0 || squares[n.point.x][n.point.y-1] == 2))
			n.children.unshift(new Node(n,new Point(n.point.x,n.point.y-1),new Array()));
		if(closedList[n.point.x+1][n.point.y] == 0 && (squares[n.point.x+1][n.point.y] == 0 || squares[n.point.x+1][n.point.y] == 2))
			n.children.unshift(new Node(n,new Point(n.point.x+1,n.point.y),new Array()));
		if(closedList[n.point.x][n.point.y+1] == 0 && (squares[n.point.x][n.point.y+1] == 0 || squares[n.point.x][n.point.y+1] == 2))
			n.children.unshift(new Node(n,new Point(n.point.x,n.point.y+1),new Array()));
		if(closedList[n.point.x-1][n.point.y] == 0 && (squares[n.point.x-1][n.point.y] == 0 || squares[n.point.x-1][n.point.y] == 2))
			n.children.unshift(new Node(n,new Point(n.point.x-1,n.point.y),new Array()));
		for(var i=0;i<n.children.length;i++){
			openList.unshift(n.children[i]);
		}
	}
}

//A* search, based on selected heuristic
function findpath_a(search_type){
	postMessage("running " + search_type);
	// Creating our Open and Closed Lists
	var openList = new Array();
	var closedList = new Array(config.grid_size);
	for(var i=0;i<config.grid_size;i++){
		closedList[i] = new Array(config.grid_size);
	}
	//initialize closedList values to 0
	for(var i=0;i<config.grid_size;i++){
		for(var j=0;j<config.grid_size;j++){
			closedList[i][j] = 0;
		}
	}
	
	// Adding our starting point to Open List
	openList.push(new Node(null,snake[0],new Array(),0,
	heuristic_estimate(snake[0],food,search_type)));
	// Loop while openList contains some data.
	while (openList.length != 0) {
		//pick the node in openset that has the lowest f_score
		openList.sort(function(a,b){return a.f_score - b.f_score})
		var n = openList.shift();
		
		if(closedList[n.point.x][n.point.y] == 1)
			continue;
		stats.count++;
		// Check if node is food
		if (squares[n.point.x][n.point.y] == 2) {
			//if we have reached food, climb up the tree until the root to obtain path
			do{
				moves.unshift(n.point);
				if(squares[n.point.x][n.point.y] == 0)
					squares[n.point.x][n.point.y] = 1;
				n = n.parent;
			}while(n.parent != null)
			break;
		}
		// Add current node to closedList
		closedList[n.point.x][n.point.y] = 1;
		
		// Add adjacent nodes to openlist to be processed.
		if(closedList[n.point.x][n.point.y-1] == 0 &&(squares[n.point.x][n.point.y-1]
			== 0 ||squares[n.point.x][n.point.y-1] == 2))
			n.children.unshift(new Node(n,new Point(n.point.x,n.point.y-1),new Array(),
			n.g_score+1,heuristic_estimate(new Point(n.point.x,n.point.y-1),food,search_type)));
		if(closedList[n.point.x+1][n.point.y] == 0 && (squares[n.point.x+1][n.point.y]
			== 0 || squares[n.point.x+1][n.point.y] == 2))
			n.children.unshift(new Node(n,new Point(n.point.x+1,n.point.y),new Array(),
		n.g_score+1,heuristic_estimate(new Point(n.point.x+1,n.point.y),food,search_type)));
		if(closedList[n.point.x][n.point.y+1] == 0 && (squares[n.point.x][n.point.y+1] 
			== 0 || squares[n.point.x][n.point.y+1] == 2))
			n.children.unshift(new Node(n,new Point(n.point.x,n.point.y+1),new Array(),
		n.g_score+1,heuristic_estimate(new Point(n.point.x,n.point.y+1),food,search_type)));
		if(closedList[n.point.x-1][n.point.y] == 0 && (squares[n.point.x-1][n.point.y] 
			== 0 || squares[n.point.x-1][n.point.y] == 2))
			n.children.unshift(new Node(n,new Point(n.point.x-1,n.point.y),new Array(),
		n.g_score+1,heuristic_estimate(new Point(n.point.x-1,n.point.y),food,search_type)));
		for(var i=0;i<n.children.length;i++){
			var index = in_openlist(openList,n.children[i]);
			if(index < 0){
				//node not in openList, add it.
				openList.push(n.children[i]);
			}else{
				//found a node in openlist that we already found earlier. Check if this is a better route
				if(n.children[i].f_score < openList[index].f_score){
					//better route, use this one instead.
					//set the new parent for all the old child nodes
					for(var j=0;j<openList[index].children.length;j++){
						openList[index].children[j].parent = n.children[i];
					}
					//give the children to the new parent
					n.children[i].children = openList[index].children;
					//remove the old node from openList
					openList.splice(index,1);
					//add new node to openList
					openList.push(n.children[i]);
					//Update the scores for all child nodes.
					update_scores(n.children[i]);
				}
			}
		}
	}
}

function update_scores(parent){
	for(var i=0;i<parent.children.length;i++){
		parent.children[i].g_score = parent.g_score+1;
		parent.children[i].h_score = heuristic_estimate(parent.children[i].point);
		parent.children[i].f_score = parent.children[i].g_score + parent.children[i].h_score;

		update_scores(parent.children[i]);
	}
}

function in_openlist(openList,aNode){
	for(var i=0;i<openList.length;i++){
		if(openList[i].point.x == aNode.point.x && openList[i].point.y == aNode.point.y)
			return i;
	}
	return -1;
}

function heuristic_estimate(point1, point2,search_type){
	switch(search_type){
		case "H1":
			return heuristic_estimate_1(point1,point2);
		case "H2":
			return heuristic_estimate_2(point1,point2);
		case "H1+H2":
			return (heuristic_estimate_1(point1,point2) + heuristic_estimate_2(point1,point2))/2;
	}
}

function heuristic_estimate_1(point1,point2){
	return Math.sqrt(Math.pow(point1.x-point2.x,2) + Math.pow(point1.y-point2.y,2));
}
//Second heuristic: calculate the actual distance that the snake would have to travel to reach the food.
function heuristic_estimate_2(point1,point2){
	return Math.abs(point1.x-point2.x)+Math.abs(point1.y-point2.y);
}

//start the run function
function start() {
    init();
    config.runTimeout = setTimeout(run, 100);
    stats.moves = 0;
    stats.food = 0;
    stats.count = 0;
    
    config.obstacleInterval = setInterval(update_obstacles, 4000);
}

function pause(){
	clearTimeout(config.runTimeout);
}

function resume(){
	config.runTimeout=setTimeout(run,100);
}

//stop the run function
function stop() {
    clearTimeout(config.runTimeout);
    
    clearInterval(config.obstacleInterval);
}

//send the current state information to the browser to redraw the latest state.
function refresh_view() {
    var message = new Object();
    message.type = 'move';
    message.squares = squares;
    message.stats = stats;
    postMessage(message);
}

function update_obstacles() {
    for (var i = 1; i < config.grid_size - 1; i++) {
        for (var j = 1; j < config.grid_size - 1; j++) {
            if (squares[i][j] == 4) {
                squares[i][j] = 0;
            }
        }
    }
    
    place_obstacles(config.number_obstacles);

    refresh_view();
}

function move(new_head) {
    if (
        new_head.x <= 0 || new_head.x >= config.grid_size - 1 ||
        new_head.y <= 0 || new_head.y >= config.grid_size - 1 ||
        squares[new_head.x][new_head.y] > 4
    ) {
        endGame();
        return false;
    }

    if (squares[new_head.x][new_head.y] == 2) {
        place_food();
        stats.food++;

        postMessage({ type: 'sound', sound: 'eat' });

        var tail = new Point(snake[snake.length - 1].x, snake[snake.length - 1].y);
        snake.push(tail);
    } else {
        var tail = snake.pop();
        squares[tail.x][tail.y] = 0;
    }

    snake.unshift(new_head);
    squares[new_head.x][new_head.y] = 5;

    // Cập nhật thân rắn trên bảng
    for (var i = 1; i < snake.length; i++) {
        squares[snake[i].x][snake[i].y] = 5 + i;
    }

    stats.moves++;
    return true;
}

function is_adjacent(point1, point2){
	if(point1.x == point2.x && (point1.y == point2.y-1 || point1.y == point2.y+1))
		return true;
	if(point1.y == point2.y && (point1.x == point2.x-1 || point1.x == point2.x+1))
		return true;
	return false;
}

function place_snake(length) {
    var middle_x = Math.floor(config.grid_size / 2);
    var middle_y = Math.floor(config.grid_size / 2);
    var snake = new Array(length);
    for (var i = 0; i < length; i++) {
        snake[i] = new Point(middle_x + i, middle_y);
        squares[middle_x + i][middle_y] = 5 + i;
    }
    return snake;
}

function place_obstacles(count,flag){

	for(var c=0;c<count;){
		var random_x = Math.floor(Math.random()*(config.grid_size-2))+1;
		var random_y = Math.floor(Math.random()*(config.grid_size-2))+1;
		if(squares[random_x][random_y] == 0){
			squares[random_x][random_y] = 4;
			c++;
		}
	}
}

function place_food(){
	do{
		var random_x = Math.floor(Math.random()*(config.grid_size-2))+1;
		var random_y = Math.floor(Math.random()*(config.grid_size-2))+1;
	}while(squares[random_x][random_y] != 0);
	squares[random_x][random_y] = 2;
	food = new Point(random_x,random_y);
}

function endGame() {
    clearTimeout(config.runTimeout);
    clearInterval(config.obstacleInterval);

    postMessage({ type: 'sound', sound: 'game_over' });

    var message = new Object();
    message.type = 'end';
    message.stats = stats;
    postMessage(message);
}
