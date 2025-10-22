import { type RouteConfig, route, index } from "@react-router/dev/routes";

export default [
  index("./routes/_index.route.tsx"),
  route("/login/callback", "./routes/loginCallback.route.tsx"),
  route("/private", "./routes/private.route.tsx"),
  route("/profile", "./routes/profile.route.tsx"),
  route("/cart", "./routes/cart.route.tsx")
] satisfies RouteConfig;
