export interface LevelInfo {
  name: string;
  width: number;
  height: number;
  mine: number;
}

export const LEVELINFO: Record<number, LevelInfo> = {
  0: {
    name: "Beginner",
    width: 9,
    height: 9,
    mine: 10,
  },
  1: {
    name: "Intermediate",
    width: 16,
    height: 16,
    mine: 40,
  },
  2: {
    name: "Expert",
    width: 30,
    height: 16,
    mine: 99,
  },
};
