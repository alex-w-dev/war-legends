import { Warrior } from './army/warriors/warrior';
import { BehaviorSubject } from 'rxjs';
import { IWarriorWavePositionMatrix } from '../interfaces';
import { GRID_WIDTH, MAX_BARRACKS_COUNT, WarriorType } from '../constants';
import { KingdomBattle } from './KingdomBattle';
import { Barrack } from './army/barracks/barrack';
import {
  fromGridToReal,
  getWarriorWaveMatrixByGridPosition,
} from '../utils/utils';
import { GameController } from './GameController';
import { BarrackConfig } from './extended/game-config.interface';
import { BarrackId } from './extended/ids';

export class Kingdom {
  $gold: BehaviorSubject<number> = new BehaviorSubject<number>(6667);
  $barracks: BehaviorSubject<Barrack[]> = new BehaviorSubject<Barrack[]>([]);

  warriorMatrix: IWarriorWavePositionMatrix;

  constructor(
    public battle: KingdomBattle,
    public clan = 0,
    public gridX: number,
    public gridY: number,
  ) {
    this.warriorMatrix = getWarriorWaveMatrixByGridPosition(gridX, gridY);
    if (gridX < GRID_WIDTH / 2) {
      this.warriorMatrix =
        this.warriorMatrix.reverse() as IWarriorWavePositionMatrix;
    }

    setTimeout(() => {
      this.init();
    });
  }

  init(): void {
    this.$barracks.next([
      // new Barrack(this.battle, GameController.config.barracks[0], this.clan),
      new Barrack(this.battle, GameController.config.barracks[1], this.clan),
      new Barrack(this.battle, GameController.config.barracks[2], this.clan),
      new Barrack(this.battle, GameController.config.barracks[3], this.clan),
      new Barrack(this.battle, GameController.config.barracks[4], this.clan),
      new Barrack(this.battle, GameController.config.barracks[5], this.clan),
    ]);
  }

  getCastle(): Warrior {
    const enemyKingdom = this.getEnemyKingdom();

    const castleConfig = GameController.config.warriors.find(
      w => w.type === WarriorType.Tower,
    );

    if (!castleConfig) {
      throw new Error(
        'For kingdom You must have 1 Tower (warrior.type === WarriorType.Tower)',
      );
    }

    return new Warrior(this.battle, castleConfig, {
      clan: this.clan,
      x: fromGridToReal(this.gridX),
      y: fromGridToReal(this.gridY),
      enemyKingdomX: fromGridToReal(enemyKingdom.gridX),
      enemyKingdomY: fromGridToReal(enemyKingdom.gridY),
    });
  }

  getEnemyKingdom(): Kingdom {
    return this.battle.allKingdoms.find(k => k !== this) || this;
  }

  getWaveWarriors(): Warrior[] {
    const warriors: Warrior[] = [];
    const enemyKingdom = this.getEnemyKingdom();

    for (const barrack of this.$barracks.value) {
      warriors.push(
        barrack.getWarrior(
          GameController.getWarriorConfigById(barrack.config.warriorIds[0]),
          {
            x: this.warriorMatrix[this.$barracks.value.indexOf(barrack)][0],
            y: this.warriorMatrix[this.$barracks.value.indexOf(barrack)][1],
            enemyKingdomX: fromGridToReal(enemyKingdom.gridX),
            enemyKingdomY: fromGridToReal(enemyKingdom.gridY),
          },
        ),
      );
    }

    return warriors;
  }

  canBuyBarack(barrackConfig: BarrackConfig): boolean {
    return (
      barrackConfig.price < this.$gold.value &&
      this.$barracks.value.length < MAX_BARRACKS_COUNT
    );
  }

  buyBarack(barrackId: BarrackId): void {
    const barrackConfig = GameController.getBarrackConfigById(barrackId);

    if (!this.canBuyBarack(barrackConfig)) {
      return;
    }

    this.$gold.next(this.$gold.value - barrackConfig.price);
    this.addBarrack(barrackConfig);
  }

  private addBarrack(barrackConfig: BarrackConfig) {
    this.$barracks.next([
      ...this.$barracks.value,
      new Barrack(this.battle, barrackConfig, this.clan),
    ]);
  }

  upgradeBarrack(barrack: Barrack) {
    if (!this.canUpgradeBarrack(barrack)) {
      return;
    }

    this.$gold.next(this.$gold.value - barrack.getNextLevelPrice());
    barrack.upgrade();
  }

  canUpgradeBarrack(barrack: Barrack): boolean {
    return (
      barrack.canUpgrade() && this.$gold.value >= barrack.getNextLevelPrice()
    );
  }
}
