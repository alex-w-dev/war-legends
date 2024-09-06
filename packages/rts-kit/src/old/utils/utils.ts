import { GameObject } from '../classes/GameObject';
import { GRID_DIMENSION_HALF_SIZE, GRID_DIMENSION_SIZE } from '../constants';
import { IWarriorWavePositionMatrix } from '../interfaces';

export function getAngleBetweenDots(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const diffX = x1 - x2 || 1;
  const diffY = y1 - y2;
  let angle = (Math.atan(diffY / diffX) * 180) / Math.PI;

  if (diffY >= 0 && diffX >= 0) {
    angle += 180;
  } else if (diffY <= 0 && diffX >= 0) {
    angle -= 180;
  }

  return angle;
}

export function getSizeBetweenDots(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

export function isGameObjectsCollided(
  gameObject1: GameObject,
  gameObject2: GameObject,
): boolean {
  const radius1 = gameObject1.radius || 0;
  const radius2 = gameObject2.radius || 0;

  if (!radius1) {
    console.error('Unknown radius1 ');
  }
  if (!radius2) {
    console.error('Unknown radius2 ');
  }

  return (
    radius1 + radius2 >
    getSizeBetweenDots(
      gameObject1.x.value,
      gameObject1.y.value,
      gameObject2.x.value,
      gameObject2.y.value,
    )
  );
}

export function fromRealToGrid(xOrY: number): number {
  const highestValueOffset = xOrY > 0 ? 0.00001 : 0;

  const grid = Math.abs(
    Math.round(
      (xOrY /*- GRID_DIMENSION_HALF_SIZE*/ - highestValueOffset) /
        GRID_DIMENSION_SIZE,
    ),
  );

  return grid || 0;
}

export function fromGridToReal(gridXOrY: number): number {
  return gridXOrY * GRID_DIMENSION_SIZE /*+ GRID_DIMENSION_HALF_SIZE*/;
}

export function getWarriorWaveMatrixByGridPosition(
  gridX: number,
  gridY: number,
): IWarriorWavePositionMatrix {
  const matrix = [];

  for (let yOffset = -1; yOffset < 2; yOffset++) {
    for (let xOffset = -1; xOffset < 2; xOffset++) {
      matrix.push([
        fromGridToReal(gridX + xOffset),
        fromGridToReal(gridY + yOffset),
      ]);
    }
  }

  return matrix as IWarriorWavePositionMatrix;
}
