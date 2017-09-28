define(['react', './Game', './util'], function(React, Game, util) {
  
  var create = React.createElement;
  
  function preventDefault(ev) {
    ev.preventDefault();
  }
  
  function BasicCell(props) {
    return create('span', 
      {
        'data-cell-index':props.cellIndex,
        onMouseUp: props.onClick,
        onContextMenu: preventDefault,
        className: 'Cell ' + props.className
      },
      props.children
    );
  }
  
  function BombCell(props) {
    return create(BasicCell, util.combine(props, {
      className: 'Cell-visited Cell-bomb fa fa-bomb'
    }));
  }
  
  function FlaggedCell(props) {
    return create(BasicCell, util.combine(props, {
      className: 'fa ' + (Game.cellFlagType(props.cellValue) == 'flag' ? 'fa-flag' : 'fa-question') + (props.className || '')
    }));
  }
  
  function VisitedCell(props) {
    return create(BasicCell, util.combine(props, {
      className: 'Cell-visited '+ props.className
    }), props.adjacentMines)
  }
  
  return function Cell(props) {
    var cellProps = props;
    var compCtor = BasicCell;
    if(Game.cellHasBeenFlagged(props.cellValue)) {
      compCtor = FlaggedCell;
    }
    if(Game.cellHasBeenVisited(props.cellValue)) {
      compCtor = Game.cellHasMine(props.cellValue) ? BombCell : VisitedCell;
    }
    return create(compCtor, cellProps);
  }
});
