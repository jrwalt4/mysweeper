import * as React from 'react';
import { Game } from './Game';
import * as util from './util';

import 'font-awesome/css/font-awesome.css';
import './Cell.css';

var create = React.createElement;

function preventDefault(ev) {
  ev.preventDefault();
}

function BasicCell(props) {
  return create('span',
    {
      'data-cell-index': props.cellIndex,
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
  let flagType = Game.cellFlagType(props.cellValue);
  return create(BasicCell, util.combine(props, {
    className: [
      'Cell-flagged',
      'fa',
      flagType == 'flag' ? 'fa-flag' : 'fa-question',
      props.className || ''
    ].join(' ')
  }));
}

function VisitedCell(props) {
  return create(BasicCell, util.combine(props, {
    className: ['Cell-visited', 'Cell-' + props.adjacentMines, props.className].join(' ')
  }), props.adjacentMines || '')
}

export function Cell(props) {
  var cellProps = props;
  var compCtor: React.StatelessComponent = BasicCell;
  if (Game.cellHasBeenFlagged(props.cellValue)) {
    compCtor = FlaggedCell;
  }
  if (Game.cellHasBeenVisited(props.cellValue)) {
    compCtor = Game.cellHasMine(props.cellValue) ? BombCell : VisitedCell;
  }
  return create(compCtor, cellProps);
}
