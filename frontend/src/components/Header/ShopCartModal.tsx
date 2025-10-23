import { useState } from "react";
import { useNavigate } from "react-router";

export default function ShopCartModal() {
  const navigate = useNavigate();
  const [showCart, setShowCart] = useState(false);
  const cartItems = 0; // TODO: Integrar con el estado del carrito

  const handleViewCart = () => {
    setShowCart(false);
    navigate('/cart');
  };

  return (
    <div className="user-menu">
      <div 
        className="user-icon" 
        onClick={() => setShowCart(!showCart)}
        title="Carrito de compras"
        style={{ position: 'relative' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 18C5.9 18 5.01 18.9 5.01 20C5.01 21.1 5.9 22 7 22C8.1 22 9 21.1 9 20C9 18.9 8.1 18 7 18ZM1 2V4H3L6.6 11.59L5.25 14.04C5.09 14.32 5 14.65 5 15C5 16.1 5.9 17 7 17H19V15H7.42C7.28 15 7.17 14.89 7.17 14.75L7.2 14.63L8.1 13H15.55C16.3 13 16.96 12.59 17.3 11.97L20.88 5.48C20.96 5.34 21 5.17 21 5C21 4.45 20.55 4 20 4H5.21L4.27 2H1ZM17 18C15.9 18 15.01 18.9 15.01 20C15.01 21.1 15.9 22 17 22C18.1 22 19 21.1 19 20C19 18.9 18.1 18 17 18Z" fill="currentColor"/>
        </svg>
        {cartItems > 0 && (
          <span style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            background: '#ff4444',
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.7rem',
            fontWeight: 'bold'
          }}>
            {cartItems}
          </span>
        )}
      </div>
      
      {showCart && (
        <>
          <div 
            onClick={() => setShowCart(false)} 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 99
            }}
          />
          <div className="dropdown-menu">
            <div style={{ padding: '1rem', textAlign: 'center', color: '#666', borderBottom: '1px solid #eee' }}>
              {cartItems === 0 ? (
                <p style={{ margin: 0 }}>Tu carrito está vacío</p>
              ) : (
                <p style={{ margin: 0 }}>Tienes {cartItems} producto(s)</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}