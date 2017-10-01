import * as React from 'react';
import { Board } from './Board';
import { Game } from './Game';
import * as util from './util';
import { Stats } from './Stats';

export class App extends React.Component<{}, { game: Game }>{
  constructor(props) {
    super(props);
    this.state = {
      game: new Game({
        name: 'Minesweeper'
      })
    };
  }
  onCellClick = (ev) => {
    ev.preventDefault();
    var cellIndex = ev.currentTarget.dataset.cellIndex;
    var button = ev.button;
    if (button == 0 || button == 2) {
      this.setState(function (prevState) {
        var game = prevState.game;
        return {
          game: button === 0 ? game.visitCell(cellIndex) : game.flagCell(cellIndex)
        };
      });
    }
  };
  restart = () => {
    this.setState({
      game: new Game()
    })
  }
  render() {
    return (
      <div>
        <Stats game={this.state.game} />
        <Board game={this.state.game} onCellClick={this.onCellClick} />
        <button onClick={this.restart}>Start Over</button>
      </div>
    );
  }
}
