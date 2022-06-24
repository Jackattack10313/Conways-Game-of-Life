// Positions allow for faster algorithm (eliminates the solution of iterating through the entire 2d array every frame)
class Position {
  constructor(row, col) {
    this.row = row;
    this.col = col;
  }
  lessThan(obj) {
    if (obj instanceof Position) {
      if (this.row < obj.row) {
        return true;
      }
      else if (this.row > obj.row) {
        return false;
      }
      else {
        if (this.col < obj.col) {
          return true;
        }
        return false;
      }
    }
    throw new Error("Object passed is not of type position");
  }
  equals(obj) {
    if (this.row === obj.row && this.col === obj.col) {
      return true;
    }
    return false;
  }
}


let cnv;
let startStop = new Clickable();
let statesArray = [];
let aliveArray = [];
let tileDimension = 10;
let width = 700;
let height = 500;
let rows = Math.floor((height - 1) / (tileDimension + 1));
let cols = Math.floor((width - 1) / (tileDimension + 1));
let playPause = false;


function setup() {
  cnv = createCanvas(width, height);
  startStop.color = "#00FF00";
  startStop.locate(4, 5);
  startStop.resize(50, 20);
  startStop.text = "Start/Stop"
  frameRate(4);
  centerCanvas();
  strokeWeight(1);
  stroke(1);
  // Creating vertical lines - have to go until <= to get the final line
  for (let i = 0; i <= cols; i++) {
    line(i * (tileDimension + 1), 0, i * (tileDimension  + 1), (tileDimension + 1) * (rows));
  }
  // Creating horizontal lines
  for (let i = 0; i <= rows; i++) {
    line(0, i * (tileDimension + 1), (tileDimension + 1) * (cols), i * (tileDimension + 1));
  }
  for (let row = 0; row < rows; row++) {
    statesArray.push([]);
    for (let col = 0; col < cols; col++) {
      statesArray[row].push(false);
    }
  }
}


// Allows the user to initialize the tiles
function mouseClicked() {
  if (mouseX < (tileDimension + 1) * (cols) &&  mouseY < (tileDimension + 1) * (rows)) {
    // Accounts for the slight color change you get from layering stuff on top of each other
    strokeWeight(2);
    stroke(128, 128, 128);
    // Translating the mouse click location to a coordinate in the 2d Array
    let posRow = Math.floor(mouseY / (tileDimension + 1));
    let posCol = Math.floor(mouseX / (tileDimension + 1));
    let tile = new Position(posRow, posCol);
    if (statesArray[posRow][posCol] === false) {
      statesArray[posRow][posCol] = true;
      fill(1);
      square(Math.ceil((tileDimension + 1) * posCol), Math.ceil((tileDimension + 1) * posRow), tileDimension + 1)
      sortIntoList(tile, aliveArray);
    }
    else {
      statesArray[posRow][posCol] = false;
      fill(241, 239, 239);
      square(Math.ceil((tileDimension + 1) * posCol), Math.ceil((tileDimension + 1) * posRow), tileDimension + 1)
      removeFromList(tile, aliveArray);
    }
  }
}


// Algorithm only considers tiles adjacent to alive ones - should scale better with the size of the grid than iterating through it in its entirety
function draw() {
  startStop.draw();
  if (playPause) {
    let born = [];
    let died = [];
    for (let i = 0; i < aliveArray.length; i++) {
      let row = aliveArray[i].row;
      let col = aliveArray[i].col;
      for (let rowPos = row - 1; rowPos <= row + 1; rowPos++) {
        for (let colPos = col - 1; colPos <= col + 1; colPos++) {
          if (rowPos > -1 && rowPos < statesArray.length && colPos > -1 && colPos < statesArray[rowPos].length) {
            let lives = checkCellState(rowPos, colPos);
            let tile = new Position(rowPos, colPos);
            if (lives && !statesArray[rowPos][colPos] && !includes(tile, born)) {
              sortIntoList(tile, born);
            }
            else if(!lives && statesArray[rowPos][colPos] && !includes(tile, died)) {
              sortIntoList(tile, died);
            }
          }
        }
      }
    }
    for (let i = 0; i < born.length; i++) {
      let row = born[i].row;
      let col = born[i].col;
      let tile = new Position(row, col);
      statesArray[row][col] = true;
      fill(1);
      square(Math.ceil((tileDimension + 1) * col), Math.ceil((tileDimension + 1) * row), tileDimension + 1);
      sortIntoList(tile, aliveArray);
    }
    for (let i = 0; i < died.length; i++) {
      let row = died[i].row;
      let col = died[i].col;
      let tile = new Position(row, col);
      statesArray[row][col] = false;
      fill(241, 239, 239);
      square(Math.ceil((tileDimension + 1) * col), Math.ceil((tileDimension + 1) * row), tileDimension + 1)
      removeFromList(tile, aliveArray);
    }
  }
}

// Returns a boolean indicating if the cell should be brought to life or killed
function checkCellState(row, col) {
  adjacentAlive = 0;
  for (let rowPos = row - 1; rowPos <= row + 1; rowPos++) {
    for (let colPos = col - 1; colPos <= col + 1; colPos++) {
      if (rowPos == row && colPos == col) {
        continue;
      }
      else if (rowPos > -1 && rowPos < statesArray.length && colPos > -1 && colPos < statesArray[rowPos].length && statesArray[rowPos][colPos] === true) {
        adjacentAlive++;
      }
    }
  }
  if ((statesArray[row][col] === true && adjacentAlive === 2) || adjacentAlive === 3) {
    return true;
  }
  else {
    return false;
  }
}

// Sorting each element as it's added into list
function sortIntoList(obj, list) {
  if (list.length === 0 || !obj.lessThan(list[list.length - 1])) {
    list.push(obj);
  }
  else {
    let i = list.length - 1;
    while (i > 0 && obj.lessThan(list[i - 1])) {
      i--;
    }
    list.splice(i, 0, obj);
  }
}


// Binary search that removes the object from list when dead
function removeFromList(obj, list) {
  let lowerBound = 0;
  let upperBound = list.length - 1;
  let found = false;
  while (!found && upperBound >= lowerBound) {
    let position = Math.floor((upperBound + lowerBound) / 2);
    if (obj.equals(list[position])) {
      list.splice(position, 1);
      found = true;
    }
    else if (obj.lessThan(list[position])) {
      upperBound = position - 1;
    }
    else {
      lowerBound = position + 1;
    }
  }
}


// Binary search to see if object is already in the list
function includes(obj, list) {
  let lowerBound = 0;
  let upperBound = list.length - 1;
  while (upperBound >= lowerBound) {
    let position = Math.floor((upperBound + lowerBound) / 2);
    if (obj.equals(list[position])) {
      return true;
    }
    else if (obj.lessThan(list[position])) {
      upperBound = position - 1;
    }
    else {
      lowerBound = position + 1;
    }
  }
  return false;
}

// Centers p5 canvas in the middle of the screen
function centerCanvas() {
  var x = (windowWidth - width) / 2;
  var y = (windowHeight - height) / 2;
  cnv.position(x, y);
}


// If the window is resized, it repositions the canvas
function windowResized() {
  centerCanvas();
}


// Function that updates the play boolean
startStop.onPress= function() {
  playPause = !playPause;
}