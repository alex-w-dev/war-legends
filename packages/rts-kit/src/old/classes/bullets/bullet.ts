import { GameObject, IGameObjectParams } from '../GameObject';
import { Warrior } from '../army/warriors/warrior';
import { BulletState } from '../../constants';
import { BehaviorSubject } from 'rxjs';
import { BulletConfig } from '../extended/game-config.interface';
import { Battle } from '../Battle';

export interface IBulletParams extends IGameObjectParams {
  attacker: Warrior;
  target: Warrior;
}

export class Bullet extends GameObject {
  state = new BehaviorSubject<BulletState>(BulletState.MOVEMENT);

  target: Warrior;
  attacker: Warrior;

  constructor(
    public battle: Battle,
    public config: BulletConfig,
    params: IBulletParams,
  ) {
    super(battle, config, params);

    this.target = params.target;
    this.attacker = params.attacker;
  }

  init(): void {
    super.init();

    this.lookTo(this.target.x.value, this.target.y.value);
  }

  destroy(): void {
    super.destroy();

    this.attacker = null as unknown as Warrior;
    this.target = null as unknown as Warrior;
  }

  update(delta: number): void {
    if (this.isCollidedWith(this.target)) {
      this.attacker.makeAttackToTarget(this.target);

      this.destroy();
    } else {
      this.stepTo(this.target.x.value, this.target.y.value, delta);
    }
  }
}
