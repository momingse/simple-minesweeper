import { useEffect, useState, useMemo } from "react";
import { CellState, GameStatus, Minesweeper } from "./class/Minesweeper";
import type { PlayerCell } from "./class/Minesweeper";
import LevelSector from "./components/LevelSelector";
import { LEVELINFO } from "./constant/level";
import { MinesweeperSolver, Solution } from "./class/MinesweeperSolver";

const DEFAULT_LEVEL = 2;

const App = () => {
  const minesweeper = useMemo(() => new Minesweeper(DEFAULT_LEVEL), []);
  const solver = useMemo(
    () => new MinesweeperSolver(minesweeper),
    [minesweeper]
  );
  const [timer, setTimer] = useState<number>(0);
  const [board, setBoard] = useState<PlayerCell[][] | null>(null);
  const [mineRemaining, setMineRemaining] = useState<number>(0);
  const [inGame, setInGame] = useState<boolean>(false);
  const [hint, setHint] = useState<Solution | null>(null);

  const currentLevel = minesweeper.level;

  const updateMinesweeper = () => {
    setBoard(minesweeper.getBoard());
    setMineRemaining(minesweeper.numberOfmines - minesweeper.numberOfFlags);
    setHint(null);
    setInGame(!minesweeper.isEnd());
  };

  useEffect(() => {
    updateMinesweeper();
  }, []);

  useEffect(() => {
    if (!inGame) return;
    setTimer(0);
    const interval = setInterval(() => {
      setTimer((timer) => timer + 1);
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [inGame]);

  const handleReset = () => {
    minesweeper.reset();
    updateMinesweeper();
    setInGame(false);
    setTimer(0);
  };

  const getEmoji = () => {
    switch (minesweeper.gameState) {
      case GameStatus.Win:
        return "🥳";
      case GameStatus.Lose:
        return "🥲";
      case GameStatus.Playing:
        return "🙂";
    }
    return 404;
  };

  const getFormatedNum = (num: number) => {
    if (num < 10) {
      return `00${num}`;
    }
    if (num < 100) {
      return `0${num}`;
    }
    return num;
  };

  const getCellValue = (cell: PlayerCell) => {
    if (cell.state === CellState.Hidden) {
      return " ";
    }
    if (cell.state === CellState.Flagged) {
      return "🚩";
    }
    if (cell.state === CellState.Revealed) {
      if (cell.value === -1) {
        return "💣";
      }
      if (cell.value === 0) {
        return "";
      }
      return cell.value;
    }
  };

  const handleReveal = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    x: number,
    y: number
  ) => {
    if (e.detail === 2) minesweeper.revealNeighbors(x, y);
    else minesweeper.reveal(x, y);
    updateMinesweeper();
  };

  const handleFlag = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    x: number,
    y: number
  ) => {
    e.preventDefault();
    minesweeper.toggleFlag(x, y);
    updateMinesweeper();
  };

  const handleLevelChanging = (level: number) => {
    minesweeper.setLevel(level);
    updateMinesweeper();
  };

  const handleRunHint = () => {
    const solution = solver.hint();
    if (solution) {
      setHint(solution);
    }
  };

  const handleRunSolver = () => {
    solver.solve();
    updateMinesweeper();
  };

  const displayCoordinate = (coordinates: [x: number, y: number][]) => {
    return coordinates.map(([x, y]) => `(${x},${y})`).join(" ");
  };

  return (
    <div className="pt-12 h-full w-full min-w-max min-h-screen bg-zinc-700 text-center">
      <div className="p-2 inline-block rounded-xl border-slate-500 border">
        <div className="flex justify-between">
          <div className="text-slate-300 text-xl">
            {getFormatedNum(mineRemaining)}
          </div>
          <button onClick={handleReset} className="text-3xl shadow-sm">
            {getEmoji()}
          </button>
          <div className="text-slate-300 text-xl">{getFormatedNum(timer)}</div>
        </div>
        <div className="flex justify-around">
          {board && (
            <div className="p-5 flex flex-wrap flex-col">
              {board.map((row, y) => (
                <div className="flex m-auto" key={y}>
                  {row.map((cell, x) => (
                    <button
                      key={`${x}-${y}`}
                      className={`w-[1.1rem] h-[1.1rem] md:w-6 md:h-6 md:text-lg text-sm ${
                        cell.state !== CellState.Revealed
                          ? "bg-slate-700"
                          : "bg-slate-500"
                      } border border-slate-400`}
                      onClick={(e) => {
                        handleReveal(e, x, y);
                      }}
                      onContextMenu={(e) => {
                        handleFlag(e, x, y);
                      }}
                    >
                      {getCellValue(cell)}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
          <div className="w-[180px] m-5 border border-slate-500 rounded-lg text-slate-300 text-left">
            {hint && (
              <>
                <div>flaggable : {displayCoordinate(hint.flaggable)}</div>
                <div>revealable : {displayCoordinate(hint.revealable)}</div>
                {hint.flaggable.length === 0 &&
                  hint.revealable.length === 0 && (
                    <div>guess : {displayCoordinate(hint.guess!)}</div>
                  )}
              </>
            )}
          </div>
        </div>
        <div className="flex">
          <LevelSector
            LevelInfo={LEVELINFO}
            currentLevel={currentLevel}
            handleLevelChanging={handleLevelChanging}
          />
          <button
            className="w-[180px] ml-5 mt-5 bg-zinc-700 border border-slate-500 rounded-lg text-slate-300"
            onClick={handleRunHint}
          >
            Hint
          </button>
          <button
            className="w-[180px] ml-5 mt-5 bg-zinc-700 border border-slate-500 rounded-lg text-slate-300"
            onClick={handleRunSolver}
          >
            Solver
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
