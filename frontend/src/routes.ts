import { type RouteConfig, route, index } from "@react-router/dev/routes";

export default [
  index("./routes/_index.route.tsx"),
  route("/login/callback", "./routes/loginCallback.route.tsx"),
  route("/private", "./routes/private.route.tsx")
] satisfies RouteConfig;
