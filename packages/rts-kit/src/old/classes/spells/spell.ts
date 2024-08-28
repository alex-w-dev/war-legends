import { Warrior } from "../army/warriors/warrior";
import { componentDestroyed } from "../../utils/component-destroyed";
import { BehaviorSubject } from "rxjs";
import { SpellState, SpellType, WarriorType } from "../../constants";
import { WarriorAttackProcess } from "../army/warrior-attack-process";
import { SpellConfig } from "../extended/game-config.interface";
import { getDistanceBetweenObjects } from "../../utils/get-distance-between-objects";
import { eventPipe } from "../utils/event-host/event-pipe";
import { EventName } from "../utils/event-host/event-name.enum";
import { EventMe } from "../utils/event-host/event-me.decorator";
import { Battle } from "../Battle";

export class Spell {
  destroyed$ = componentDestroyed(this);
  _destroyed = false;

  battle: Battle;

  @EventMe(EventName.OnGameObjectAngleChange)
  state = SpellState.INIT;

  constructor(
    public config: SpellConfig,
    public caster: Warrior,
    public target: Warrior
  ) {
    this.battle = this.caster.battle;
  }

  init(): void {
    this.state = SpellState.PROGRESS;

    if (this.target) {
      new WarriorAttackProcess({
        target: this.target,
        attackTime: this.config.duration,
        attackPreDamageTime: this.config.timePoints,
        onEnd: () => this.destroy(),
        onDamage: () => this.doSpell(),
      });
    } else {
      console.error("No target in Spell");
      setTimeout(() => this.destroy());
    }
  }

  doSpell(): void {
    switch (this.config.type) {
      case SpellType.Damage:
        this.target?.takeDamage(this.config.attack!, this.config.attackType!);
        break;

      case SpellType.Stun:
        this.target?.takeStun(this.config.duration);
        break;

      case SpellType.SplashDamage:
        this.foreachSplash(this.target!, this.config.splashRadius!, (w) => {
          w.takeDamage(this.config.attack!, this.config.attackType!);
        });

        break;

      case SpellType.SplashSpells:
        this.foreachSplash(this.target!, this.config.splashRadius!, (w) => {
          this.config.splashSpells!.forEach((spellConfig) => {
            this.target!.battle.registerSpell(
              new Spell(spellConfig, this.caster, w)
            );
          });
        });

        break;

      default:
        throw new Error("Not implemented stun");
    }
  }

  private foreachSplash(
    target: Warrior,
    radius: number,
    cb: (warrior: Warrior) => void
  ) {
    const warriors = target.battle.allWarriors.value.filter(
      (w) =>
        w.clan === target.clan &&
        !w.config.magicResistance &&
        getDistanceBetweenObjects(target, w) <= (radius || 20)
    );

    warriors.forEach(cb);
  }

  destroy(): void {
    this.state = SpellState.COMPLETED;
    this.caster = null as unknown as Warrior;
    this.target = null as unknown as Warrior;
  }
}
