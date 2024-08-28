type Listener = (data: any) => void;

export class EventHost {
  listeners: Record<string, Listener[]> = {};

  static instance() {
    return new EventHost();
  }

  public dispatch(eventName: string, data: any) {
    this.listeners[eventName].forEach((listener) => {
      listener(data);
    });
  }

  public addEventListener(eventName: string, listener: Listener) {
    return this.on(eventName, listener);
  }

  public on(eventName: string, listener: Listener) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }

    this.listeners[eventName].push(listener);
  }

  public removeEventListener(eventName: string, listener: Listener) {
    return this.off(eventName, listener);
  }

  public off(eventName: string, listener: Listener) {
    this.listeners[eventName] = this.listeners[eventName].filter((l) => l !== listener);
  }

  public once(eventName: string, listener: Listener) {
    const onceListener = (data: any) => {
      listener(data);
      this.off(eventName, onceListener);
    };

    this.on(eventName, onceListener);
  }

  public offAll() {
    this.listeners = {};
  }
}
