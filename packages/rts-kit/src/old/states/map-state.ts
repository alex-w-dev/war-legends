import { computed, makeObservable, observable } from "mobx";
import { GameObject } from "../classes/GameObject";

export enum MapStateType {
  WARRIOR,
}

export type MapStateItem = {
  type: MapStateType;
  object: unknown;
};

export class MapState {
  @observable data: MapStateItem[] = [];

  @computed get warriors(): GameObject[] {
    return [];
  }

  constructor() {
    makeObservable(this);
  }

  setData(data: MapStateItem) {
    this.data.push(data);
  }
}
