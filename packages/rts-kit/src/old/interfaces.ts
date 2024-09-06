import { IGameObjectParams } from './classes/GameObject';
import { Warrior } from './classes/army/warriors/warrior';

export type IBarrack = {
  level: number;
  price: number;
  warriorParams: Partial<IWarriorParams>;
  warriorInstance: typeof Warrior;
};

export interface IWarriorParams extends IGameObjectParams {
  clan: number;
  enemyKingdomX: number;
  enemyKingdomY: number;
}

export type IBarackGetWarriorParams = Pick<
  IWarriorParams,
  'x' | 'y' | 'enemyKingdomX' | 'enemyKingdomY'
>;
export type NewWarriorParams = IBarackGetWarriorParams &
  Pick<IWarriorParams, 'clan'> &
  IGameObjectParams;

// center and near positions (topLeft, topCenter, topRight, centerLeft, centerCenter ... etc.)
export type IWarriorWavePositionMatrix = [
  [number, number],
  [number, number],
  [number, number],
  [number, number],
  [number, number],
  [number, number],
  [number, number],
  [number, number],
  [number, number],
];
