import { Spell } from "./spell";
import { AttackType } from "../../constants";

export class WizardSpell extends Spell {
  doSpell() {
    this.target?.takeDamage(100, AttackType.Magic);
  }
}
