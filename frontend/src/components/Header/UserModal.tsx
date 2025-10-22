import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";

export default function UserModal() {
  const auth = useAuth()
  const [showModal,setShowModal] = useState(false)

  return <>
    <div hidden={!showModal} onClick={() => setShowModal(false)} className="absolute w-screen h-screen right-0 top-0"/>
    <div className="relative">
      <button onClick={() => setShowModal(!showModal)} className="cursor-pointer">
        <img src="/user-icon.svg" className="w-10 bg-white rounded-4xl"/>
      </button>
      <dialog 
        hidden={!showModal} 
        className="absolute -left-45 w-56 bg-white text-black flex flex-col gap-1 p-2 rounded-lg shadow-xl border border-gray-200"
      >
        <a 
          href="/profile" 
          className="text-sm px-3 py-2 rounded hover:bg-gray-100 no-underline text-black"
        >
          Perfil
        </a>
        <button 
          onClick={() => {auth.removeUser();auth.signoutRedirect()}} 
          className="cursor-pointer text-sm text-left px-3 py-2 rounded hover:bg-gray-100"
        >
          Cerrar Sesión
        </button>
      </dialog>
    </div>
  </>
}