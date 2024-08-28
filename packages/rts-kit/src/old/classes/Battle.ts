import { Warrior } from "./army/warriors/warrior";
import { BattleGround } from "./BattleGround";
import { GRID_DIMENSION_SIZE, GRID_HEIGHT, GRID_WIDTH } from "../constants";
import { Bullet } from "./bullets/bullet";
import { BehaviorSubject } from "rxjs";
import { Spell } from "./spells/spell";
import { EventHost } from "./utils/event-host/event-host";

export class Battle {
  allWarriors = new BehaviorSubject([] as Warrior[]);
  allBullets = new BehaviorSubject([] as Bullet[]);
  allSpells = new BehaviorSubject([] as Spell[]);

  onEndCb?: Function;

  battleGround: BattleGround;
  eventHost: EventHost;

  constructor(gridWidth = GRID_WIDTH, gridHeight = GRID_HEIGHT) {
    this.battleGround = new BattleGround(gridWidth * GRID_DIMENSION_SIZE, gridHeight * GRID_DIMENSION_SIZE);
    this.eventHost = new EventHost();
  }

  onEnd(cb: Function) {
    this.onEndCb = cb;
  }

  init() {}

  end() {
    this.onEndCb?.();
  }

  destroy(): void {
    this.allWarriors.value.forEach((one) => one.destroy());
    this.allBullets.value.forEach((one) => one.destroy());
    this.allSpells.value.forEach((one) => one.destroy());
    this.allWarriors.complete();
    this.allBullets.complete();
    this.allSpells.complete();
  }

  registerWarrior(warrior: Warrior): void {
    warrior.init();
    this.allWarriors.next([...this.allWarriors.value, warrior]);

    const subscription = warrior.destroyed$.subscribe(() => {
      subscription.unsubscribe();
      this.allWarriors.next(this.allWarriors.value.filter((w) => w !== warrior));
    });
  }

  registerBullet(bullet: Bullet): void {
    bullet.init();
    this.allBullets.next([...this.allBullets.value, bullet]);
    const subscription = bullet.destroyed$.subscribe(() => {
      subscription.unsubscribe();
      this.allBullets.next(this.allBullets.value.filter((b) => b !== bullet));
    });
  }

  registerSpell(spell: Spell): void {
    spell.init();
    this.allSpells.next([...this.allSpells.value, spell]);
    const subscription = spell.destroyed$.subscribe(() => {
      subscription.unsubscribe();
      this.allSpells.next(this.allSpells.value.filter((s) => s !== spell));
    });
  }
}
