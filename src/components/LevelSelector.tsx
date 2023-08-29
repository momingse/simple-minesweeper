import { FC, useRef, useState } from "react";
import { LevelInfo } from "../constant/level";
import Icons from "./Icons";

interface LevelSectorProps {
  LevelInfo: Record<number, LevelInfo>;
  currentLevel: number;
  handleLevelChanging: (level: number) => void;
}

const HEIGHT_OF_OPINION = 32;
const MARGIN_OF_SELECTOR = 8;

const LevelSector: FC<LevelSectorProps> = ({
  LevelInfo,
  currentLevel,
  handleLevelChanging,
}: LevelSectorProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const [up, setUp] = useState<boolean>(false);
  const selectorRef = useRef<HTMLDivElement | null>(null);

  const handleOpen = () => {
    setOpen((prev) => !prev);
    if (open || !selectorRef?.current) return;

    const spaceLeft =
      window.innerHeight - selectorRef.current?.getBoundingClientRect().bottom;
    const numberOfOpinion = Object.keys(LevelInfo).length;
    const isOverflow =
      spaceLeft < numberOfOpinion * HEIGHT_OF_OPINION + MARGIN_OF_SELECTOR;
    setUp(isOverflow);
  };

  const handleOnSelect = (level: string) => {
    setOpen(false);
    handleLevelChanging(parseInt(level));
  };

  const selectorHeight =
    Object.keys(LevelInfo).length * HEIGHT_OF_OPINION + MARGIN_OF_SELECTOR;

  return (
    <div className="relative">
      {open && up && (
        <div
          className="absolute bg-zinc-700 my-1 w-[180px] border border-slate-500 rounded-lg z-10"
          style={{ top: `-${selectorHeight}px` }}
        >
          {Object.entries(LevelInfo)
            .reverse()
            .map(([key, value]) => (
              <button
                className="w-full py-1 px-2 text-slate-300 text-left"
                onClick={() => handleOnSelect(key)}
              >
                {value.name}
              </button>
            ))}
        </div>
      )}
      <div
        className="w-[180px] mt-5  bg-zinc-700 border border-slate-500 rounded-lg"
        ref={selectorRef}
      >
        <div
          onClick={handleOpen}
          className="py-1 px-2 text-slate-300 flex justify-between items-center cursor-pointer"
        >
          <div className="pr-4">{LevelInfo[currentLevel].name}</div>
          <Icons.DownArrow className="text-sm w-3 h-3" />
        </div>
      </div>
      {open && !up && (
        <div className="absolute bg-zinc-700 my-1 w-[180px] border border-slate-500 rounded-lg z-10">
          {Object.entries(LevelInfo).map(([key, value]) => (
            <button
              className="w-full py-1 px-2 text-slate-300 text-left"
              onClick={() => handleOnSelect(key)}
            >
              {value.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LevelSector;
