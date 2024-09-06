import { WarriorConfig } from '../classes/extended/game-config.interface';

export type IMap = {
  name: string;
  gridWidth: number;
  gridHeight: number;
  warriros: Array<{
    clan: number;
    x: number;
    y: number;
    config: WarriorConfig;
  }>;
};
