import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";

export default function UserModal() {
  const auth = useAuth()
  const [showModal,setShowModal] = useState(false)

  return <>
    <div hidden={!showModal} onClick={() => setShowModal(false)} className="absolute w-screen h-screen right-0 top-0"/>
    <div className="relative">
      <button onClick={() => setShowModal(!showModal)} className="cursor-pointer">
        <svg 
          className="w-7 h-7 text-gray-500 group-hover:text-gray-900 transition-colors" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round"/>
          <circle cx="12" cy="7" r="4" strokeLinecap="round"/>
        </svg>
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