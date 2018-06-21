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

function search(st) {

}
