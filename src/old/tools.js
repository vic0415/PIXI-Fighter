class EventObserver {
  constructor() {
    this.observers = [];
  }

  subscribe(fn, thisObj) {
    let scope = thisObj || window;
    this.observers.push({ "scope": scope, "fn": fn });
  }

  unsubscribe(fn, thisObj) {
    this.observers = this.observers.filter((subscriber) => {
      if (subscriber.scope === thisObj && subscriber.fn === fn) {
        return false;
      } else {
        return true;
      }
    });
  }

  broadcast(data) {
    this.observers.forEach((subscriber) => subscriber.fn.call(subscriber.scope, data));
  }

  clear() {
    this.observers.length = 0;
  }

}

