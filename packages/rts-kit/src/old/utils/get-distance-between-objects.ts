import { GameObject } from '../classes/GameObject';
import { getDistanceBetweenDots } from './get-distance-between-dots';

export function getDistanceBetweenObjects(
  gameObject1: GameObject,
  gameObject2: GameObject,
): number {
  return getDistanceBetweenDots(
    gameObject1.x.value,
    gameObject1.y.value,
    gameObject2.x.value,
    gameObject2.y.value,
  );
}
