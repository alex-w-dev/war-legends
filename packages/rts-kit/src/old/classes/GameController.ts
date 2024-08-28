import { Subject } from "rxjs";
import * as PIXI from "pixi.js";
import { Warrior } from "./army/warriors/warrior";
import { throttleTime } from "rxjs/operators";
import { ARENA_HEIGHT, ARENA_WIDTH } from "../constants";
import { BarrackConfig, IGameConfig, WarriorConfig } from "./extended/game-config.interface";
import { defaultGameConfig } from "./extended/default-game-config";
import { BarrackId, WarriorId } from "./extended/ids";
import { Battle } from "./Battle";
import { MapBattle } from "./MapBattle";

export class GameController {
  static arenaWith = ARENA_WIDTH;
  static arenaHeight = ARENA_HEIGHT;
  static arenaCenterX = GameController.arenaWith / 2;
  static arenaCenterY = GameController.arenaHeight / 2;
  static arenaHtmlContainer: HTMLElement;
  static ticker$ = new Subject<number>();
  static tickerHalfOfSecond$ = GameController.ticker$.pipe(throttleTime(500));
  static currentTickDelta = 2;
  static fps = 30;
  static fpsIndex = 16.667;
  static readonly defaultPathFindingLimit: number = 20;
  static currentPathFindingCount = 0;
  static now: number = Date.now();
  static currentBattle: Battle;
  static config: IGameConfig = defaultGameConfig;

  static ticksCountWithoutLags = 15;

  static async init(ticker = new PIXI.Ticker()) {
    ticker.maxFPS = GameController.fps;
    ticker.add((delta) => {
      if (delta.deltaTime < 4) {
        this.ticksCountWithoutLags++;
      } else {
        this.ticksCountWithoutLags = 0;
      }
      Warrior.useGridPathFinding = true; //  this.currentBattle.allWarriors.value.length < 100 && this.ticksCountWithoutLags > 15;
      this.now = Date.now();
      this.currentTickDelta = delta.deltaTime;
      this.currentPathFindingCount = 0;
      this.ticker$.next(delta.deltaTime);
    });
    ticker.start();

    this.currentBattle = new MapBattle({
      map: {
        gridHeight: 10,
        gridWidth: 10,
        warriros: [
          {
            clan: 1,
            x: 50,
            y: 50,
            config: GameController.getWarriorConfigById(WarriorId.FireWorm),
          },
        ],
        name: "das",
      },
    });
    this.currentBattle.init();
  }

  static getWarriorConfigById(id: WarriorId): WarriorConfig {
    return this.config.warriors.find((w: WarriorConfig) => w.id === id)!;
  }

  static getBarrackConfigById(id: BarrackId): BarrackConfig {
    return this.config.barracks.find((b: BarrackConfig) => b.id === id)!;
  }
}
