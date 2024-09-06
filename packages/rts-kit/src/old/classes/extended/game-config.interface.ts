import {
  ArmorType,
  AttackType,
  BulletType,
  CastingType,
  SpellType,
  WarriorType,
} from '../../constants';
import { BarrackId, WarriorId } from './ids';

export type GameObjectConfig = {
  id: string;
  movementSpeed: number; // pixels per 1 sec
  radius: number; // pixels
};

export type CastingConfig = {
  id: string;
  type: CastingType;
  timing: Timing;
  range: number;
  bullet?: BulletConfig;
  spells?: SpellConfig[];
};

export type SpellConfig = {
  id: string;
  attack?: number;
  attackType?: AttackType;
  type: SpellType;
  timePoints: number[]; // spell on times
  duration: number; // grater than any of time points
  splashRadius?: number; // pixels around target
  splashSpells?: SpellConfig[]; // pixels around target
};

export type BulletConfig = GameObjectConfig & {
  type: BulletType;
};

export type Timing = {
  preAction: number;
  completeAction: number;
  rollback: number;
};

export type WarriorConfig = GameObjectConfig & {
  type: WarriorType;
  magicResistance?: boolean;
  price: number;
  healthMax: number;
  armor: number;
  armorType: ArmorType;
  attackMin: number;
  attackMax: number;
  attackType: AttackType;
  attackRange: number;
  attackTiming: Timing;
  bullet?: BulletConfig;
  castings?: CastingConfig[];
  splash?: {
    factor: number; // form 0 to 1 : attack * splashDamageReduce (пример: если 0.3, то рядом будет только 30 процентов от урона )
    radius: number;
  };
  spellsOnDamage?: Array<{
    spell: SpellConfig; // You can make micro stuns, bleeding, extra damage etc
    chance: number; // chance for spell : 0 - no chances , 0.5 50%, 1 - 100%
  }>;
};

export type BarrackConfig = {
  id: BarrackId;
  level: number;
  price: number;
  warriorIds: WarriorId[];
  childrenIds?: BarrackId[];
};

export type IGameConfig = {
  barracks: BarrackConfig[];
  warriors: WarriorConfig[];
};
