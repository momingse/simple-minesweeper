import { LEVELINFO } from "../constant/level";

export enum CellState {
  Hidden,
  Flagged,
  Revealed,
}

export enum GameStatus {
  Win,
  Lose,
  Playing,
}

interface SecretCell {
  state: CellState;
  value: number;
}

export interface PlayerCell {
  state: CellState;
  value: number | null;
}

export class Minesweeper {
  private _level: number;
  private _board: SecretCell[][];
  private _width: number;
  private _height: number;
  private _numberOfmines: number;
  private _numberOfrevealed: number;
  private _numberOfFlags: number;
  private _gameState: GameStatus;

  constructor(level: number) {
    const levelInfo = LEVELINFO[level];
    this._level = level;
    this._width = levelInfo.width;
    this._height = levelInfo.height;
    this._numberOfmines = levelInfo.mine;
    this._numberOfrevealed = 0;
    this._numberOfFlags = 0;
    this._gameState = GameStatus.Playing;
    this._board = Array.from({ length: this._height }, () =>
      Array.from({ length: this._width }, () => ({
        state: CellState.Hidden,
        value: 0,
      }))
    );
    this.initializeBoard();
  }

  private generateMinePositions(): [number, number][] {
    const allLocation = Array.from(
      { length: this._width * this._height },
      (_, i) =>
        [i % this._width, Math.floor(i / this._width)] as [number, number]
    );

    for (let i = allLocation.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allLocation[i], allLocation[j]] = [allLocation[j], allLocation[i]];
    }

    return allLocation.slice(0, this._numberOfmines);
  }

  private getNeighbors(x: number, y: number): [number, number][] {
    const neighbors: [number, number][] = [];
    for (
      let i = Math.max(0, x - 1);
      i <= Math.min(this._width - 1, x + 1);
      i++
    ) {
      for (
        let j = Math.max(0, y - 1);
        j <= Math.min(this._height - 1, y + 1);
        j++
      ) {
        if (i === x && j === y) continue;
        neighbors.push([i, j]);
      }
    }
    return neighbors;
  }

  private initializeBoard(): void {
    this._board = Array.from({ length: this._height }, () =>
      Array.from({ length: this._width }, () => ({
        state: CellState.Hidden,
        value: 0,
      }))
    );
    const minePositions = this.generateMinePositions();
    minePositions.forEach(([x, y]) => {
      this._board[y][x].value = -1;
      this.getNeighbors(x, y).forEach(([nx, ny]) => {
        if (this._board[ny][nx].value !== -1) {
          this._board[ny][nx].value += 1;
        }
      });
    });
  }

  public reset(): void {
    this._numberOfrevealed = 0;
    this._numberOfFlags = 0;
    this._gameState = GameStatus.Playing;
    this.initializeBoard();
  }

  public setLevel(level: number): void {
    if (!Object.keys(LEVELINFO).includes(String(level))) return;
    const levelInfo = LEVELINFO[level];
    this._width = levelInfo.width;
    this._height = levelInfo.height;
    this._numberOfmines = levelInfo.mine;
    this._level = level;
    this.reset();
  }

  private recursiveReveal(x: number, y: number): void {
    this.getNeighbors(x, y).forEach(([nx, ny]) => {
      if (this._board[ny][nx].state !== CellState.Hidden) return;
      this._board[ny][nx].state = CellState.Revealed;
      this._numberOfrevealed += 1;
      if (this._board[ny][nx].value === 0) {
        this.recursiveReveal(nx, ny);
      }
    });
  }

  private checkWin(): boolean {
    return (
      this._numberOfrevealed ===
      this._width * this._height - this._numberOfmines
    );
  }

  public get width(): number {
    return this._width;
  }

  public get height(): number {
    return this._height;
  }

  public get numberOfmines(): number {
    return this._numberOfmines;
  }

  public get numberOfFlags(): number {
    return this._numberOfFlags;
  }

  public get gameState(): GameStatus {
    return this._gameState;
  }

  public get level(): number {
    return this._level;
  }

  public isEnd(): boolean {
    return this._gameState !== GameStatus.Playing;
  }

  public getBoard(): SecretCell[][] | PlayerCell[][] {
    if (this._gameState !== GameStatus.Playing) {
      return this._board.map((row) =>
        row.map((cell) => ({
          state: CellState.Revealed,
          value: cell.value,
        }))
      );
    }
    return this._board.map((row) =>
      row.map((cell) => ({
        state: cell.state,
        value: cell.state === CellState.Revealed ? cell.value : null,
      }))
    );
  }

  public toggleFlag(x: number, y: number): void {
    if (this._gameState !== GameStatus.Playing) return;
    if (x < 0 || x >= this._width) return;
    if (y < 0 || y >= this._height) return;
    if (this._board[y][x].state === CellState.Revealed) return;
    if (this._board[y][x].state === CellState.Hidden) {
      this._board[y][x].state = CellState.Flagged;
      this._numberOfFlags += 1;
    } else {
      this._board[y][x].state = CellState.Hidden;
      this._numberOfFlags -= 1;
    }
    if (this.checkWin()) {
      this._gameState = GameStatus.Win;
    }
  }

  public revealNeighbors(x: number, y: number): void {
    if (this._gameState !== GameStatus.Playing) return;
    if (x < 0 || x >= this._width) return;
    if (y < 0 || y >= this._height) return;
    if (this._board[y][x].state === CellState.Flagged) return;
    if (this._board[y][x].state === CellState.Revealed) {
      const neighbors = this.getNeighbors(x, y);
      const flaggedNeighbors = neighbors.reduce((acc, [nx, ny]) => {
        return acc + (this._board[ny][nx].state === CellState.Flagged ? 1 : 0);
      }, 0);
      if (flaggedNeighbors === this._board[y][x].value) {
        neighbors.forEach(([nx, ny]) => this.reveal(nx, ny));
      }
      return;
    }
    this.reveal(x, y);
  }

  public reveal(x: number, y: number): void {
    if (this._gameState !== GameStatus.Playing) return;
    if (x < 0 || x >= this._width) return;
    if (y < 0 || y >= this._height) return;
    if (this._board[y][x].state === CellState.Flagged) return;
    if (this._board[y][x].state === CellState.Revealed) return;

    this._board[y][x].state = CellState.Revealed;

    if (this._board[y][x].value === -1) {
      this._gameState = GameStatus.Lose;
      return;
    }

    if (this.checkWin()) {
      this._gameState = GameStatus.Win;
      return;
    }

    this._numberOfrevealed += 1;
    if (this._board[y][x].value === 0) {
      this.recursiveReveal(x, y);
    }
  }
}
