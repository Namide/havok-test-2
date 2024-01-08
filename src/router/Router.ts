import { EventEmitter } from "../events/EventEmitter";

export type RouteDescription = {
  title: string,
  name: string,
  path: string,
  regex: RegExp,
}

export type RouteEmitter<RouteDef extends RouteDescription> =
  {
    name: RouteDef["name"];
    callback: () => void;
  } |
  {
    name: 'change',
    callback: (name: RouteDef["name"]) => void
  }


export class Router<RouteDef extends RouteDescription> extends EventEmitter<RouteEmitter<RouteDef>> {

  routes: RouteDef[]
  route?: RouteDef

  constructor(routes: RouteDef[]) {
    super()

    this.routes = routes
    this.onPathChange = this.onPathChange.bind(this)
    this.init()
  }

  private init() {
    window.addEventListener("popstate", this.onPathChange)
    this.changePage({
      path: document.location.pathname,
    });
  }

  onPathChange() {
    this.changePage({
      path: document.location.pathname,
      updatePath: false,
    });
  }

  changePage({
    path,
    updatePath = true
  }: { path: string; updatePath?: boolean; oldPath?: string }) {

    this.route = this.pathToRoute(path);

    if (updatePath) {
      history.pushState({}, this.route.title, this.route.path);
    }

    document.title = this.route.title;

    this.emit(this.route.name);
    this.emit('change', this.route.name)
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
