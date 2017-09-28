define(['react', './Cell'], function(React, Cell) {
  
  var create = React.createElement;
  
  return (function (_super) {
    
    function Board(props) {
      _super.call(this, props);
      
      var _this = this;
      /*
      this.onCellClick = function(index) {
        _this.props.onCellClick(index);
      };
      */
    }
    
    Board.prototype = Object.create(_super.prototype);
    
    Board.prototype.render = function() {
      var game = this.props.game;
      var board = game.getBoard();
      var colCount = game.colCount;
      var _this = this;
      return create('div', null, 
        create('p',null, game.name),
        create('table', {className:'Board'},
          create('tbody', null,
            board.map(function(row, r) {
              return create('tr', {key:r},
                row.map(function(cellValue, c){
                  return create('td', {key:c, className:'CellContainer'}, 
                    create(Cell, 
                      {
                        cellValue: cellValue, 
                        cellIndex: r*colCount + c, 
                        onClick: _this.props.onCellClick,
                        adjacentMines: _this.props.game.countAdjacentMines(r*colCount + c)
                      }
                    )
                  );
                })
              );
            })
          )
        )
      );
    };
    
    return Board;
  })(React.Component);
  
});
