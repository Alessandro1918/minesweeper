
const GRID_ROWS = 9
const GRID_COLUMNS = 9

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

//https://i.stack.imgur.com/KTSQa.png
//1=bold, 38=front, 5=next argument is a color code (not RGB), 4=blue, 48=background
const EMPTY = "\033[48;5;250m"                //background dark gray
const BLUE = "\033[1;38;5;4;48;5;248m"        //bold blue on dark gray
const GREEN = "\033[1;38;5;46;48;5;248m"      //bold green on dark gray
const RED = "\033[1;38;5;9;48;5;248m"         //bold red on dark gray
const MAGENTA = "\033[1;38;5;5;48;5;248m"     //bold magenta on dark gray
const PURPLE = "\033[1;38;5;127;48;5;248m"    //bold purple on dark gray
const CYAN = "\033[1;38;5;14;48;5;248m"       //bold cyan on dark gray
const BLACK = "\033[1;38;5;0;48;5;248m"       //bold black on dark gray
const ORANGE = "\033[1;38;5;214;48;5;248m"    //bold orange on dark gray
const INVERT_COLOR = "\x1b[7m"                //change foregroud/background colors
const RESET_COLOR = "\x1b[0m"                 //change terminal color back to white on black

const CLOSED_CELL = "▇▇▊"
const NUMBER_CELL = [
  EMPTY + "   ", 
  BLUE + " 1 ", GREEN + " 2 ", RED + " 3 ", MAGENTA + " 4 ", 
  PURPLE + " 5 ", CYAN + " 6 ", BLACK + " 7 ", ORANGE + " 8 "
]
const FLAG = "\033[1;38;5;9;48;5;252m" + " ⚑ "   //red on bright gray
const BOMB = "\033[1;38;5;0;48;5;248m"  + " ✻ "  //black on dark gray

var selectedCell = [0, 1]   //[row, column] index of the user input

//Init grid "x" by "y" of cells (2D array of objects)
const grid = []
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

function getNeighborhoodBombCount(i, j) {
  return 1
}

function initGrid(level) {

  //Plant bombs (set value as -1)
  var i = 0, j = 0
  grid[i][j] = {...grid[i][j], value: -1}
  i = 0; j = 1
  grid[i][j] = {...grid[i][j], value: -1}

  //Numerate cells (get how many bombs this cell has around it)
  for (var i = 0; i < GRID_ROWS; i++) {
    for (var j = 0; j < GRID_COLUMNS; j++) {
      if (grid[i][j].value != -1) {
        grid[i][j] = {...grid[i][j], value: getNeighborhoodBombCount(i, j)}
      }
    }
  }
}

function openCell(i, j) {
  grid[i][j] = {...grid[i][j], isOpen: true}
}

function flagCell(i, j) {
  grid[i][j] = {...grid[i][j], isFlag: true}
}

function printGrid() {
  console.clear()
  for (i = 0; i < GRID_ROWS; i++) {
    for (j = 0; j < GRID_COLUMNS; j++) {
      if (selectedCell[0] == i && selectedCell[1] == j) {
        process.stdout.write(INVERT_COLOR)
      }
      if (grid[i][j].isOpen) {
        if (grid[i][j].value == -1) {
            process.stdout.write(BOMB)
        } else {
          process.stdout.write(NUMBER_CELL[grid[i][j].value])
        }
      } else {
        if (grid[i][j].isFlag) {
          process.stdout.write(FLAG)
        } else {
          process.stdout.write(CLOSED_CELL)
        }
      }
      process.stdout.write(RESET_COLOR)
    }
    process.stdout.write("\n")
  }
}

initGrid()

openCell(0, 0)
openCell(0, 1)
openCell(1, 0)
flagCell(1, 1)

printGrid()
