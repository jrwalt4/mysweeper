import * as util from './util';

export interface GameOptions {
  colCount: number;
  rowCount: number;
  bombCount: number;
  name: string;
}

var defaultOptions = {
  colCount: 9,
  rowCount: 9,
  bombCount: 10,
  name: 'Minesweeper'
};

export interface GameState {
  _isState: boolean;
  name: string;
  cells: Uint8Array;
  mines: CellIndex[];
  colCount: number;
  rowCount: number;
}

function createState(options: Partial<GameOptions>): GameState {
  let useOptions: GameOptions = util.combine(defaultOptions, options);
  let board = buildBoard(useOptions);
  return {
    _isState: true,
    name: useOptions.name,
    cells: board.cells,
    mines: board.mineIndexes,
    colCount: useOptions.colCount,
    rowCount: useOptions.rowCount
  };
}

function buildBoard(options: GameOptions): { cells: Uint8Array, mineIndexes: CellIndex[] } {
  var cellCount = options.rowCount * options.colCount;
  var cells = new Uint8Array(options.colCount * options.rowCount).fill(0b0000);
  let mineIndexes: CellIndex[] = [];
  while (mineIndexes.length < options.bombCount) {
    let trialIndex: CellIndex = Math.floor(Math.random() * cellCount);
    if (mineIndexes.indexOf(trialIndex) < 0) {
      mineIndexes.push(trialIndex);
    }
  }
  mineIndexes.forEach(function (bombIndex) {
    cells[bombIndex] = CellStatus.MINE;
  });
  return { cells, mineIndexes };
}

function isGameState(optionsOrState): optionsOrState is GameState {
  return optionsOrState && optionsOrState._isState
}

enum CellStatus {
  VISITED = 1 << 0,
  MINE = 1 << 1,
  FLAGGED = 1 << 2,
  FLAG_TYPE = 1 << 3
}

type CellValue = number;
type CellIndex = number;
type GameBoard = number[][];
type GameStatus = "win" | "loose" | "incomplete";

export class Game {

  static CellStatus = CellStatus;

  static cellHasMine(cellValue) {
    return Boolean(util.getMask(cellValue, CellStatus.MINE));
  }

  static cellHasBeenVisited(cellValue) {
    return Boolean(util.getMask(cellValue, CellStatus.VISITED));
  }

  static cellHasBeenFlagged(cellValue) {
    return Boolean(util.getMask(cellValue, CellStatus.FLAGGED));
  }

  static cellFlagType(cellValue) {
    return util.getMask(cellValue, CellStatus.FLAG_TYPE) ? 'unknown' : 'flag';
  }

  private _state: GameState;
  private _boardCache: GameBoard | null;

  constructor(gameState?: Partial<GameOptions> | GameState) {
    this._state = isGameState(gameState) ? gameState : createState(gameState || {});
    this._boardCache = null;
  }
  get name(): string {
    return this._state.name;
  }
  get rowCount(): number {
    return this._state.rowCount;
  }
  get colCount(): number {
    return this._state.colCount;
  }
  get cellCount(): number {
    return this._state.rowCount * this._state.colCount;
  }

  get mineCount(): number {
    return this._state.mines.length;
  }

  get minesFound(): number {
    return this._state.mines.reduce(
      (count: number, mineIndex: CellIndex) => {
        return count + (Game.cellHasBeenFlagged(this.getValueAtIndex(mineIndex)) ? 1 : 0);
      },
      0
    )
  }

  get flagsUsed(): number {
    return this._state.cells.reduce(
      (count: number, value: CellValue) => {
        return count + (
          Game.cellHasBeenFlagged(value) && (Game.cellFlagType(value) == 'flag') ?
            1 :
            0
        );
      },
      0
    );
  }

  get visitedOrFlaggedCells(): number {
    let mask = CellStatus.FLAGGED | CellStatus.VISITED;
    return this._state.cells.reduce((count, value) => {
      return count + (util.getMask(value, mask) == 0 ? 0 : 1);
    }, 0);
  }

  get gameStatus(): GameStatus {
    let visitedMine = this._state.cells.findIndex(
      (value: CellValue) => Game.cellHasBeenVisited(value) && Game.cellHasMine(value)
    ) > -1;
    if (visitedMine) {
      return "loose"
    };
    let foundAllMines = this.mineCount === this.minesFound;
    return ((this.visitedOrFlaggedCells == this.cellCount) && foundAllMines) ? "win" : "incomplete";
  }

  getCellIndex(row: number, col: number): CellIndex {
    if (col == 0 || col > this.colCount) {
      throw new RangeError('Column: ' + col + ' is out of range');
    }
    if (row == 0 || row > this.rowCount) {
      throw new RangeError('Row: ' + row + ' is out of range');
    }
    return ((row - 1) * this.colCount) + col - 1;
  }

  getValueAtAddress(row: number, col: number): CellValue {
    return this._state.cells[this.getCellIndex(row, col)];
  }
  getValueAtIndex(index: CellIndex): CellValue {
    return this._state.cells[index];
  }
  setValueAtIndex(index: CellIndex, value: CellValue): Game {
    var oldValue = this.getValueAtIndex(index);
    var newValue = value;//(toggle ? util.toggleMask : util.setMask)(oldValue, flag);
    if (oldValue != newValue) {
      var newCells = util.copy(this._state.cells);
      newCells[index] = newValue;
      return new Game(util.combine(this._state, {
        cells: newCells
      }))
    }
    // nothing changed, so keep it the same
    return this;
  }
  flagCell(cellIndex: CellIndex): Game {
    var prevValue = this.getValueAtIndex(cellIndex);
    if (util.getMask(prevValue, CellStatus.VISITED)) {
      // can't flag a visited cell
      return this;
    }
    /*
     * cycle through flags
     *  0  0  = no flag
     *  1  0  = flag
     *  1  1  = question
     *  0  0  = no flag
     */
    var newValue = prevValue;
    if (util.getMask(newValue, CellStatus.FLAGGED)) {
      newValue = util.toggleMask(newValue, CellStatus.FLAG_TYPE);
    }
    if (!util.getMask(newValue, CellStatus.FLAG_TYPE)) { // determine to change based on new value
      newValue = util.toggleMask(newValue, CellStatus.FLAGGED);
    }
    return this.setValueAtIndex(cellIndex, newValue);
  }

  visitCell(cellIndex: CellIndex): Game {
    var cellValue = this.getValueAtIndex(cellIndex);
    if (Game.cellHasBeenFlagged(cellValue)) {
      // can't click on a flagged cell (for protection)
      return this;
    }
    if (Game.cellHasMine(cellValue)) {
      setTimeout(() => {
        alert('You got blowed up!');
      }, 0);
    }
    let nextState = this.setValueAtIndex(cellIndex, util.setMask(cellValue, CellStatus.VISITED));
    if (nextState.countAdjacentMines(cellIndex) == 0) {
      let adjacentCells = nextState.getAdjacentCells(cellIndex);
      let unvisitedCells = adjacentCells.filter(
        (index) => !Game.cellHasBeenVisited(nextState.getValueAtIndex(index))
      );
      nextState = unvisitedCells.reduce((prevGame: Game, index: number) => {
        return prevGame.visitCell(index);
      }, nextState);
    }
    return nextState;
  }
  getBoard(): GameBoard {
    if (this._boardCache) {
      return this._boardCache;
    }
    var rows = new Array(this.rowCount);
    var index = 0;
    var cellCount = this.cellCount;
    var colCount = this.colCount;
    for (var r = 0; r < rows.length; r++) {
      var row = new Array(colCount);
      for (var c = 0; c < row.length; c++) {
        row[c] = this.getValueAtIndex(r * colCount + c);
      }
      rows[r] = row;
    }
    return this._boardCache = rows;
  }

  getAdjacentCells(cellIndex): CellIndex[] {
    var col = (cellIndex % this.rowCount) + 1;
    var row = ((cellIndex - col + 1) / this.colCount) + 1;
    var topRow = row === 1 ? row : row - 1;
    var bottomRow = row === this.rowCount ? row : row + 1;
    var leftCol = col === 1 ? col : col - 1;
    var rightCol = col === this.colCount ? col : col + 1;
    var adjacentCells: CellIndex[] = [];
    for (var r = topRow; r <= bottomRow; r++) {
      for (var c = leftCol; c <= rightCol; c++) {
        adjacentCells.push(this.getCellIndex(r, c));
      }
    }
    return adjacentCells;
  }

  countAdjacentMines(cellIndex: CellIndex) {
    let adjacentCells = this.getAdjacentCells(cellIndex);
    return adjacentCells.reduce((count, index) => {
      return count + (Game.cellHasMine(this.getValueAtIndex(index)) ? 1 : 0);
    }, 0);
  }
}
