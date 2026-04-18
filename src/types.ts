export interface PlayerRecord {
  name: string;
  score: number;
}

export type GameType = 'flappy' | 'catch';

export interface Bird {
  x: number;
  y: number;
  width: number;
  height: number;
  gravity: number;
  lift: number;
  velocity: number;
}

export interface Pipe {
  x: number;
  top: number;
  passed: boolean;
}

export type CatchItemType = 'heart' | 'bomb';

export interface CatchItem {
  x: number;
  y: number;
  speed: number;
  type: CatchItemType;
}
