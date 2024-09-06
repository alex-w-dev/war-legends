import { Warrior } from './warriors/warrior';
import { GameController } from '../GameController';
import { Subscription } from 'rxjs';

export interface WarriorAttackProcessParams {
  target: Warrior;
  attackTime: number; // full attack time in milliseconds
  attackPreDamageTime?: number | number[]; // time to wait before damage event
  onDamage?: () => void;
  onEnd: () => void;
}

export class WarriorAttackProcess {
  private time = 0;
  private subscription: Subscription;
  private attackPreDamageTimes: number[];

  constructor(public params: WarriorAttackProcessParams) {
    this.attackPreDamageTimes = Array.isArray(this.params.attackPreDamageTime)
      ? this.params.attackPreDamageTime
      : this.params.attackPreDamageTime
        ? [this.params.attackPreDamageTime]
        : [];

    if (
      this.attackPreDamageTimes.some(
        attackPreDamageTime => attackPreDamageTime > this.params.attackTime,
      )
    ) {
      throw new Error('attackPreDamageTime cannot be large than attackTime');
    }
    this.subscription = GameController.ticker$.subscribe(delta =>
      this.update(delta),
    );
  }

  getTimeLeft(): number {
    return Math.max(0, this.params.attackTime - this.time);
  }

  stop(): void {
    this.destroy();
  }

  private update(delta: number): void {
    if (this.params.target.isDead() && this.attackPreDamageTimes.length) {
      this.subscription.unsubscribe();
      this.onEnd();

      return;
    }

    this.time += GameController.fpsIndex * delta;
    const needToDamageTimes = this.attackPreDamageTimes.filter(
      time => time <= this.time,
    );
    if (needToDamageTimes.length) {
      for (const needToDamageTime of needToDamageTimes) {
        this.onDamage();
      }
      this.attackPreDamageTimes = this.attackPreDamageTimes.filter(
        time => time > this.time,
      );
    }

    if (this.time > this.params.attackTime) {
      this.onEnd();
      this.destroy();
    }
  }

  private onDamage(): void {
    this.params.onDamage?.();
  }

  private onEnd(): void {
    this.params.onEnd();
  }

  private destroy(): void {
    this.subscription.unsubscribe();
  }
}
