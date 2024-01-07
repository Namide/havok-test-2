export type GlobalEvent = {
  name: string | object | undefined;
  // biome-ignore lint/suspicious/noExplicitAny: parameter can be anything
  callback: (data: any) => void;
};

export class EventEmitter<EventDef extends GlobalEvent> {

  list: EventDef[] = []

  on(
    name: EventDef["name"],
    callback: EventDef["callback"],
  ) {
    this.list.push({
      name,
      callback,
    } as EventDef);
  };

  off(
    name?: EventDef["name"],
    callback?: EventDef["callback"],
  ) {
    this.list = this.list.filter(
      (item) =>
        (name ? item.name !== name : false) ||
        (callback ? item.callback !== callback : false),
    );
  };

  dispatch<EvendDef extends EventDef>(
    name: EvendDef["name"],
    data?: Parameters<EvendDef["callback"]>[0],
  ) {
    for (const item of this.list.filter((item) => item.name === name)) {
      item.callback.call(null, data as Parameters<EvendDef["callback"]>[0]);
    }
  }

  dispose() {
    this.list = [];
  }
}
