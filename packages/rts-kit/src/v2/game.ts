// generates tick for game
export class Ticker {
  readonly tiemout = 50;
  currentTime = 0;
  subscribers: Function[] = [];
  tickerInterval?: unknown | number;

  constructor() {}

  stop() {
    if (this.tickerInterval) {
      clearInterval(this.tickerInterval as number);
    }
  }

  start() {
    if (this.tickerInterval) {
      return;
    }

    this.tickerInterval = setInterval(() => {
      this.currentTime += this.tiemout;
      this.tick();
    }, this.tiemout);
  }

  tick() {
    console.log('tick');
    this.subscribers.forEach(cb => cb());
  }

  onTick(cb: Function) {
    this.subscribers.push(cb);
  }
}

class Game {
  ticker: Ticker = new Ticker();

  init(): this {
    return this;
  }

  start(): this {
    this.ticker.start();

    return this;
  }
}

new Game().init().start();
