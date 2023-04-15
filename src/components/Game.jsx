import React, { useEffect } from "react";
import Board from "./Board";

const getLevelInformation = (level) => {
  if (level === 1) {
    return {
      rows: 9,
      columns: 9,
      mines: 10,
    };
  }
  if (level === 2) {
    return {
      rows: 16,
      columns: 16,
      mines: 40,
    };
  }
  if (level === 3) {
    return {
      rows: 16,
      columns: 30,
      mines: 99,
    };
  }
};

const Game = () => {
  const [level, setLevel] = React.useState(3);
  const [gameInformation, setGameInformation] = React.useState(null);

  useEffect(() => {
    setGameInformation(getLevelInformation(level));
  }, [level]);

  return (
    <div className="game">
      {gameInformation && <Board gameInformation={gameInformation} />}
    </div>
  );
};

export default Game;
