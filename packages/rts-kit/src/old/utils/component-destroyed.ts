import { ReplaySubject } from "rxjs";

type Component = { destroy(...args: any[]): void; _destroyed: boolean };

export function componentDestroyed(component: Component) {
  const oldDestroy = component.destroy;
  const destroyed$ = new ReplaySubject<void>(1);
  component.destroy = () => {
    oldDestroy.apply(component);
    component._destroyed = true;
    destroyed$.next(undefined);
    destroyed$.complete();
  };
  return destroyed$;
}
