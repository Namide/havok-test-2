import { initHome } from "./pages/initHome";
import { Router } from "./router/Router";
import "./style.css";

const baseURL = import.meta.env.BASE_URL

const router = new Router([
  {
    title: "Havok - test",
    name: "landing",
    path: `${baseURL}`,
    regex: new RegExp(`^${baseURL.replace(/\//, "/")}$`),
  },
  {
    title: "Page not found",
    name: "404",
    path: `${baseURL}/error`,
    regex: /^\*$/,
  },
] as const);

router.on("landing", () => console.log("landing"));
router.on("404", () => console.log("404"));
console.log(router.route?.name)

initHome()
