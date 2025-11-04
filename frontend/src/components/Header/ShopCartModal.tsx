import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useCart } from "../../contexts/CartContext";

export default function ShopCartModal() {
  const navigate = useNavigate();
  const [showCart, setShowCart] = useState(false);
  const { items, updateQuantity, removeItem, getTotalItems, getTotalPrice } = useCart();
  const totalItems = getTotalItems(); // Cantidad total de items (suma de todas las cantidades)
  const modalRef = useRef<HTMLDivElement>(null);

  // Cerrar otros modales cuando se abre este
  useEffect(() => {
    if (showCart) {
      // Disparar evento para cerrar el modal de usuario
      window.dispatchEvent(new CustomEvent('closeUserModal'));
    }
  }, [showCart]);

  // Cerrar cuando se presiona fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        // Verificar que no se hizo clic en el icono del carrito
        const target = event.target as HTMLElement;
        if (!target.closest('.user-icon')) {
          setShowCart(false);
        }
      }
    };

    if (showCart) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCart]);

  // Escuchar eventos para cerrar cuando se abre el modal de usuario
  useEffect(() => {
    const handleCloseCartModal = () => {
      setShowCart(false);
    };

    window.addEventListener('closeCartModal', handleCloseCartModal);
    return () => {
      window.removeEventListener('closeCartModal', handleCloseCartModal);
    };
  }, []);

  const handleViewCart = () => {
    setShowCart(false);
    navigate('/shopcart');
  };

  const handleIncreaseQuantity = (itemId: string, currentQuantity: number) => {
    updateQuantity(itemId, currentQuantity + 1);
  };

  const handleDecreaseQuantity = (itemId: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateQuantity(itemId, currentQuantity - 1);
    } else {
      removeItem(itemId);
    }
  };

  return (
    <div className="user-menu">
      <div 
        className="user-icon" 
        onClick={() => setShowCart(!showCart)}
        title="Carrito de compras"
        style={{ position: 'relative', cursor: 'pointer' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 18C5.9 18 5.01 18.9 5.01 20C5.01 21.1 5.9 22 7 22C8.1 22 9 21.1 9 20C9 18.9 8.1 18 7 18ZM1 2V4H3L6.6 11.59L5.25 14.04C5.09 14.32 5 14.65 5 15C5 16.1 5.9 17 7 17H19V15H7.42C7.28 15 7.17 14.89 7.17 14.75L7.2 14.63L8.1 13H15.55C16.3 13 16.96 12.59 17.3 11.97L20.88 5.48C20.96 5.34 21 5.17 21 5C21 4.45 20.55 4 20 4H5.21L4.27 2H1ZM17 18C15.9 18 15.01 18.9 15.01 20C15.01 21.1 15.9 22 17 22C18.1 22 19 21.1 19 20C19 18.9 18.1 18 17 18Z" fill="currentColor"/>
        </svg>
        {totalItems > 0 && (
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
            {totalItems}
          </span>
        )}
      </div>
      
      {showCart && (
        <div 
          ref={modalRef}
          className="dropdown-menu cart-dropdown" 
          style={{ 
            zIndex: 100, 
            maxHeight: '600px', 
            overflowY: 'auto',
            width: '420px',
            minWidth: '420px',
            animation: 'slideDownFade 0.3s ease-out'
          }}
        >
            <div style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
              <div>
                <h3 style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem' }}>Carrito de Compras</h3>
              </div>
              {totalItems === 0 ? (
                <p style={{ margin: 0, color: '#666', textAlign: 'center', padding: '1rem 0' }}>
                  Tu carrito está vacío
                </p>
              ) : (
                <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                  {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'} en total
                </p>
              )}
            </div>
            
            {items.length > 0 && (
              <div style={{ padding: '0.5rem' }}>
                {items.map((item) => {
                  const mainImage = item.product.imagenes && item.product.imagenes.length > 0
                    ? item.product.imagenes[0].url
                    : 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
                  
                  return (
                    <div
                      key={item.id}
                      style={{
                        padding: '1rem',
                        borderBottom: '1px solid #eee',
                        display: 'flex',
                        gap: '1rem'
                      }}
                    >
                      <img
                        src={mainImage}
                        alt={item.product.nombre}
                        style={{
                          width: '60px',
                          height: '60px',
                          objectFit: 'cover',
                          borderRadius: '4px'
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', fontWeight: 'bold' }}>
                          {item.product.nombre}
                        </h4>
                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#666' }}>
                          ${item.price.toLocaleString('es-AR')}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDecreaseQuantity(item.id, item.quantity);
                            }}
                            style={{
                              width: '28px',
                              height: '28px',
                              background: '#f0f0f0',
                              border: '1px solid #ddd',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1rem',
                              fontWeight: 'bold',
                              transition: 'all 0.2s ease',
                              color: '#333'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#e0e0e0';
                              e.currentTarget.style.borderColor = '#bbb';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#f0f0f0';
                              e.currentTarget.style.borderColor = '#ddd';
                            }}
                          >
                            -
                          </button>
                          <span style={{ minWidth: '35px', textAlign: 'center', fontSize: '0.95rem', fontWeight: '600' }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleIncreaseQuantity(item.id, item.quantity);
                            }}
                            style={{
                              width: '28px',
                              height: '28px',
                              background: '#f0f0f0',
                              border: '1px solid #ddd',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1rem',
                              fontWeight: 'bold',
                              transition: 'all 0.2s ease',
                              color: '#333'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#e0e0e0';
                              e.currentTarget.style.borderColor = '#bbb';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#f0f0f0';
                              e.currentTarget.style.borderColor = '#ddd';
                            }}
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeItem(item.id);
                          }}
                          className="remove-item-btn"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#ef4444',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            padding: '0.4rem 0.6rem',
                            borderRadius: '6px',
                            marginTop: '0.5rem',
                            transition: 'all 0.2s ease',
                            fontWeight: '500'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  );
                })}
                
                <div style={{ padding: '1rem', borderTop: '2px solid #eee', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ fontWeight: 'bold' }}>Total:</span>
                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                      ${getTotalPrice().toLocaleString('es-AR')}
                    </span>
                  </div>
                  <button
                    onClick={handleViewCart}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '0.9rem'
                    }}
                  >
                    Ver Carrito
                  </button>
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
}