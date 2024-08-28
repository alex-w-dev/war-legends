export enum KingdomPosition {
  // TopLeft = 1,
  // TopRight = 2,
  // BottomLeft = 3,
  // BottomRight = 4,
  Top = 5,
  Bottom = 6,
}

export enum AttackType {
  Arrow = "Arrow",
  Sword = "Sword",
  Magic = "Magic",
  Siege = "Siege",
}
export enum ArmorType {
  Light = "Light",
  Heavy = "Heavy",
  Magic = "Magic",
  Building = "Building",
}
export enum WarriorType {
  Tower = "Tower",
  Warrior = "Warrior",
}
export enum BulletType {
  Base = "Base",
  Bounce = "Bounce",
}
export enum SpellType {
  Heal = "Heal", // обычный хил (или постепенный)
  Damage = "Damage", // обычный урон (взрыв, яд)
  SplashDamage = "SplashDamage", // когда анимация одна (target) а урон площадь
  SplashSpells = "SplashSpells", // анимация на target (или нет анимации). А также по радиусу другие магии на каждом warrior включая target
  Stun = "Stun", // вызывает warrior.takeStun
}
export enum CastingType {
  Base = "Base",
}

export const ATTACK_TO_ARMOR_INDEX = {
  [AttackType.Sword]: {
    [ArmorType.Heavy]: 1,
    [ArmorType.Building]: 0.5,
    [ArmorType.Light]: 1.3,
    [ArmorType.Magic]: 0.7,
  },
  [AttackType.Arrow]: {
    [ArmorType.Heavy]: 0.7,
    [ArmorType.Building]: 0.5,
    [ArmorType.Light]: 1,
    [ArmorType.Magic]: 1.3,
  },
  [AttackType.Magic]: {
    [ArmorType.Heavy]: 1.3,
    [ArmorType.Building]: 0.5,
    [ArmorType.Light]: 0.7,
    [ArmorType.Magic]: 1,
  },
  [AttackType.Siege]: {
    [ArmorType.Heavy]: 0.5,
    [ArmorType.Building]: 1.5,
    [ArmorType.Light]: 0.5,
    [ArmorType.Magic]: 0.5,
  },
};

export enum WarriorState {
  IDLE = "IDLE",
  ATTACK = "ATTACK",
  CASTING = "CASTING",
  MOVEMENT = "MOVEMENT",
  DYING = "DYING",
  STUN = "STUN",
  INIT = "INIT",
}

export enum BulletState {
  MOVEMENT = "MOVEMENT",
}

export enum SpellState {
  INIT = "INIT",
  PROGRESS = "PROGRESS",
  COMPLETED = "COMPLETED",
}

export const GRID_WIDTH = 80;
export const GRID_HEIGHT = 28;
export const GRID_DIMENSION_SIZE = 10;
export const ARENA_WIDTH = GRID_WIDTH * GRID_DIMENSION_SIZE;
export const ARENA_HEIGHT = GRID_HEIGHT * GRID_DIMENSION_SIZE;
export const GRID_DIMENSION_HALF_SIZE = GRID_DIMENSION_SIZE / 2;
export const WARRIOR_MOVE_GRID_OFFSET = GRID_DIMENSION_HALF_SIZE / 2;
const minimAttackRangeByAxios = WARRIOR_MOVE_GRID_OFFSET * 2 + GRID_DIMENSION_SIZE;
export const MINIMUM_ATTACK_RANGE = Math.sqrt(
  minimAttackRangeByAxios * minimAttackRangeByAxios + minimAttackRangeByAxios * minimAttackRangeByAxios
);
export const MILE_RANGE_ATTACK = MINIMUM_ATTACK_RANGE + 1; // according MINIMUM_ATTACK_RANGE

export const MAX_BARRACKS_COUNT = 9;
export const MAX_BARRACK_LEVEL = 5;

export const VISIBLE_RANGE_FOR_ATTACK = 500;

export const WAVE_INTERVAL_MS = 10000;

export const MATH_PI = 3.14;
export const RAD3DEG = Math.round((180 / Math.PI) * 100) / 100;
