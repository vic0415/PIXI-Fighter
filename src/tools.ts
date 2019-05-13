export class UpdateListener {

  private observers: IUpdateObserver[] = [];

  constructor() {
    this.observers.length = 0;
  }

  public subscribe(observer: IUpdateObserver) {
    this.observers.push(observer);
  }

  public unsubscribe(unsubscribe: IUpdateObserver) {
    this.observers = this.observers.filter((observer) => {
      if (observer === unsubscribe) {
        return false;
      } else {
        return true;
      }
    });
  }

  public broadcast(delta: number) {
    this.observers.forEach((observer) => observer.update(delta));
  }

  public clear() {
    this.observers.length = 0;
  }
}

export interface IUpdateObserver {
  update(delta: number): void;
}
