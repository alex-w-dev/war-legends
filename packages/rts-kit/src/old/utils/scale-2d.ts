import { cloneDeep } from 'lodash';

function scale1D(arr: number[] | number[][], n: number) {
  for (let i = (arr.length *= n); i; ) arr[--i] = arr[(i / n) | 0];
}

export function scale2D(arr: number[][], n: number) {
  const cloned = cloneDeep(arr);

  for (let i = cloned.length; i; ) scale1D(cloned[--i], n);

  scale1D(cloned, n);

  return cloned;
}
