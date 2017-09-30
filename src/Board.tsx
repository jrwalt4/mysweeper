import * as React from 'react';
import { Cell } from './Cell';
import { Game } from './Game';

import './Board.css';

export interface BoardProps {
  game: Game;
  onCellClick: React.MouseEventHandler<HTMLSpanElement>
}

export class Board extends React.Component<BoardProps> {
  render() {
    var game = this.props.game;
    var board = game.getBoard();
    var colCount = game.colCount;
    return (
      <div>
        <p>{game.name}</p>
        <table className="Board">
          <tbody>
            {
              board.map((row, r) => (
                <tr key={r}>
                  {row.map((cellValue, c) => (
                    <td key={c} className="CellContainer">
                      <Cell cellValue={cellValue}
                        cellIndex={r * colCount + c}
                        onClick={this.props.onCellClick}
                        adjacentMines={this.props.game.countAdjacentMines(r * colCount + c)} />
                    </td>
                  ))}
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    )
  }
}
