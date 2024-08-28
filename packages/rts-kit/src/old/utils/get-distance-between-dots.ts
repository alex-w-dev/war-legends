export function getDistanceBetweenDots(x1: number, y1: number, x2: number, y2: number): number {
  const diffX = x1 - x2;
  const diffY = y1 - y2;

  return Math.sqrt(diffX * diffX + diffY * diffY);
}
