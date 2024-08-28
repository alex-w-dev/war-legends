import { MAX_BARRACK_LEVEL } from "../../../constants";
import { IBarackGetWarriorParams } from "../../../interfaces";
import { Warrior } from "../warriors/warrior";
import { KingdomBattle } from "../../KingdomBattle";
import { BarrackConfig, WarriorConfig } from "../../extended/game-config.interface";

export class Barrack {
  static buyPrice = 500;

  constructor(public battle: KingdomBattle, public config: BarrackConfig, public clan: number) {}

  level = 1;

  canUpgrade(): boolean {
    return this.level < MAX_BARRACK_LEVEL;
  }

  upgrade(): void {
    this.level++;
  }

  getWarrior(warriorConfig: WarriorConfig, warriorParams: IBarackGetWarriorParams): Warrior {
    return new Warrior(this.battle, warriorConfig, {
      clan: this.clan,
      x: warriorParams.x,
      y: warriorParams.y,
      enemyKingdomX: warriorParams.enemyKingdomX,
      enemyKingdomY: warriorParams.enemyKingdomY,
    });
  }

  getNextLevelPrice(): number {
    return Barrack.buyPrice + this.level * 500;
  }
}
