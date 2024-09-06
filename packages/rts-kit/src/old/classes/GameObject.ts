import { getAngleBetweenDots, isGameObjectsCollided } from '../utils/utils';
import { GameController } from './GameController';
import { BehaviorSubject } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { componentDestroyed } from '../utils/component-destroyed';
import { takeUntil } from 'rxjs/operators';
import { GameObjectConfig } from './extended/game-config.interface';
import { Battle } from './Battle';
import { EventMe } from './utils/event-host/event-me.decorator';
import { EventName } from './utils/event-host/event-name.enum';

export interface IGameObjectParams {
  x: number;
  y: number;
}

export class GameObject {
  id = uuidv4();
  movementSpeed: number;
  radius: number;

  // @EventMe(EventName.OnGameObjectXChange)
  // x = 0;

  // @EventMe(EventName.OnGameObjectYChange)
  // y = 0;

  // @EventMe(EventName.OnGameObjectAngleChange)
  // angle = 0;
  x = new BehaviorSubject(0);
  y = new BehaviorSubject(0);
  angle = new BehaviorSubject(0);
  _destroyed = false;
  destroyed$ = componentDestroyed(this);

  constructor(
    public battle: Battle,
    public config: GameObjectConfig,
    params: IGameObjectParams,
  ) {
    this.x.next(params.x || 0);
    this.y.next(params.y || 0);
    this.movementSpeed = config.movementSpeed;
    this.radius = config.radius;
  }

  init(): void {
    GameController.ticker$.pipe(takeUntil(this.destroyed$)).subscribe(delta => {
      this.update(delta);
    });
  }

  destroy() {
    // do Nothing for this
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(delta: number) {
    throw new Error('Not implemented onUpdate');
  }

  stepTo(x: number, y: number, delta: number) {
    if (this.x.value === x && this.y.value === y) {
      return;
    }

    const angle = getAngleBetweenDots(this.x.value, this.y.value, x, y);
    this.setAngle(angle);

    let stepX =
      Math.cos((angle / 180) * Math.PI) * (this.movementSpeed / 60) * delta;
    let stepY =
      Math.sin((angle / 180) * Math.PI) * (this.movementSpeed / 60) * delta;

    if (
      Math.abs(stepX) > Math.abs(this.x.value - x) &&
      Math.abs(stepY) > Math.abs(this.y.value - y)
    ) {
      stepX = x - this.x.value;
      stepY = y - this.y.value;
    }

    this.setPosition(this.x.value + stepX, this.y.value + stepY);
  }

  lookTo(x: number, y: number): void {
    this.setAngle(getAngleBetweenDots(this.x.value, this.y.value, x, y));
  }

  setAngle(angle: number): void {
    if (this.angle.value === angle) {
      return;
    }

    this.angle.next(angle);
  }

  setPosition(x: number, y: number): void {
    this.x.next(x);
    this.y.next(y);
  }

  isCollidedWith(target: GameObject): boolean {
    if (this._destroyed || target._destroyed) {
      console.error('Cannot give collide for destroyed GameObjects');
      return false;
    }

    return isGameObjectsCollided(this, target);
  }
}
