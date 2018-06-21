
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
const moveUnit = 10;
const timeUnit = 50;
const moveOffsetUnit = 1;
const scale = 10; // scale * board size = canvas size
const boardWidth = 95;
const boardHeight = 73;

var board;
var moving;
var aiOn = true;

const DIRECTION = {
  UP: [0, 1],
  DOWN: [0, -1],
  LEFT: [-1, 0],
  RIGHT: [1, 0],
}

class Board {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    let matrix = new Array(width);

    for (let i = 0; i < width; i++) {
      matrix[i] = new Array(height);
      for (let j = 0; j < height; j++) {
        matrix[i][j] = 0;
      }
    }

    this.matrix = matrix
  }

  inBounds(x, y){
    if (board.matrix[x] != undefined && board.matrix[x][y] != undefined){
      return true;
    } else {
      return false;
    }
  }
}

class Player {
  constructor(startx, starty, direction, color, trail, name) {
    this.pos = [startx, starty];
    this.dir = direction;
    this.color = color;
    this.name = name;
    this.trail = trail;
  }

  move(){
    ctx.fillStyle = this.trail
    ctx.fillRect(this.pos[0]*scale, this.pos[1]*scale, moveUnit - moveOffsetUnit, moveUnit - moveOffsetUnit);

    this.pos[0] += this.dir[0];
    this.pos[1] += this.dir[1];
    if (board.inBounds(this.pos[0],this.pos[1])){
      board.matrix[this.pos[0]][this.pos[1]] += 1;
    }
  }

  check(){
    ctx.fillStyle = this.color
    if (board.inBounds(this.pos[0],this.pos[1]) && board.matrix[this.pos[0]][this.pos[1]] === 1){
      ctx.fillRect(this.pos[0]*scale, this.pos[1]*scale, moveUnit - moveOffsetUnit, moveUnit - moveOffsetUnit);
      return true;
    } else {
      ctx.fillStyle = "#590059";
      if (board.inBounds(this.pos[0],this.pos[1])){
        ctx.fillRect(this.pos[0] * scale, this.pos[1] * scale, moveUnit - moveOffsetUnit, moveUnit - moveOffsetUnit);
      } else {
        ctx.fillRect((this.pos[0] - this.dir[0]) * scale, (this.pos[1] - this.dir[1]) * scale, moveUnit - moveOffsetUnit, moveUnit - moveOffsetUnit);
      }
      return false;
    }
  }
}

const p1Color = "#a44f54";
const p2Color = "#4e8c99";
const p1Trail = "#FF7D7D"
const p2Trail = "#7DFDFE"
var players = [];

$(document).ready(() => {
  addKeyListen();
  start();
});

function movePlayers(){
  console.log("move");
  players[0].move()
  players[1].move()
  const move1 = players[0].check()
  const move2 = players[1].check()

  if (!(move1 && move2)){
    if (!move1 && !move2){
      stop("Both");
    } else if (move1){
      stop(players[1].name);
    } else {
      stop(players[0].name);
    }
  } else {
    if (aiOn){
      minmaxAi(players[1], players[0]);
    }
  }
}

// Adds AI to initial player
function searchAi(player1, player2){

  let tempPos = [];
  tempPos[0] = player1.pos[0] + player1.dir[0];
  tempPos[1] = player1.pos[1] + player1.dir[1];
  search2 = new Search(player2.pos[0], player2.pos[1], board).getSearchBoard()

  let maxReachable = -1000;
  let bestDirection = player1.dir;
  for (var key in DIRECTION) {
    if (DIRECTION.hasOwnProperty(key)) {
      let tempDir = DIRECTION[key]
      tempPos[0] = player1.pos[0] + tempDir[0];
      tempPos[1] = player1.pos[1] + tempDir[1];

      if (board.inBounds(tempPos[0], tempPos[1]) && board.matrix[tempPos[0]][tempPos[1]] === 0){
        search1 = new Search(tempPos[0], tempPos[1], board).getSearchBoard()
        reachable = compareReach(search1, search2)
        if (reachable > maxReachable){
          maxReachable = reachable;
          bestDirection = tempDir
        }
      }
    }
  }
  player1.dir = bestDirection
}

// Adds AI to initial player
function minmaxAi(player1, player2){

  let tempPos = [];
  tempPos[0] = player1.pos[0] + player1.dir[0];
  tempPos[1] = player1.pos[1] + player1.dir[1];
  search2 = new Search(player2.pos[0], player2.pos[1], board).getSearchBoard()

  let maxReachable = -10000;
  let bestDirection = player1.dir;
  for (var key in DIRECTION) {
    if (DIRECTION.hasOwnProperty(key)) {
      let tempDir = DIRECTION[key]
      tempPos[0] = player1.pos[0] + tempDir[0];
      tempPos[1] = player1.pos[1] + tempDir[1];

      if (board.inBounds(tempPos[0], tempPos[1]) && board.matrix[tempPos[0]][tempPos[1]] === 0){
        search1 = new Search(tempPos[0], tempPos[1], board).getSearchBoard()
        reachable = minmaxReach(search1, search2)
        if (reachable > maxReachable){
          maxReachable = reachable;
          bestDirection = tempDir
        }
      }
    }
  }
  player1.dir = bestDirection
}


function randomAI(player){
  const tempPos = [];
  tempPos[0] = player.pos[0] + player.dir[0];
  tempPos[1] = player.pos[1] + player.dir[1];

  if (!(board.inBounds(tempPos[0], tempPos[1]) && board.matrix[tempPos[0]][tempPos[1]] === 0)){
    for (var i = 0; i < 20; i++) {
      player.dir = randomDirection();
      tempPos[0] = player.pos[0] + player.dir[0];
      tempPos[1] = player.pos[1] + player.dir[1];
      if (board.inBounds(tempPos[0], tempPos[1]) && board.matrix[tempPos[0]][tempPos[1]] === 0){
        return;
      }
    }
  }
}


function randomDirection(){
  const random = Math.floor(Math.random() * 4);
  if (random === 0){
    return DIRECTION.LEFT;
  } else if (random === 1){
    return DIRECTION.UP;
  } else if (random === 2){
    return DIRECTION.RIGHT;
  } else if (random == 3){
    return DIRECTION.DOWN;
  }
}

function reset(){
  clearInterval(moving);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  players[0] = new Player(20, 37, DIRECTION.RIGHT, p1Color, p1Trail, "Red");
  players[1] = new Player(75, 37, DIRECTION.LEFT, p2Color, p2Trail, "Blue");
  board = new Board(boardWidth, boardHeight);
}

function help(){

  reset()
  ctx.font="26px Verdana";
  ctx.fillStyle = "#a44f54";
  ctx.textAlign = "center";
  ctx.fillText("Avoid walls and opponent's tails", canvas.width/2, canvas.height/5);
  ctx.fillText("WASD to move red, Arrow keys to move blue", canvas.width/2, 2 * canvas.height/5);
  ctx.fillText("Press the reset button or hit r to start a new game", canvas.width/2, 3 * canvas.height/5);
  ctx.fillText("Press the robot button to toggle AI for blue", canvas.width/2, 4 * canvas.height/5);
}

function toggleAi(){
  aiOn = !aiOn
  start()
}

function start(){
  reset();
  moving = window.setInterval(function(){movePlayers()}, timeUnit);
}

function stop(name){
  clearInterval(moving);

  ctx.font="50px Verdana";
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.fillText(name + " lost!", canvas.width/2, canvas.height/2);
}

function addKeyListen(){
  document.addEventListener('keydown', function(event) {
      if (!aiOn){
        if (event.keyCode == 37){
          players[1].dir = DIRECTION.LEFT;
        } else if (event.keyCode == 38){
          players[1].dir = DIRECTION.DOWN;
        } else if (event.keyCode == 39){
          players[1].dir = DIRECTION.RIGHT;
        } else if (event.keyCode == 40){
          players[1].dir = DIRECTION.UP;
        }
      }

      if (event.keyCode == 65){
        players[0].dir = DIRECTION.LEFT;
      } else if (event.keyCode == 83){
        players[0].dir = DIRECTION.UP;
      } else if (event.keyCode == 68){
        players[0].dir = DIRECTION.RIGHT;
      } else if (event.keyCode == 87){
        players[0].dir = DIRECTION.DOWN;
      }

      if (event.keyCode == 82){
        start();
      }
  });
}

class Position{
  constructor(x, y, val){
    this.x = x;
    this.y = y;
    this.val = val;
  }
}

function compareReach(search1, search2){
  count = 0
  for (let i = 0; i < search1.width; i++) {
    for (let j = 0; j < search1.height; j++) {
      if (search1.matrix[i][j] != 0 && search1.matrix[i][j] != -1 && (search1.matrix[i][j] < search2.matrix[i][j] || search2.matrix[i][j] == 0)){
        count += 1;
      }
    }
  }

  return count;
}

function minmaxReach(search1, search2){
  count1 = 0
  count2 = 0

  for (let i = 0; i < search1.width; i++) {
    for (let j = 0; j < search1.height; j++) {
      if (search1.matrix[i][j] != 0 && search1.matrix[i][j] != -1 && (search1.matrix[i][j] < search2.matrix[i][j] || search2.matrix[i][j] == 0)){
        count1 += 1;
      }
      if (search2.matrix[i][j] != 0 && search2.matrix[i][j] != -1 && (search2.matrix[i][j] < search1.matrix[i][j] || search1.matrix[i][j] == 0)){
        count2 += 1;
      }
    }
  }

  return count1 * 3 - count2;
}

class Search {
  constructor(startx, starty, curBoard) {
    let searchBoard = new Board(curBoard.width, curBoard.height)

    // loop through board set 1's to -1, unreachable
    for (let i = 0; i < curBoard.width; i++) {
      for (let j = 0; j < curBoard.height; j++) {
        if (curBoard.matrix[i][j] != 0){
          searchBoard.matrix[i][j] = curBoard.matrix[i][j] * -1
        }
      }
    }

    this.board = searchBoard
    this.startx = startx;
    this.starty = starty;
    this.queue = []
  }

  getSearchBoard(){
    this.board.matrix[this.startx][this.starty] = -1
    this.searchStep(new Position(this.startx, this.starty, 1))
    return this.board
  }

  reachable(){
    let count = 0
    for (var i = 0; i < this.board.width; i++) {
      for (var j = 0; j < this.board.height; j++) {
        if (this.board.matrix[i][j] != -1 && this.board.matrix[i][j] != 0){
          count += 1;
        }
      }
    }
    return count
  }

  searchStep(position) {
    //Check up, down, left, right positions if they are 0
    // add any equal to 0 to the position queue list
      // make the val equal to current pos val +1 for distance
      // make the board position equal to val
    // if queue is not empty call searchStep on the last element of queue and remove that element from queue

    if (this.isValidStep(position.x + 1, position.y)) {
      this.calcStep(new Position(position.x + 1, position.y, position.val + 1))
    }
    if (this.isValidStep(position.x - 1, position.y)) {
      this.calcStep(new Position(position.x - 1, position.y, position.val + 1))
    }
    if (this.isValidStep(position.x, position.y + 1)) {
      this.calcStep(new Position(position.x, position.y + 1, position.val + 1))
    }
    if (this.isValidStep(position.x, position.y - 1)) {
      this.calcStep(new Position(position.x, position.y - 1, position.val + 1))
    }

    if (this.queue.length > 0){
      this.searchStep(this.queue.shift())
    }
  }

  calcStep(position) {
    this.board.matrix[position.x][position.y] = position.val
    this.queue.push(position)
  }

  isValidStep(x, y){
    return (this.board.inBounds(x, y) && this.board.matrix[x][y] == 0)
  }
}
