import { Grid } from 'pathfinding';
import { Warrior } from './army/warriors/warrior';
import { GRID_DIMENSION_SIZE } from '../constants';

export class BattleGround {
  warriorGridWidth: number;
  warriorGridHeight: number;
  warriorGridMaxX: number;
  warriorGridMaxY: number;
  warriorGrid: Grid;

  warriors: Warrior[] = [];

  centerX: number;
  centerY: number;
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;

    this.warriorGridWidth = width / GRID_DIMENSION_SIZE;
    this.warriorGridHeight = height / GRID_DIMENSION_SIZE;
    this.warriorGridMaxX = this.warriorGridWidth - 1;
    this.warriorGridMaxY = this.warriorGridHeight - 1;
    this.warriorGrid = new Grid(this.warriorGridWidth, this.warriorGridHeight);

    this.centerX = Math.round(width / 2);
    this.centerY = Math.round(height / 2);
  }
}
