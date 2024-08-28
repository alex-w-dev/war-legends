import { IMap } from "../maps/map-one";
import { Warrior } from "./army/warriors/warrior";
import { Battle } from "./Battle";

export class MapBattle extends Battle {
  constructor(public params: { map: IMap }) {
    super(params.map.gridWidth, params.map.gridHeight);
  }

  init(): void {
    super.init();

    this.params.map.warriros.forEach((warrior) => {
      this.registerWarrior(
        new Warrior(this, warrior.config, {
          clan: warrior.clan,
          enemyKingdomX: warrior.x,
          enemyKingdomY: warrior.y,
          x: warrior.x,
          y: warrior.y,
        }),
      );
    });
  }
}
