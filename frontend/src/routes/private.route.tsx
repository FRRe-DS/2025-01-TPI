import { withAuthenticationRequired } from "react-oidc-context";

const PrivateRoute = () => (<h1>Private</h1>);

export default withAuthenticationRequired(PrivateRoute, {
  OnRedirecting: () => (<div>Redirecting to the login page...</div>)
});