import { type RouteConfig, route, index } from "@react-router/dev/routes";

export default [
  index("./routes/_index.route.tsx"),
  route("/login/callback", "./routes/loginCallback.route.tsx"),
  route("/private", "./routes/private.route.tsx"),
  route("/profile", "./routes/profile.route.tsx"),
  route("/shopcart", "./routes/cart.route.tsx"),
  route("/product/:id", "./routes/product.route.tsx")
] satisfies RouteConfig;
