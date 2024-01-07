import { EventEmitter } from "../events/EventEmitter";

export type RouteDescription = {
  title: string,
  name: string,
  path: string,
  regex: RegExp,
}

/**
 * Event emitter
 */
export class Router<RouteDef extends RouteDescription> {

  routes: RouteDef[]

  signal = new EventEmitter<{
    name: RouteDef["name"];
    callback: () => void;
  }>()

  constructor(routes: RouteDef[]) {
    this.routes = routes
    this.onPathChange = this.onPathChange.bind(this)
    this.init()
  }

  private init() {
    window.addEventListener("popstate", this.onPathChange)
  }

  onPathChange() {
    this.changePage({
      path: document.location.pathname,
      changePath: false,
    });
  }

  changePage({
    path,
    changePath = true,
    // oldPath = document.location.pathname || '/'
  }: { path: string; changePath?: boolean; oldPath?: string }) {

    const route = this.pathToRoute(path);

    if (changePath) {
      history.pushState({}, route.title, route.path);
      this.signal.dispatch(route.name);
    }

    document.title = route.title;
  };

  pathToRoute(path: string) {
    return (
      this.routes.find((route) => route.regex.test(path)) ||
      (this.routes.find((route) => route.name === "404") as (typeof this.routes)[number])
    );
  }

  dispose() {
    window.removeEventListener("popstate", this.onPathChange)
  }
}
