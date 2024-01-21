export type GlobalEvent = {
  name: string | object | undefined;
  // biome-ignore lint/suspicious/noExplicitAny: parameter can be anything
  callback: (data: any) => void;
};

export class EventEmitter<EventDef extends GlobalEvent> {
  private subscribers: EventDef[] = [];

  on(name: EventDef["name"], callback: EventDef["callback"]) {
    this.subscribers.push({
      name,
      callback,
    } as EventDef);
  }

  off(name?: EventDef["name"], callback?: EventDef["callback"]) {
    this.subscribers = this.subscribers.filter(
      (item) =>
        (name ? item.name !== name : false) ||
        (callback ? item.callback !== callback : false),
    );
  }

  emit<EvendDef extends EventDef>(
    name: EvendDef["name"],
    data?: Parameters<EvendDef["callback"]>[0],
  ) {
    for (const item of this.subscribers.filter((item) => item.name === name)) {
      item.callback.call(null, data as Parameters<EvendDef["callback"]>[0]);
    }
  }

  dispose() {
    this.subscribers = [];
  }
}
