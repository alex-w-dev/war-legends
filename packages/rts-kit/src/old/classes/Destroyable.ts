import { componentDestroyed } from "../utils/component-destroyed";

export class Destroyable {
    _destroyed = false;
    destroyed$ = componentDestroyed(this)
    destroy() {}
}