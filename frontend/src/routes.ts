import { type RouteConfig, route, index } from "@react-router/dev/routes";

export default [
  index("./routes/_index.route.tsx"),
  route("/login/callback", "./routes/loginCallback.route.tsx"),
  route("/private", "./routes/private.route.tsx"),
  route("/profile", "./routes/profile.route.tsx"),
  route("/cart", "./routes/cart.route.tsx"),
  route("/shopcart", "./routes/cart.route.tsx", { id: "shopcart" }),
  route("/shopcart/shipping", "./routes/shipping.route.tsx"),
  route("/shopcart/payment", "./routes/payment.route.tsx"),
  route("/shopcart/confirmation", "./routes/confirmation.route.tsx"),
  route("/shipping/tracking", "./routes/shipping-tracking.route.tsx"),
  route("/product/:id", "./routes/product.route.tsx"),
  // Ruta específica para Chrome DevTools (retorna null silenciosamente)
  route("/.well-known/*", "./routes/well-known.route.tsx"),
  // Ruta catch-all para manejar otras rutas no encontradas
  route("*", "./routes/404.route.tsx")
] satisfies RouteConfig;
