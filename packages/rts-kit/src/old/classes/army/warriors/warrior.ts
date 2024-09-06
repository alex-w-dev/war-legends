import { GameController } from '../../GameController';
import { WarriorAttackProcess } from '../warrior-attack-process';
import { GameObject } from '../../GameObject';
import { Bullet } from '../../bullets/bullet';
import pd from 'pathfinding';
import Pathfinding, { DiagonalMovement, Grid, Util } from 'pathfinding';
import {
  IQueryablePromise,
  makeQueryablePromise,
} from '../../../utils/make-queryable-promise';
import { sleep } from '../../../utils/sleep';
import { fromGridToReal, fromRealToGrid } from '../../../utils/utils';
import {
  ArmorType,
  ATTACK_TO_ARMOR_INDEX,
  AttackType,
  MINIMUM_ATTACK_RANGE,
  VISIBLE_RANGE_FOR_ATTACK,
  WARRIOR_MOVE_GRID_OFFSET,
  WarriorState,
  WarriorType,
} from '../../../constants';
import { NewWarriorParams } from '../../../interfaces';
import { random } from 'lodash';
import { BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { getDistanceBetweenObjects } from '../../../utils/get-distance-between-objects';
import {
  BulletConfig,
  CastingConfig,
  WarriorConfig,
} from '../../extended/game-config.interface';
import { wizardSpellFactory } from '../../spell-factories/wizard.spell-factory';
import { Spell } from '../../spells/spell';
import { Battle } from '../../Battle';
import { MoveToPointTask } from '../../tasks/move-to-point.task';
import { Destroyable } from '../../Destroyable';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const biBestFirstFinder = new pd.BiBestFirstFinder({
  diagonalMovement: DiagonalMovement.Always,
  heuristic: pd.Heuristic.manhattan,
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const aStarFinder = new pd.AStarFinder({
  diagonalMovement: DiagonalMovement.Always,
  heuristic: pd.Heuristic.euclidean,
  weight: 2,
});

const biAStarFinder = new pd.BiAStarFinder({
  diagonalMovement: DiagonalMovement.Always,
  heuristic: pd.Heuristic.euclidean,
});

export class Warrior extends GameObject {
  static useGridPathFinding = false;

  type: WarriorType = WarriorType.Warrior;

  clan: number;
  state = new BehaviorSubject<WarriorState>(WarriorState.INIT); // not WarriorState.STAY
  health = new BehaviorSubject(0);
  healthMax: number;
  armor: number; // 100 * (Кол-во брони * 0,06) / (1 + Кол-во брони * 0,06)
  armorType: ArmorType;
  attackMin: number;
  attackMax: number;
  attackType: AttackType;
  attackRange: number;
  attackTime: number;
  attackPreDamageTime: number;
  currentAttackProcess: WarriorAttackProcess | null = null;
  currentCastingProcess: WarriorAttackProcess | null = null;
  gridX: number;
  gridY: number;
  enemyKingdomX: number;
  enemyKingdomY: number;

  bulletConfig?: BulletConfig;
  castingConfigs?: CastingConfig[];

  target: Warrior | null = null;

  private targetFollowingCount = 0;
  private stunProcess?: WarriorAttackProcess;
  private spellRollbackProcesses = new Map<
    CastingConfig,
    WarriorAttackProcess
  >();

  private currentTask: IQueryablePromise<void> = makeQueryablePromise(
    Promise.resolve(),
  );

  private newCurrentTask?: Destroyable;

  constructor(
    public battle: Battle,
    public config: WarriorConfig,
    params: NewWarriorParams,
  ) {
    super(battle, config, params);

    this.target = null;
    this.clan = params.clan;
    this.enemyKingdomX = params.enemyKingdomX;
    this.enemyKingdomY = params.enemyKingdomY;
    this.gridX = fromRealToGrid(this.x.value);
    this.gridY = fromRealToGrid(this.y.value);

    this.castingConfigs = this.config.castings;
    this.bulletConfig = this.config.bullet;
    this.type = this.config.type;
    this.radius = this.config.radius;
    this.healthMax = this.config.healthMax;
    this.armor = this.config.armor;
    this.armorType = this.config.armorType;
    this.attackMin = this.config.attackMin;
    this.attackMax = this.config.attackMax;
    this.attackType = this.config.attackType;
    this.attackTime = this.config.attackTiming.completeAction;
    this.attackPreDamageTime = this.config.attackTiming.preAction;
    this.attackRange = Math.max(MINIMUM_ATTACK_RANGE, this.config.attackRange);
  }

  canDoTasks() {
    return !this.isDead() && !this.isStunned() && !this._destroyed;
  }

  init() {
    super.init();

    this.health.next(this.healthMax);

    // init grd position
    const initialGridX = this.gridX;
    const initialGridY = this.gridY;
    const freeGridNode = this.getPossibleNode(initialGridX, initialGridY);
    if (freeGridNode) {
      this.setState(WarriorState.IDLE);
      if (this.gridX !== freeGridNode.x || this.gridY !== freeGridNode.y) {
        this.setPosition(
          fromGridToReal(freeGridNode.x),
          fromGridToReal(freeGridNode.y),
        );
      }
      this.addToGrid(freeGridNode.x, freeGridNode.y);
    } else {
      this.setState(WarriorState.DYING);
    }
  }

  getAttack(): number {
    return random(this.attackMin, this.attackMax);
  }

  getBounty(): number {
    return this.config.price;
  }

  isDead(): boolean {
    return (
      this.state.value === WarriorState.DYING ||
      this.state.value === WarriorState.INIT
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(delta: number) {
    return;
    if (this.isDead()) {
      return;
    }

    if (this.currentTask.isPending() || this.isStunned()) {
      return;
    }

    this.currentTask = this.getNewTask();
  }

  canCastSpell(castingConfig: CastingConfig): boolean {
    return !this.spellRollbackProcesses.has(castingConfig);
  }

  getNewTask(): IQueryablePromise<void> {
    if (
      this.isStunned() ||
      (this.target && this.target.isDead()) ||
      this.targetFollowingCount === 3
    ) {
      this.target = null;
    }

    if (this.isStunned()) {
      return makeQueryablePromise(sleep(10));
    }

    if (this.castingConfigs) {
      for (const castingConfig of this.castingConfigs) {
        if (this.canCastSpell(castingConfig)) {
          const spellTarget = wizardSpellFactory.getSpellTarget(
            this,
            castingConfig,
          );

          if (spellTarget) {
            return makeQueryablePromise(
              this.getSpellOnTargetTask(spellTarget, castingConfig),
            );
          }
        }
      }
    }

    if (!this.target) {
      // try to find new target
      const enemyNear = this.getEnemyNear();

      if (enemyNear) {
        this.targetFollowingCount = 0;
        this.target = enemyNear;
      }
    }

    if (this.target) {
      // attack target
      if (this.canAttackTarget(this.target)) {
        return makeQueryablePromise(this.getAttackTargetTask(this.target));
      } else {
        if (
          this.getTargetVisibility(this.target, VISIBLE_RANGE_FOR_ATTACK)
            .isVisible
        ) {
          return makeQueryablePromise(this.getMoveToTargetTask(this.target));
        } else {
          this.target = null;
        }
      }
    }

    // go to center
    return makeQueryablePromise(
      this.getMoveToPointTask(this.enemyKingdomX, this.enemyKingdomY),
    );
  }

  getAttackTargetTask(target: Warrior): Promise<void> {
    this.lookTo(target.x.value, target.y.value);

    return new Promise<void>(resolve => {
      this.currentAttackProcess = new WarriorAttackProcess({
        target,
        attackTime: this.attackTime,
        attackPreDamageTime: this.attackPreDamageTime,
        onDamage: () => this.kickTarget(target),
        onEnd: () => {
          resolve();
          this.currentAttackProcess = null;
          this.returnToIdleAfterAttack();
        },
      });

      this.setState(WarriorState.ATTACK);
    });
  }

  returnToIdleAfterAttack(): void {
    if (!this.isDead() && !this.isStunned()) {
      this.setState(WarriorState.IDLE);
    }
  }

  getSpellOnTargetTask(
    target: Warrior,
    castingConfig: CastingConfig,
  ): Promise<void> {
    this.lookTo(target.x.value, target.y.value);

    return new Promise<void>(resolve => {
      this.currentCastingProcess = new WarriorAttackProcess({
        target,
        attackTime: castingConfig.timing.completeAction,
        attackPreDamageTime: castingConfig.timing.preAction,
        onDamage: () => this.spellOnTarget(target, castingConfig),
        onEnd: () => {
          resolve();
          this.currentCastingProcess = null;
          this.returnToIdleAfterAttack();
        },
      });

      this.setState(WarriorState.CASTING);
    });
  }

  getMoveToTargetTask(target: Warrior): Promise<void> {
    this.targetFollowingCount++;

    return this.getMoveToPointTask(target.x.value, target.y.value);
  }

  getPathToPoint(
    x: number,
    y: number,
  ): { x: number; y: number; gridX: number; gridY: number }[] {
    const pointGridX = fromRealToGrid(x);
    const pointGridY = fromRealToGrid(y);

    if (this.gridY === pointGridY && this.gridX === pointGridX) {
      return [];
    }

    const neighbors = this.battle.battleGround.warriorGrid.getNeighbors(
      this.battle.battleGround.warriorGrid.getNodeAt(this.gridX, this.gridY),
      DiagonalMovement.Always,
    );
    if (neighbors.every(n => !n.walkable)) {
      return [];
    }

    const path = Warrior.useGridPathFinding
      ? this.getClosestPath(pointGridX, pointGridY)
      : this.getFakeClosesPath(pointGridX, pointGridY);
    const myGridPositionPoint = path[0];
    const pathWithoutMyPoint = path.filter(p => p !== myGridPositionPoint);

    return pathWithoutMyPoint.map(p => ({
      x: fromGridToReal(p[0]),
      y: fromGridToReal(p[1]),
      gridX: p[0],
      gridY: p[1],
    }));
  }

  getFakeClosesPath(gridX: number, gridY: number): number[][] {
    return Util.expandPath([
      [this.gridX, this.gridY],
      [gridX, gridY],
    ]);
  }

  getClosestPath(
    gridX: number,
    gridY: number,
    clonedGrid: Grid = this.battle.battleGround.warriorGrid.clone(),
    offset = 0,
  ): number[][] {
    if (offset === 5) {
      return [];
    }
    if (offset === 0) {
      // make self walkable first time
      clonedGrid.setWalkableAt(this.gridX, this.gridY, true);
    }

    for (let x = -offset; x <= offset; x++) {
      for (let y = -offset; y <= offset; y++) {
        // make target walkable (and offset too)
        // TODO if offset near border of grid - can be BUGS
        clonedGrid.setWalkableAt(
          Math.max(
            0,
            Math.min(gridX + x, this.battle.battleGround.warriorGridMaxX),
          ),
          Math.max(
            0,
            Math.min(gridY + y, this.battle.battleGround.warriorGridMaxY),
          ),
          true,
        );
      }
    }

    // cloned grid cloned again for fix findPath grid changes (see documentation)
    let path;

    try {
      path = biAStarFinder.findPath(
        this.gridX,
        this.gridY,
        gridX,
        gridY,
        clonedGrid.clone(),
      );
    } catch (e) {
      console.log(
        this.gridX,
        this.gridY,
        gridX,
        gridY,
        'this.gridX, this.gridY, gridX, gridY',
      );
      throw e;
    }

    if (path.length) {
      // remove unavailable cells from path
      for (
        let i = 1 /*ignore 0, because it is self point*/;
        i < path.length;
        i++
      ) {
        const isWalkable = this.battle.battleGround.warriorGrid.isWalkableAt(
          path[i][0],
          path[i][1],
        );

        if (!isWalkable) {
          return path.slice(0, i);
        }
      }
    } else {
      return this.getClosestPath(gridX, gridY, clonedGrid, offset + 1);
    }

    return path;
  }

  moveTo(x: number, y: number): void {
    this.runNewTask(new MoveToPointTask(this, x, y));
  }

  runNewTask(task: Destroyable): void {
    if (this.newCurrentTask) {
      this.newCurrentTask.destroy();
    }
    this.newCurrentTask = task;
  }

  getMoveToPointTask(x: number, y: number): Promise<void> {
    if (!this.movementSpeed || (this.x.value === x && this.y.value === y)) {
      this.setState(WarriorState.IDLE);
      return sleep(500);
    }

    this.lookTo(x, y);

    if (
      ++GameController.currentPathFindingCount >
      GameController.defaultPathFindingLimit
    ) {
      this.setState(WarriorState.IDLE);
      return sleep(random(400, 800));
    }

    const pathToPoint = this.getPathToPoint(x, y);

    const thisTaskTargetPosition = pathToPoint[0];

    if (thisTaskTargetPosition) {
      this.removeFromGrid();
      this.addToGrid(
        thisTaskTargetPosition.gridX,
        thisTaskTargetPosition.gridY,
      );

      this.setState(WarriorState.MOVEMENT);

      return new Promise<void>(resolve => {
        const subscription = GameController.ticker$
          .pipe(takeUntil(this.destroyed$))
          .subscribe(delta => {
            if (this.isDead() || this.isStunned()) {
              return resolve();
            }

            this.stepTo(
              thisTaskTargetPosition.x,
              thisTaskTargetPosition.y,
              delta,
            );

            if (
              Math.abs(this.x.value - thisTaskTargetPosition.x) <
                WARRIOR_MOVE_GRID_OFFSET &&
              Math.abs(this.y.value - thisTaskTargetPosition.y) <
                WARRIOR_MOVE_GRID_OFFSET
            ) {
              resolve();
              subscription.unsubscribe();
            }
          });

        this.stepTo(
          thisTaskTargetPosition.x,
          thisTaskTargetPosition.y,
          GameController.currentTickDelta,
        );
      });
    } else {
      this.setState(WarriorState.IDLE);
      return sleep(500);
    }
  }

  getEnemyNear(): Warrior | undefined {
    let enemyNearData: {
      warrior: Warrior | undefined;
      distance: number;
    } = {
      warrior: undefined,
      distance: Infinity,
    };

    this.battle.allWarriors.value
      .filter(warrior => {
        return (
          !warrior.isDead() && // cannot attack dead warriors
          warrior.clan !== this.clan // not my clan (also , i'm not here)
        );
      })
      .forEach(warrior => {
        const warriorVisibility = this.getTargetVisibility(
          warrior,
          VISIBLE_RANGE_FOR_ATTACK,
        );
        const nearest = enemyNearData.distance > warriorVisibility.distance;

        if (warriorVisibility.isVisible && nearest) {
          enemyNearData = {
            warrior,
            distance: warriorVisibility.distance,
          };
        }
      });

    return enemyNearData?.warrior;
  }

  getTargetVisibility(
    target: Warrior,
    visibleRange: number,
  ): { distance: number; isVisible: boolean } {
    const distance = getDistanceBetweenObjects(this, target);

    return {
      distance,
      isVisible: distance <= visibleRange,
    };
  }

  takeStun(duration: number): void {
    if (this.stunProcess) {
      if (duration > this.stunProcess.getTimeLeft()) {
        this.stunProcess.stop();
      } else {
        return;
      }
    }

    this.setState(WarriorState.STUN);

    this.stunProcess = new WarriorAttackProcess({
      target: this,
      attackPreDamageTime: duration,
      attackTime: duration,
      onEnd: () => {
        if (!this.isDead()) {
          this.setState(WarriorState.IDLE);
        }
        this.stunProcess = undefined;
      },
    });
  }

  isStunned(): boolean {
    return WarriorState.STUN === this.state.value;
  }

  takeDamage(attack: number, attackType: AttackType): void {
    if (this.isDead()) {
      return;
    }

    if (this.health.value === 0) {
      throw new Error('Something went wrong with health');
    }

    const attackIndex = ATTACK_TO_ARMOR_INDEX[attackType][this.armorType];

    this.health.next(
      Math.max(
        0,
        Math.min(
          this.health.value,
          this.health.value -
            Math.ceil(
              attack *
                (1 - (this.armor * 0.06) / (1 + this.armor * 0.06)) *
                attackIndex,
            ),
        ),
      ),
    );

    if (this.health.value === 0) {
      this.setState(WarriorState.DYING);
    }
  }

  kickTarget(target: Warrior): void {
    if (
      !this.target ||
      this.isDead() ||
      this.isStunned() ||
      this.target !== target
    ) {
      return;
    }

    if (this.bulletConfig) {
      const bullet = new Bullet(this.battle, this.bulletConfig, {
        x: this.x.value,
        y: this.y.value,
        attacker: this,
        target: this.target,
      });

      this.battle.registerBullet(bullet);
    } else {
      this.makeAttackToTarget(this.target);
    }
  }

  makeAttackToTarget(target: Warrior): void {
    const attack = this.getAttack();
    target.takeDamage(attack, this.attackType);

    if (this.config.splash) {
      const warriorsNear = this.battle.allWarriors.value.filter(
        w =>
          w.clan === target.clan &&
          getDistanceBetweenObjects(target, w) <= this.config.splash!.radius &&
          w !== this.target,
      );

      warriorsNear.forEach(w => {
        w.takeDamage(attack * this.config.splash!.factor, this.attackType);
      });
    }

    if (this.config.spellsOnDamage && !target.config.magicResistance) {
      this.config.spellsOnDamage
        .filter(spellOnDamage => Math.random() < spellOnDamage.chance)
        .forEach(spellOnDamage => {
          this.battle.registerSpell(
            new Spell(spellOnDamage.spell, this, target),
          );
        });
    }
  }

  spellOnTarget(target: Warrior, castingConfig: CastingConfig): void {
    if (
      this.isDead() ||
      this.isStunned() ||
      target.isDead() ||
      !this.canCastSpell(castingConfig)
    ) {
      return;
    }

    if (this.castingConfigs) {
      const spellsOrBullet = wizardSpellFactory.getSpells(
        this,
        castingConfig,
        target,
      );

      this.spellRollbackProcesses.set(
        castingConfig,
        new WarriorAttackProcess({
          target: this,
          attackTime: castingConfig.timing.rollback,
          onEnd: () => {
            this.spellRollbackProcesses.delete(castingConfig);
          },
        }),
      );

      if (Array.isArray(spellsOrBullet)) {
        spellsOrBullet.forEach(spell => this.battle.registerSpell(spell));
      } else {
        this.battle.registerBullet(spellsOrBullet);
      }
    }
  }

  canAttackTarget(target: Warrior): boolean {
    if (target.isDead()) {
      return false;
    }

    const diffX = this.x.value - target.x.value;
    const diffY = this.y.value - target.y.value;

    return Math.sqrt(diffX * diffX + diffY * diffY) <= this.attackRange;
  }

  removeFromGrid(): void {
    this.battle.battleGround.warriorGrid.setWalkableAt(
      this.gridX,
      this.gridY,
      true,
    );
  }

  addToGrid(gridX: number, gridY: number): void {
    this.battle.battleGround.warriorGrid.setWalkableAt(gridX, gridY, false);
    this.gridX = gridX;
    this.gridY = gridY;
  }

  setState(newState: WarriorState): void {
    if (this.state.value === newState) {
      return;
    }

    this.state.next(newState);

    if (newState === WarriorState.DYING) {
      this.preDestroy();
    }
  }

  preDestroy(): void {
    this.target = null;
    this.removeFromGrid();

    let i = 0;
    GameController.ticker$.pipe(takeUntil(this.destroyed$)).subscribe(delta => {
      i += delta;

      i += GameController.fpsIndex * delta;
      if (i > 5000) {
        this.destroy();
      }
    });
  }

  getPossibleNode(gridX: number, gridY: number): Pathfinding.Node | undefined {
    let walkableNode: Pathfinding.Node | undefined = undefined;

    for (let i = 0; i < 5; i++) {
      for (let j = -i; j <= i; j++) {
        for (let k = -i; k <= i; k++) {
          if (
            gridX + j >= this.battle.battleGround.warriorGrid.width ||
            gridX + j < 0 ||
            gridY + k >= this.battle.battleGround.warriorGrid.height ||
            gridY + k < 0
          ) {
            continue;
          }

          const node = this.battle.battleGround.warriorGrid.getNodeAt(
            gridX + j,
            gridY + k,
          );
          if (node.walkable) {
            walkableNode = node;
            i = k = j = 100;
          }
        }
      }
    }

    return walkableNode;
  }
}
