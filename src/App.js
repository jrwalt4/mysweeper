define(['react', './Board', './Game', './util'], function(React, Board, Game, util) {
  
  var create = React.createElement;
  
  return (function (_super) {
    
    function App(props) {
      _super.call(this, props);
      
      this.state = {
        game: new Game({
          name:'Minesweeper'
        })
      };
      
      var _this = this;
      this.onCellClick = function(ev) {
        ev.preventDefault();
        var cellIndex = ev.currentTarget.dataset.cellIndex;
        var button = ev.button;
        if(button == 0 || button == 2) {
          _this.setState(function(prevState) {
            var game = prevState.game;
            return {
              game: button === 0 ? game.visitCell(cellIndex) : game.flagCell(cellIndex)
            };
          });
        }
      }
    }
    
    App.prototype = Object.create(_super.prototype);
    
    App.prototype.render = function() {
      return create(Board, 
        {
          game: this.state.game,
          onCellClick: this.onCellClick
        });
    };
    
    return App;
  })(React.Component);
  
});
