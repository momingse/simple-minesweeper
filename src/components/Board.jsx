import React, { useEffect } from "react";
import Cell from "./Cell";

const Board = (props) => {
  const [board, setBoard] = React.useState(null);
  const [gameStatus, setGameStatus] = React.useState("Playing");
  const [mineCount, setMineCount] = React.useState(props.gameInformation.mines);
  const [time, setTime] = React.useState(0);
  const [inGame, setInGame] = React.useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!inGame) {
        return;
      }
      const timer = time + 1;
      setTime(timer);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [time, inGame]);

  useEffect(() => {
    setBoard(
      initBoard(
        props.gameInformation.rows,
        props.gameInformation.columns,
        props.gameInformation.mines
      )
    );
    // console.log("create board");
  }, [props.gameInformation]);

  const handleRestart = () => {
    setBoard(
      initBoard(
        props.gameInformation.rows,
        props.gameInformation.columns,
        props.gameInformation.mines
      )
    );
    setMineCount(props.gameInformation.mines);
    setGameStatus("Playing");
    setTime(0);
    setInGame(false);
  };

  const createEmptyArray = (height, width) => {
    let board = [];
    for (let i = 0; i < height; i++) {
      board.push([]);
      for (let j = 0; j < width; j++) {
        board[i][j] = {
          x: i,
          y: j,
          isMine: false,
          neighbour: 0,
          isRevealed: false,
          isEmpty: false,
          isFlaged: false,
        };
      }
    }
    return board;
  };

  const getNeighbours = (board, height, width) => {
    let updatedBoard = board;

    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        if (board[i][j].isMine === false) {
          let mine = traverseBoard(board, i, j, height, width).filter(
            (el) => el.isMine
          ).length;
          if (mine === 0) {
            updatedBoard[i][j].isEmpty = true;
          }

          updatedBoard[i][j].neighbour = mine;
        }
      }
    }
    return updatedBoard;
  };

  const plantMines = (board, height, width, numMine) => {
    let updatedBoard = board;
    const allLocs = [];
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        allLocs.push([row, col]);
      }
    }

    // Shuffle the list of cell locations using the Fisher-Yates shuffle
    for (let i = allLocs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allLocs[i], allLocs[j]] = [allLocs[j], allLocs[i]];
    }

    // Select the first numMines locations as mine locations
    const mineLocs = allLocs.slice(0, numMine);

    // Place the mines on the game board
    for (let [row, col] of mineLocs) {
      updatedBoard[row][col].isMine = true;
    }

    return updatedBoard;
  };

  const initBoard = (height, width, mine) => {
    let board = createEmptyArray(height, width);
    board = plantMines(board, height, width, mine);
    board = getNeighbours(board, height, width);
    return board;
  };

  const traverseBoard = (board, x, y) => {
    const height = props.gameInformation.rows;
    const width = props.gameInformation.columns;
    const el = []; //up

    if (x > 0) {
      el.push(board[x - 1][y]);
    } //down
    if (x < height - 1) {
      el.push(board[x + 1][y]);
    } //left
    if (y > 0) {
      el.push(board[x][y - 1]);
    } //right
    if (y < width - 1) {
      el.push(board[x][y + 1]);
    } // top left
    if (x > 0 && y > 0) {
      el.push(board[x - 1][y - 1]);
    } // top right
    if (x > 0 && y < width - 1) {
      el.push(board[x - 1][y + 1]);
    } // bottom right
    if (x < height - 1 && y < width - 1) {
      el.push(board[x + 1][y + 1]);
    } // bottom left
    if (x < height - 1 && y > 0) {
      el.push(board[x + 1][y - 1]);
    }
    return el;
  };

  const revealBoard = () => {
    let updatedBoard = board.map((row) =>
      row.map((cell) => {
        cell.isRevealed = true;
        return cell;
      })
    );
    setBoard(updatedBoard);
  };

  const revealEmptyCells = (board, x, y) => {
    let area = traverseBoard(board, x, y);
    area.forEach((value) => {
      if (
        !value.isFlagged &&
        !value.isRevealed &&
        (value.isEmpty || !value.isMine)
      ) {
        board[value.x][value.y].isRevealed = true;
        if (value.isEmpty) {
          revealEmptyCells(board, value.x, value.y);
        }
      }
    });
    return board;
  };

  const checkWin = (board) => {
    let win = true;
    board.map((row) =>
      row.map((cell) => {
        if (cell.isMine && !cell.isFlaged) {
          win = false;
        }
      })
    );
    // console.log(win);
    return win;
  };

  const checkEnoughFlag = (x, y) => {
    let area = traverseBoard(board, x, y);
    let numMine = board[x][y].neighbour;
    area.forEach((value) => {
      if (value.isFlaged) {
        numMine--;
      }
    });
    return numMine === 0;
  };

  const revealClearedCells = (board, x, y) => {
    let area = traverseBoard(board, x, y);
    let updatedBoard = board;
    area.forEach((value) => {
      if (!value.isFlaged && !value.isRevealed) {
        if (value.isMine) {
          setGameStatus("You Lose");
          revealBoard();
          return;
        }
        updatedBoard[value.x][value.y].isRevealed = true;
        if (value.isEmpty) {
          updatedBoard = revealEmptyCells(updatedBoard, value.x, value.y);
        }
      }
    });
    setBoard(updatedBoard);
  };

  const handleCellClick = (e, x, y) => {
    console.log("click", inGame);
    if (!inGame) {
      setInGame(true);
    }
    // console.log(board[x][y]);
    if (board[x][y].isFlaged) {
      return;
    }

    if (board[x][y].isRevealed && e.detail === 2) {
      if (checkEnoughFlag(x, y)) {
        revealClearedCells(board, x, y);
      }
    }

    if (board[x][y].isMine) {
      // console.log("You Lose");
      setGameStatus("You Lose");
      revealBoard();
      setInGame(false);
      return;
    }

    let updatedBoard = [...board];
    updatedBoard[x][y].isRevealed = true;
    updatedBoard[x][y].isFlaged = false;

    if (updatedBoard[x][y].isEmpty) {
      updatedBoard = revealEmptyCells(updatedBoard, x, y);
    }

    if (checkWin(updatedBoard)) {
      setGameStatus("You Win");
      revealBoard();
      setInGame(false);
      return;
    }

    setBoard(updatedBoard);
  };

  const handleContextMenu = (e, x, y) => {
    e.preventDefault();

    let updatedBoard = board;
    let mine = mineCount;
    let win = false;

    if (updatedBoard[x][y].isRevealed) return;
    if (updatedBoard[x][y].isFlaged) {
      updatedBoard[x][y].isFlaged = false;
      mine++;
    } else {
      updatedBoard[x][y].isFlaged = true;
      mine--;
    }

    if (mine === 0) {
      win = checkWin(updatedBoard);
    }

    setMineCount(mine);
    setBoard(updatedBoard);
    if (win) {
      setGameStatus("You Win");
      setInGame(false);
    }
  };

  return (
    <div className="board">
      <div
        className="game-info"
        style={{
          width: `${props.gameInformation.columns * 20}px`,
        }}
      >
        <span className="mine-count">{mineCount}</span>
        <span className="game-status" onClick={handleRestart}>
          {gameStatus}
        </span>
        <span className="timer">{time}</span>
      </div>
      <div className="playground">
        {board &&
          board.map((dataRow) => {
            return dataRow.map((dataItem) => {
              return (
                <React.Fragment key={dataItem.x * dataRow.length + dataItem.y}>
                  <Cell
                    onClick={(e) => handleCellClick(e, dataItem.x, dataItem.y)}
                    cMenu={(e) => handleContextMenu(e, dataItem.x, dataItem.y)}
                    value={dataItem}
                  />
                  {dataItem === dataRow[dataRow.length - 1] && <br />}
                </React.Fragment>
              );
            });
          })}
      </div>
    </div>
  );
};

export default Board;
