//V1    V2      V3
// 5 ██▊, ▟█▊▟█▊, ▇█▊▇█▊
// ⚑  ✻ , ▇█▊▇█▊, ▇▇▊▇▇▊

//▟ = "\u259F" (Quadrant upper right and lower left and lower right)
//▇ = "\u2587" (Lower seven eighths block)
//█ = "\u2588" (Full block)
//▊ = "\u258A" (Left three quarters block)
//⚑ = "\u2691" (Flag)
//* = "\u002A" (Asterisk)
//✻ = "\u273B" (Teardrop spoked asterisk)

const GRID_ROWS = 9
const GRID_COLUMNS = 9

const CLOSED_CELL = "▇▇▊"
const NUMBER_CELL = ["   ", " 1 ", " 2 ", " 3 ", " 4 ", " 5 ", " 6 ", " 7 ", " 8 "]
const FLAG = " ⚑ "
const UNEXPLODED_BOMB = " ✻ "
const EXPLODED_BOMB = "*✻*"

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

function getCellValue(i, j) {
  return 1
}

function initGrid(level) {

  //Plant bombs
  var i = 0, j = 0
  grid[i][j] = {...grid[i][j], value: -1}
  i = 0; j = 1
  grid[i][j] = {...grid[i][j], value: -1}

  //Numerate cells
  for (var i = 0; i < GRID_ROWS; i++) {
    for (var j = 0; j < GRID_COLUMNS; j++) {
      grid[i][j] = {...grid[i][j], value: getCellValue(i, j)}
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
      if (grid[i][j].isOpen) {
        if (grid[i][j].value == -1) {
          if (i == selectedCell[0] && j == selectedCell[1]) {
            process.stdout.write(EXPLODED_BOMB)
          } else {
            process.stdout.write(UNEXPLODED_BOMB)
          }
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
