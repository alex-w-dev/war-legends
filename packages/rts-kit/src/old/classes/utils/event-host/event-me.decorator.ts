import { EventName } from './event-name.enum';
import { Battle } from '../../Battle';

export function EventMe(eventType: EventName) {
  return function (target: { battle: Battle }, propertyKey: string) {
    let value: string;
    const getter = function () {
      return value;
    };
    const setter = function (newVal: string) {
      if (newVal === value) {
        return;
      }

      const oldValue = value;

      value = newVal;

      target.battle.eventHost.dispatch(eventType, {
        value: newVal,
        target,
        oldValue,
      });
    };
    Object.defineProperty(target, propertyKey, {
      get: getter,
      set: setter,
    });
  };
}
