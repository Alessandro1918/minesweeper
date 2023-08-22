require("readline").emitKeypressEvents(process.stdin)   //makes process.stdin emit keypress events
process.stdin.setRawMode(true)                          //emit event on a per char base, instead of per enter key press

// *********************
// ***** Constanst *****
// *********************

const GRID_ROWS = 9
const GRID_COLUMNS = 9

var selectedCell = [0, 0]   //[row, column] index of the user input

var totalTime = 0           //seconds
var flagCount = 0           //cells marked as "bomb"

var bombCount = 10          //how many cells are actually bombs

//V1    V2      V3
// 5 ██▊, ▟█▊▟█▊, ▇█▊▇█▊
// ⚑  ✻ , ▟█▊▟█▊, ▇▇▊▇▇▊
//▟ = "\u259F" (Quadrant upper right and lower left and lower right)
//▇ = "\u2587" (Lower seven eighths block)
//█ = "\u2588" (Full block)
//▊ = "\u258A" (Left three quarters block)
//⚑ = "\u2691" (Flag)
//* = "\u002A" (Asterisk)
//✻ = "\u273B" (Teardrop spoked asterisk)
const CLOSED_CELL = "▇▇▊"

//https://i.stack.imgur.com/KTSQa.png
//1=bold, 38=front, 5=next argument is a color code (not RGB), 4=blue, 48=background
const EMPTY = "\033[48;5;248m"                //background dark gray
const BLUE = "\033[1;38;5;4;48;5;248m"        //bold blue on dark gray
const GREEN = "\033[1;38;5;46;48;5;248m"      //bold green on dark gray
const RED = "\033[1;38;5;9;48;5;248m"         //bold red on dark gray
const MAGENTA = "\033[1;38;5;5;48;5;248m"     //bold magenta on dark gray
const PURPLE = "\033[1;38;5;127;48;5;248m"    //bold purple on dark gray
const CYAN = "\033[1;38;5;14;48;5;248m"       //bold cyan on dark gray
const BLACK = "\033[1;38;5;0;48;5;248m"       //bold black on dark gray
const ORANGE = "\033[1;38;5;214;48;5;248m"    //bold orange on dark gray
const SELECTED = "\033[38;5;214m"             //orange
const RED_FLAG = "\033[1;38;5;9;48;5;252m"    //red on white
const RESET_COLOR = "\x1b[0m"                 //reset terminal color back to white on black

const NUMBER_CELL = [
  EMPTY + "   ", 
  BLUE + " 1 ", GREEN + " 2 ", RED + " 3 ", MAGENTA + " 4 ", 
  PURPLE + " 5 ", CYAN + " 6 ", BLACK + " 7 ", ORANGE + " 8 "
]
const FLAG = RED_FLAG + " ⚑ "   
const BOMB = BLACK + " ✻ "

const grid = []     //grid "x" by "y" of cells (2D array of objects)

// ******************************
// ********** Functions *********
// ******************************

//Check if a cell has a bomb. Count "out of grid" as "not bomb".
//Return 1 if bomb, else 0.
function isBomb(i, j) {
  if (
    i < 0 || i ==  GRID_ROWS ||
    j < 0 || j == GRID_COLUMNS ||
    grid[i][j].value != -1
  ) {
    return 0
  }
  return 1
}

//Get how many of the 8 adjacent cell neighbors is a bomb
function getNeighborhoodBombCount(i, j) {
  return (
    isBomb(i-1, j-1) + isBomb(i-1, j) + isBomb(i-1, j+1) + 
    isBomb(i, j-1)             +        isBomb(i, j+1) + 
    isBomb(i+1, j-1) + isBomb(i+1, j) + isBomb(i+1, j+1)
  )
}

function initGrid() {

  console.clear()

  //Init 2D array of objects
  for (var i = 0; i < GRID_ROWS; i++) {
    const row = []
    for (var j = 0; j < GRID_COLUMNS; j++) {
      row.push({
        value: 0,
        isOpen: false,
        isFlag: false
      })
    }
    grid.push(row)
  }

  //Plant bombs (set cell value as -1)
  var plantedBombs = 0
  while (plantedBombs < bombCount) {
    const ri = Math.floor(Math.random() * GRID_ROWS)
    const rj = Math.floor(Math.random() * GRID_COLUMNS)
    if (grid[ri][rj].value != -1) {
      grid[ri][rj] = {...grid[ri][rj], value: -1}
      plantedBombs += 1
    }
  }

  //Numerate cells (get how many bombs this cell has around it)
  for (var i = 0; i < GRID_ROWS; i++) {
    for (var j = 0; j < GRID_COLUMNS; j++) {
      if (grid[i][j].value != -1) {
        grid[i][j] = {...grid[i][j], value: getNeighborhoodBombCount(i, j)}
      }
    }
  }

  printGrid()
}

//Open a cell (can't open a flag cell, you need to remove flag first)
function openCell(i, j) {
  if (!grid[i][j].isFlag) {
    grid[i][j] = {...grid[i][j], isOpen: true}
    printGrid()
  }
}

//Mark the cell with a flag (or remove it)
function flagCell(i, j) {
  if (!grid[i][j].isOpen) {
    if (grid[i][j].isFlag) {
      grid[i][j] = {...grid[i][j], isFlag: false}
      flagCount -= 1
    } else {
      grid[i][j] = {...grid[i][j], isFlag: true}
      flagCount += 1
    }
    printGrid()
  }
}

function printGrid() {
  // console.clear()                                //V1; clear entire console makes the screen flicker
  process.stdout.moveCursor(0, -(GRID_ROWS + 2))    //moves cursor up "n" lines (+1 from the "Time" line, +1 from the "Bombs" line)
  process.stdout.clearLine(1)                       //clear from cursor to end

  for (i = 0; i < GRID_ROWS; i++) {
    for (j = 0; j < GRID_COLUMNS; j++) {
      let isSelected = false
      if (selectedCell[0] == i && selectedCell[1] == j) {
        isSelected = true
      }

      let cellSymbol = ''
      if (grid[i][j].isOpen) {
        if (grid[i][j].value == -1) {
            cellSymbol = BOMB
            if (isSelected) cellSymbol = cellSymbol.replace("48;5;248", "48;5;9")   //back: gray -> red
        } else {
          cellSymbol = NUMBER_CELL[grid[i][j].value]
          if (isSelected) cellSymbol = cellSymbol.replace("48;5;248", "48;5;0")     //back: gray -> black
        }
      } else {
        if (grid[i][j].isFlag) {
          cellSymbol = FLAG
          if (isSelected) cellSymbol = cellSymbol.replace("48;5;252", "48;5;0")     //back: white -> black
        } else {
          cellSymbol = CLOSED_CELL
          if (isSelected) cellSymbol = SELECTED + cellSymbol                            //front: white -> gray
        }
      }
      
      process.stdout.write(cellSymbol + RESET_COLOR)
    }
    process.stdout.write("\n")
  }

  console.log(
    "Time:", 
    String(Math.floor(totalTime / 60)).padStart(2, "0") + ":" + 
    String(Math.floor(totalTime % 60)).padStart(2, "0")
  )

  console.log(`Bombs: ${flagCount}/${bombCount}`)
}

//Move the userInput 1 unit at given direction
function move(direction) {
  switch (direction) {
    case "up":
      if (selectedCell[0] > 0) {
        selectedCell[0] -= 1
      }
      break

    case "down":
      if (selectedCell[0] < GRID_ROWS - 1) {
        selectedCell[0] += 1
      }
      break

    case "left":
      if (selectedCell[1] > 0) {
        selectedCell[1] -= 1
      }
      break
  
    case "right":
      if (selectedCell[1] < GRID_COLUMNS - 1) {
        selectedCell[1] += 1
      }
      break
  }

  printGrid()
}

//Read key press
process.stdin.on("keypress", (char, key) => {
  switch (key.name) {
    case "up":    move("up");     break;
    case "left":  move("left");   break;
    case "right": move("right");  break;
    case "down":  move("down");   break;
    case "space":  openCell(selectedCell[0], selectedCell[1]);   break;
    case "return": flagCell(selectedCell[0], selectedCell[1]);   break;
    case "c":     if (key.ctrl)   process.exit();   break;  //CTRL + C: stop script
  }
})

// ***** Start! *****

initGrid()

setInterval(() => {
  totalTime += 1
  printGrid()
}, 1000)  //ms
