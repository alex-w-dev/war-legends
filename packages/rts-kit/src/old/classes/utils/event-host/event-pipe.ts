import { map } from 'rxjs';
import { EventName } from './event-name.enum';
import { EventHost } from './event-host';

export function eventPipe(eventType: EventName, target: any) {
  return map(value => {
    EventHost.instance().dispatch(eventType, {
      value,
      target,
    });
    return value;
  });
}
