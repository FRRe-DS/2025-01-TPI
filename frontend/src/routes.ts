import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
  route("/", "./routes/product.route.tsx"),
  route("/login/callback", "./routes/loginCallback.route.tsx"),
  route("/private", "./routes/private.route.tsx")
] satisfies RouteConfig;
