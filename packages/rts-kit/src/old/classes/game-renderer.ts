import { Battle } from './Battle';

export abstract class GameRenderer {
  constructor(
    public htmlContainer: HTMLElement,
    public battle: Battle,
  ) {}

  async init(): Promise<void> {}
  async start(): Promise<void> {}
  async destroy(): Promise<void> {}
}
