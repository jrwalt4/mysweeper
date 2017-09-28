define(['./util'], function(util) {
  
  var defaultOptions = {
    colCount: 9,
    rowCount: 9,
    bombCount: 10
  };
  
  function createState(options) {
    options = util.combine(defaultOptions, options);
    return {
      _isState: true,
      name: options.name || 'Minesweeper',
      cells: buildBoard(options),
      colCount: options.colCount,
      rowCount: options.rowCount
    };
  }
  
  function buildBoard(options) {
    var cellCount = options.rowCount*options.colCount;
    var cells = new Array(options.colCount*options.rowCount).fill(0b0000);
    var randomBytes = crypto.getRandomValues(new Uint8Array(options.bombCount));
    var bombs = util.removeDuplicates(randomBytes.map(function(num){
      return Math.floor(num/256*cellCount); //scale the value so it fills up the board
    })); // may end up with less bombs, but we'll worry about that later
    bombs.forEach(function(bombIndex) {
      cells[bombIndex] = CellStatus.MINE;
    });
    return cells;
  }
  
  function isGameState(optionsOrState) {
    return optionsOrState._isState
  }
  
  function Game(gameState) {
    this._state = isGameState(gameState) ? gameState : createState(gameState);
    this._boardCache = null;
  }
  
  var CellStatus = Game.CellStatus = {
    VISITED: 1 << 0,
    MINE: 1 << 1,
    FLAGGED: 1 << 2,
    FLAG_TYPE: 1 << 3
  };
  
  Game.cellHasMine = function(cellValue) {
    return Boolean(util.getMask(cellValue, CellStatus.MINE));
  };
  
  Game.cellHasBeenVisited = function(cellValue) {
    return Boolean(util.getMask(cellValue, CellStatus.VISITED));
  };
  
  Game.cellHasBeenFlagged = function(cellValue) {
    return Boolean(util.getMask(cellValue, CellStatus.FLAGGED));
  };
  
  Game.cellFlagType = function(cellValue) {
    return util.getMask(cellValue, CellStatus.FLAG_TYPE) ? 'unknown' : 'flag';
  }
  
  Game.prototype = {
    constructor: Game,
    getCellIndex: function(row, col) {
      if(col == 0 || col > this.colCount) {
        throw new RangeError('Column: '+col+' is out of range');
      }
      if(row == 0 || row > this.rowCount) {
        throw new RangeError('Row: '+row+' is out of range');
      }
      return ((row-1) * this.colCount) + col - 1;
    },
    getValueAtAddress: function(row, col) {
      return this._state.cells[this.getCellIndex(row, col)];
    },
    getValueAtIndex: function(index) {
      return this._state.cells[index];
    },
    setValueAtIndex: function(index, value) {
      var oldValue = this.getValueAtIndex(index);
      var newValue = value;//(toggle ? util.toggleMask : util.setMask)(oldValue, flag);
      if(oldValue != newValue) {
        var newCells = util.copy(this._state.cells);
        newCells[index] = newValue;
        return new Game(util.combine(this._state, {
          cells: newCells
        }))
      }
      // nothing changed, so keep it the same
      return this;
    },
    flagCell: function(cellIndex) {
      var prevValue = this.getValueAtIndex(cellIndex);
      if(util.getMask(prevValue, CellStatus.VISITED)) {
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
      if(util.getMask(newValue, CellStatus.FLAGGED)) {
        newValue = util.toggleMask(newValue, CellStatus.FLAG_TYPE);
      }
      if(!util.getMask(newValue, CellStatus.FLAG_TYPE)) { // determine to change based on new value
        newValue = util.toggleMask(newValue, CellStatus.FLAGGED);
      }
      return this.setValueAtIndex(cellIndex, newValue);
    },
    visitCell: function(cellIndex) {
      var cellValue = this.getValueAtIndex(cellIndex);
      if(Game.cellHasBeenFlagged(cellValue)) {
        // can't click on a flagged cell (for protection)
        return this;
      }
      if(Game.cellHasMine(cellValue)) {
        var keepGoing = confirm('You got blowed up! Undo?');
        if(keepGoing) {
          return this;
        }
      }
      var EITHER_FLAG = CellStatus.FLAGGED | CellStatus.FLAG_TYPE;
      // also clear flags
      return this.setValueAtIndex(cellIndex, util.setMask(cellValue, CellStatus.VISITED));
    },
    getBoard: function() {
      if (this._boardCache) {
        return this._boardCache;
      }
      var rows = new Array(this.rowCount);
      var index = 0;
      var cellCount = this.cellCount;
      var colCount = this.colCount;
      for(var r = 0 ; r < rows.length ; r++) {
        var row = new Array(colCount);
        for(var c = 0 ; c < row.length ; c++) {
          row[c] = this.getValueAtIndex( r*colCount + c);
        }
        rows[r] = row;
      }
      return this._boardCache=rows;
    },
    countAdjacentMines: function(cellIndex) {
      var col = (cellIndex % this.rowCount) + 1;
      var row = ((cellIndex - col + 1) / this.colCount) + 1;
      var topRow = row === 1 ? row : row - 1;
      var bottomRow = row === this.rowCount ? row : row + 1;
      var leftCol = col === 1 ? col : col - 1;
      var rightCol = col === this.colCount ? col : col + 1;
      var adjacentCells = [];
      for (var r = topRow ; r <= bottomRow ; r++) {
        for(var c = leftCol ; c <= rightCol ; c++) {
          adjacentCells.push(this.getValueAtAddress(r,c));
        }
      }
      return adjacentCells.reduce(function(count, value) {
        return count + (Game.cellHasMine(value) ? 1 : 0);
      }, 0);
    }
  }
  
  Object.defineProperties(Game.prototype, {
    name: {
      get: function() {
        return this._state.name;
      }
    },
    rowCount: {
      get: function() {
        return this._state.rowCount;
      }
    },
    colCount: {
      get: function() {
        return this._state.colCount;
      }
    },
    cellCount: {
      get: function() {
        return this._state.rowCount * this._state.colCount;
      }
    }
  });
  
  return Game;
});
