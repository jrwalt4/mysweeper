import * as React from 'react';
import { Game } from './Game';

import './Stats.css';

export function Stats(props: { game: Game }) {
  switch (props.game.gameStatus) {
    case "win":
      return <span>You Win!</span>;
    case "loose":
      return <i>You suck!</i>;
    default:
      return (
        <table className="Stats">
          <thead>
            <tr><th>Mines</th><th>Mines Cleared</th></tr>
          </thead>
          <tbody>
            <tr><td>{props.game.mineCount}</td><td>{props.game.flagsUsed}</td></tr>
          </tbody>
        </table>
      );
  }
}