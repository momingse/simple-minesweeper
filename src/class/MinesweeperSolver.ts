import { CellState, Minesweeper, PlayerCell } from "./Minesweeper";

type Coordinate = [number, number];
export interface Solution {
  flaggable: Coordinate[];
  revealable: Coordinate[];
  guess?: Coordinate[];
}

export class MinesweeperSolver {
  private _minesweeperGame: Minesweeper;
  private _unsolvedRevealedCell: Coordinate[];
  private _board: PlayerCell[][];

  constructor(minesweeperGame: Minesweeper) {
    this._minesweeperGame = minesweeperGame;
    this._unsolvedRevealedCell = [];
    this._board = minesweeperGame.getBoard();
  }

  private getBoard(): PlayerCell[][] {
    return this._minesweeperGame.getBoard();
  }

  private randomGuess(): Solution {
    let x: number = 0,
      y: number = 0;

    if (this._board[0][0].state === CellState.Hidden) {
      x = 0;
      y = 0;
    } else if (
      this._board[0][this._minesweeperGame.width - 1].state === CellState.Hidden
    ) {
      x = this._minesweeperGame.width - 1;
      y = 0;
    } else if (
      this._board[this._minesweeperGame.height - 1][0].state ===
      CellState.Hidden
    ) {
      x = 0;
      y = this._minesweeperGame.height - 1;
    } else if (
      this._board[this._minesweeperGame.height - 1][
        this._minesweeperGame.width - 1
      ].state === CellState.Hidden
    ) {
      x = this._minesweeperGame.width - 1;
      y = this._minesweeperGame.height - 1;
    }

    while (this._board[y][x].state !== CellState.Hidden) {
      x = Math.floor(Math.random() * this._minesweeperGame.width);
      y = Math.floor(Math.random() * this._minesweeperGame.height);
    }

    return {
      flaggable: [],
      revealable: [],
      guess: [[x, y]],
    };
  }

  private getUnsolvedRevealedCell(): Coordinate[] {
    const revealedCell: Coordinate[] = [];
    for (let y = 0; y < this._minesweeperGame.height; y++) {
      for (let x = 0; x < this._minesweeperGame.width; x++) {
        if (
          this._board[y][x].state === CellState.Revealed &&
          this._board[y][x].value !== 0
        ) {
          revealedCell.push([x, y]);
        }
      }
    }

    const unsolvedRevealedCell: Coordinate[] = revealedCell.reduce(
      (acc, cell) => {
        const [x, y] = cell;
        const neighbors = this._minesweeperGame.getNeighbors(x, y);
        const hiddenNeighbors: Coordinate[] = neighbors.filter(
          ([nx, ny]) => this._board[ny][nx].state === CellState.Hidden
        );
        if (hiddenNeighbors.length > 0) {
          return [...acc, cell];
        }

        return acc;
      },
      [] as Coordinate[]
    );

    return unsolvedRevealedCell;
  }

  private findsolution(): Solution {
    const solution: Solution = {
      flaggable: [],
      revealable: [],
    };

    this._unsolvedRevealedCell.forEach(([x, y]) => {
      const neighbors = this._minesweeperGame.getNeighbors(x, y);
      const flaggedNeighbors = neighbors.filter(
        ([nx, ny]) => this._board[ny][nx].state === CellState.Flagged
      );
      const hiddenNeighbors = neighbors.filter(
        ([nx, ny]) => this._board[ny][nx].state === CellState.Hidden
      );
      if (flaggedNeighbors.length === this._board[y][x].value) {
        hiddenNeighbors.forEach(([nx, ny]) => {
          if (this._board[ny][nx].state === CellState.Hidden) {
            solution.revealable.push([nx, ny]);
          }
        });
      }
      if (
        hiddenNeighbors.length + flaggedNeighbors.length ===
        this._board[y][x].value
      ) {
        hiddenNeighbors.forEach(([nx, ny]) => {
          if (this._board[ny][nx].state === CellState.Hidden) {
            solution.flaggable.push([nx, ny]);
          }
        });
      }
    });

    return {
      flaggable: [...new Set(solution.flaggable.map((c) => JSON.stringify(c)))].map((c) => JSON.parse(c)),
      revealable: [...new Set(solution.revealable.map((c) => JSON.stringify(c)))].map((c) => JSON.parse(c)),
    }
  }

  public hint(): Solution | null {
    if (this._minesweeperGame.isEnd()) return null;
    this._board = this._minesweeperGame.getBoard();
    this._unsolvedRevealedCell = this.getUnsolvedRevealedCell();
    let solution: Solution = {
      flaggable: [],
      revealable: [],
    };
    if (this._unsolvedRevealedCell.length !== 0) {
      solution = this.findsolution();
    }

    if (solution.flaggable.length === 0 && solution.revealable.length === 0) {
      solution = this.randomGuess();
    }

    return solution;
  }

  public solve(): void {
    if (this._minesweeperGame.isEnd()) return;
    const solution = this.hint()!;
    if (solution.guess) {
      const [x, y] = solution.guess[0];
      this._minesweeperGame.reveal(x, y);
      return;
    }

    solution.flaggable.forEach(([x, y]) => {
      this._minesweeperGame.toggleFlag(x, y);
    });

    solution.revealable.forEach(([x, y]) => {
      this._minesweeperGame.reveal(x, y);
    });
  }
}
