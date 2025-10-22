import { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { useLocation } from "react-router";
import UserModal from "./UserModal";
import ShopCartModal from "./ShopCartModal";

export default function Header() {
    const auth = useAuth();
    const path = useLocation().pathname
    useEffect(()=> {
        if (path !== '/login/callback') {
            localStorage.setItem('redirect_path',path)
        }
    },[path])

    return <header className="flex justify-between items-center p-2 pl-4 pr-4 border-b-2">
        <div><a href="/" className="flex gap-1 justify-between items-center">
        <img className="size-20" src="/Shipper-logo.png" alt="Shipper logo" />
            <span>Shipper</span>
        </a></div>
        <div className="flex items-center gap-4">
            {
                !auth.isAuthenticated
                ? <button 
                    className="bg-white cursor-pointer p-2 text-black rounded" 
                    onClick={() => {auth.signinRedirect()}}
                >
                    Iniciar Sesión
                </button>
                : <>
                    <ShopCartModal/>
                    <UserModal/>
                </>
            }
        </div>
    </header>
}