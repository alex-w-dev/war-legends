import { Warrior } from "../army/warriors/warrior";
import { Spell } from "../spells/spell";
import { random } from "lodash";
import { CastingType, WarriorType } from "../../constants";
import { CastingConfig } from "../extended/game-config.interface";
import { Bullet } from "../bullets/bullet";

export class WizardSpellFactory {
  getSpells(caster: Warrior, castingConfig: CastingConfig, target: Warrior): Spell[] | Bullet {
    if (castingConfig.spells) {
      return castingConfig.spells.map((spellConfig) => new Spell(spellConfig, caster, target));
    } else if (castingConfig.bullet) {
      return new Bullet(caster.battle, castingConfig.bullet, {
        target: target,
        attacker: caster,
        x: caster.x.value,
        y: caster.y.value,
      });
    } else {
      throw new Error(`No spell or bullet in castingConfig id: ${castingConfig.id}`);
    }
  }

  getSpellTarget(caster: Warrior, castingConfig: CastingConfig): Warrior | undefined {
    const possibleTargets = caster.battle.allWarriors.value.filter((target) => {
      return this.canCast(caster, target, castingConfig);
    });

    if (possibleTargets.length) {
      return possibleTargets[random(0, possibleTargets.length - 1)];
    } else {
      return undefined;
    }
  }

  private canCast(caster: Warrior, target: Warrior, castingConfig: CastingConfig): boolean {
    switch (castingConfig.type) {
      case CastingType.Base:
        return (
          target.clan !== caster.clan &&
          !target.config.magicResistance &&
          !target.isDead() &&
          caster.getTargetVisibility(target, castingConfig.range).isVisible
        );
      default:
        throw new Error(`Unknown castingConfig.type: ${castingConfig.type}`);
    }
  }
}

export const wizardSpellFactory = new WizardSpellFactory();
