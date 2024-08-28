import { MATH_PI } from "../constants";

export function getYBySinTrajectory(x: number, distance: number, maxY: number): number {
  return Math.sin((MATH_PI / distance) * x) * maxY;
}
