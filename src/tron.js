
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
const moveUnit = 10;
const timeUnit = 30;
const moveOffsetUnit = -.1;

const DIRECTION = {
  UP: [0, moveUnit],
  DOWN: [0, -1 * moveUnit],
  LEFT: [-1 * moveUnit, 0],
  RIGHT: [moveUnit, 0],
}

class Board {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.matrix = new Array(width);
    for (var i = 0; i < width; i++) {
      this.matrix[i] = new Array(height);
      for (var j = 0; j < height; j++) {
        this.matrix[i][j] = 0;
      }
    }
  }

  inBounds(x, y){
    if (board.matrix[x] != undefined && board.matrix[x][y] != undefined){
      return true;
    } else {
      return false;
    }
  }
}

var board;
var moving;

class Player {
  constructor(startx, starty, direction, color, name) {
    this.pos = [startx, starty];
    this.dir = direction;
    this.color = color;
    this.name = name;
  }

  move(){
    this.pos[0] += this.dir[0];
    this.pos[1] += this.dir[1];
    if (board.inBounds(this.pos[0],this.pos[1])){
      board.matrix[this.pos[0]][this.pos[1]] += 1;
    }
  }

  check(){
    ctx.fillStyle = this.color
    if (board.inBounds(this.pos[0],this.pos[1]) && board.matrix[this.pos[0]][this.pos[1]] === 1){
      ctx.fillRect(this.pos[0], this.pos[1], moveUnit - moveOffsetUnit, moveUnit - moveOffsetUnit);
      return true;
    } else {
      ctx.fillStyle = "purple";
      if (board.inBounds(this.pos[0],this.pos[1])){
        ctx.fillRect(this.pos[0], this.pos[1], moveUnit - moveOffsetUnit, moveUnit - moveOffsetUnit);
      } else {
        console.log("out");
        ctx.fillRect(this.pos[0] - this.dir[0], this.pos[1] - this.dir[1], moveUnit, moveUnit);
      }
    }
  }
}

const p1Color = "#FF7D7D";
const p2Color = "#7DFDFE";
var players = [];

$(document).ready(() => {
  addKeyListen();
  start();
});

function movePlayers(){
  console.log("move");
  players[0].move()
  players[1].move()
  aiMoveFor(players[1]);
  aiMoveFor(players[0]);

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
  }
}

var aiCount = 0;

function aiMoveFor(player){
  const tempPos = [];
  tempPos[0] = player.pos[0] + player.dir[0];
  tempPos[1] = player.pos[1] + player.dir[1];
  aiCount += Math.floor(Math.random() * 20);

  if (aiCount > 200 || !(board.inBounds(tempPos[0], tempPos[1]) && board.matrix[tempPos[0]][tempPos[1]] === 0)){
    aiCount = 0;
    for (var i = 0; i < 100; i++) {
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
  players[0] = new Player(200, 370, DIRECTION.RIGHT, p1Color, "Red");
  players[1] = new Player(750, 370, DIRECTION.LEFT, p2Color, "Blue");
  board = new Board(950, 730);
}

function start(){
  clearInterval(moving);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
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
      if (event.keyCode == 37){
        players[1].dir = DIRECTION.LEFT;
      } else if (event.keyCode == 38){
        players[1].dir = DIRECTION.DOWN;
      } else if (event.keyCode == 39){
        players[1].dir = DIRECTION.RIGHT;
      } else if (event.keyCode == 40){
        players[1].dir = DIRECTION.UP;
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
