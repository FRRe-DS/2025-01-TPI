import { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { useLocation } from "react-router-dom";

export default function Header() {
    const auth = useAuth();
    const path = useLocation().pathname
    useEffect(()=> {
        if (path !== '/login/callback') {
            localStorage.setItem('redirect_path',path)
        }
    },[path])

    if (auth.isAuthenticated) {
        console.log(auth)
        return (
        <div>
            Hello {auth.user?.profile.nickname}{" "}
            <button onClick={() => {auth.removeUser();auth.signoutRedirect()}}>Log out</button>
        </div>
        );
    }

    return <button onClick={() => {auth.signinRedirect()}}>Log in</button>;
}