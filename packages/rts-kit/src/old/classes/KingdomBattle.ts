import { Warrior } from './army/warriors/warrior';
import { Kingdom } from './Kingdom';
import { BattleGround } from './BattleGround';
import { GameController } from './GameController';
import {
  AttackType,
  GRID_DIMENSION_SIZE,
  GRID_HEIGHT,
  GRID_WIDTH,
  WarriorState,
  WAVE_INTERVAL_MS,
} from '../constants';
import { Bullet } from './bullets/bullet';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Spell } from './spells/spell';
import { Battle } from './Battle';

export class KingdomBattle extends Battle {
  allWarriors = new BehaviorSubject([] as Warrior[]);
  allBullets = new BehaviorSubject([] as Bullet[]);
  allSpells = new BehaviorSubject([] as Spell[]);
  allKingdoms: Kingdom[];

  battleGround: BattleGround = new BattleGround(
    GRID_WIDTH * GRID_DIMENSION_SIZE,
    GRID_HEIGHT * GRID_DIMENSION_SIZE,
  );

  private timeForNextWave: number = Math.round(WAVE_INTERVAL_MS);

  private lastWaveTime = Date.now();

  private gameTickerSubsctiprion: Subscription | null = null;
  private castleStateSubscriptions: Subscription[] = [];

  constructor() {
    super();

    this.allKingdoms = [
      new Kingdom(this, 1, 1, GRID_HEIGHT / 2),
      new Kingdom(this, 2, GRID_WIDTH - 1, GRID_HEIGHT / 2),
    ];

    setTimeout(() => {
      this.startRound();
    });
  }

  private startRound(): void {
    this.lastWaveTime = GameController.now - WAVE_INTERVAL_MS;
    this.gameTickerSubsctiprion = GameController.tickerHalfOfSecond$.subscribe(
      () => {
        this.timeForNextWave = this.getTimeForNextWave();

        if (this.timeForNextWave === 0) {
          this.runNextWave();
        }
      },
    );
    this.allKingdoms.forEach(kingdom => {
      const castle = kingdom.getCastle();

      this.castleStateSubscriptions.push(
        castle.state.subscribe(s => {
          if (s === WarriorState.DYING) {
            this.clearRound();
            setTimeout(() => {
              // TODO fix it to end game
              this.startRound();
            });
          }
        }),
      );

      this.registerWarrior(castle);
    });
  }

  private clearRound(): void {
    this.gameTickerSubsctiprion?.unsubscribe();
    this.castleStateSubscriptions.forEach(subscribtion =>
      subscribtion.unsubscribe(),
    );
    this.allWarriors.value.forEach(warrior => {
      warrior.takeDamage(Infinity, AttackType.Magic);
    });
  }

  private getTimeForNextWave(): number {
    return Math.max(
      0,
      Math.round(
        (WAVE_INTERVAL_MS + this.lastWaveTime - GameController.now) / 1000,
      ),
    );
  }

  private runNextWave(): void {
    this.addWaveWarriors();
    this.lastWaveTime = GameController.now;
  }

  private addWaveWarriors = () => {
    this.allKingdoms.forEach(kingdom => {
      kingdom.getWaveWarriors().forEach(warrior => {
        this.registerWarrior(warrior);
      });
    });
  };

  registerWarrior(warrior: Warrior): void {
    super.registerWarrior(warrior);

    const subscription2 = warrior.state.subscribe(state => {
      if (state === WarriorState.DYING) {
        this.allKingdoms
          .filter(k => k.clan !== warrior.clan)
          .forEach(k =>
            k.$gold.next(k.$gold.value + Math.round(warrior.getBounty())),
          );
      }
    });

    const subscription = warrior.destroyed$.subscribe(() => {
      subscription2.unsubscribe();
      subscription.unsubscribe();
    });
  }
}
