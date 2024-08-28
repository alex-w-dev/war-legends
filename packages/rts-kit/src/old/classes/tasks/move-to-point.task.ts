import { Warrior } from "../army/warriors/warrior";
import { GameController } from "../GameController";
import { Destroyable } from "../Destroyable";
import { takeUntil } from "rxjs";
import { WARRIOR_MOVE_GRID_OFFSET, WarriorState } from "../../constants";

const UPDATE_PATH_DELTA = 10;

export class MoveToPointTask extends Destroyable {
  thenCallBack?: Function;
  lastUpdatePathDelta: number = 0;
  pathsToPoint: ReturnType<Warrior["getPathToPoint"]>;

  constructor(
    public warrior: Warrior,
    public x: number,
    public y: number,
  ) {
    super();

    this.pathsToPoint = warrior.getPathToPoint(x, y);
    GameController.ticker$.pipe(takeUntil(this.destroyed$)).subscribe(this.update);
  }

  destroy() {
    this.warrior.setState(WarriorState.IDLE);
    super.destroy();
  }

  update = (delta: number) => {
    // console.log(this.lastUpdatePathDelta);
    // if ((this.lastUpdatePathDelta += delta) > UPDATE_PATH_DELTA) {
    //   this.lastUpdatePathDelta = 0;
    //   this.pathsToPoint = this.warrior.getPathToPoint(this.x, this.y);
    //   console.log("this.pathsToPoint", this.pathsToPoint);
    //   if (!this.pathsToPoint.length) {
    //     this.destroy();
    //     return;
    //   } else {
    //     this.warrior.setState(WarriorState.MOVEMENT);
    //     this.warrior.lookTo(this.pathsToPoint[0].x, this.pathsToPoint[0].y);
    //   }
    // }

    if (!this.warrior.canDoTasks()) {
      return this.destroy();
    }

    // let thisTaskTargetPosition = this.pathsToPoint[0];

    // if (
    //   Math.abs(this.warrior.x.value - thisTaskTargetPosition.x) < WARRIOR_MOVE_GRID_OFFSET &&
    //   Math.abs(this.warrior.y.value - thisTaskTargetPosition.y) < WARRIOR_MOVE_GRID_OFFSET
    // ) {
    //   this.pathsToPoint.shift();
    //   if (!this.pathsToPoint.length) {
    //     this.destroy();
    //   } else {
    //     thisTaskTargetPosition = this.pathsToPoint[0];
    //     this.warrior.stepTo(thisTaskTargetPosition.x, thisTaskTargetPosition.y, delta);
    //   }
    // } else {
    //   this.warrior.stepTo(thisTaskTargetPosition.x, thisTaskTargetPosition.y, delta);
    // }

    if (
      Math.abs(this.warrior.x.value - this.x) < WARRIOR_MOVE_GRID_OFFSET &&
      Math.abs(this.warrior.y.value - this.y) < WARRIOR_MOVE_GRID_OFFSET
    ) {
      this.destroy();
    } else {
      this.warrior.setState(WarriorState.MOVEMENT);
      this.warrior.stepTo(this.x, this.y, delta);
    }
  };

  then(thenCallBack: Function) {
    this.thenCallBack = thenCallBack;
    return this;
  }
}
