import { useState, useEffect, useRef } from "react";
import { useAuth } from "react-oidc-context";
import ProfileModal from "./ProfileModal";
import { ThemeToggle } from "../ThemeToggle";
import { getUserOrders, type OrderResponse } from "../../services/order.service";
import { getAccessToken } from "../../services/auth/getAccessToken";
import { getProductByIdFromStock, type Product } from "../../services/product.service";

export default function UserModal() {
  const auth = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [products, setProducts] = useState<Map<number, Product>>(new Map());
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Cerrar el modal del carrito cuando se abre este
  useEffect(() => {
    if (showModal) {
      window.dispatchEvent(new CustomEvent('closeCartModal'));
    }
  }, [showModal]);

  // Cerrar cuando se presiona fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        if (!target.closest('.user-icon')) {
          setShowModal(false);
        }
      }
    };

    if (showModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModal]);

  // Escuchar eventos para cerrar cuando se abre el modal del carrito
  useEffect(() => {
    const handleCloseUserModal = () => {
      setShowModal(false);
    };

    window.addEventListener('closeUserModal', handleCloseUserModal);
    return () => {
      window.removeEventListener('closeUserModal', handleCloseUserModal);
    };
  }, []);

  const handleProfileClick = () => {
    setShowModal(false);
    setShowProfileModal(true);
  };

  const handlePedidos = async () => {
    setShowModal(false);
    setShowOrdersModal(true);
    setLoadingOrders(true);
    setOrdersError(null);
    
    try {
      if (!auth.user) {
        throw new Error('Usuario no autenticado');
      }
      
      const token = getAccessToken(auth.user);
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const ordersData = await getUserOrders(token);
      setOrders(ordersData.orders || []);
      
      // Obtener detalles de productos para cada orden
      const productsMap = new Map<number, Product>();
      const productPromises: Promise<void>[] = [];
      
      ordersData.orders?.forEach(order => {
        order.products.forEach(orderProduct => {
          if (!productsMap.has(orderProduct.productId)) {
            productPromises.push(
              getProductByIdFromStock(orderProduct.productId, token)
                .then(product => {
                  if (product) {
                    productsMap.set(orderProduct.productId, product);
                  }
                })
                .catch(err => {
                  console.error(`Error al obtener producto ${orderProduct.productId}:`, err);
                })
            );
          }
        });
      });
      
      await Promise.all(productPromises);
      setProducts(productsMap);
    } catch (error: any) {
      console.error('Error al cargar órdenes:', error);
      setOrdersError(error.message || 'Error al cargar las órdenes');
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleLogout = () => {
    setShowModal(false);
    auth.removeUser();
    auth.signoutRedirect();
  };

  return (
    <div className="user-menu">
      <div 
        className="user-icon" 
        onClick={() => setShowModal(!showModal)}
        title={auth.user?.profile?.name || "Usuario"}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="currentColor"/>
          <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" fill="currentColor"/>
        </svg>
      </div>
      
      {showModal && (
        <div ref={modalRef} className="dropdown-menu" style={{ zIndex: 100 }}>
            <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #e5e7eb', marginBottom: '0.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ThemeToggle size="sm" labelSize="lg" showLabel className="user-dropdown-theme-toggle" />
              </div>
            </div>
            <button onClick={handleProfileClick}>
              Perfil
            </button>
            <button onClick={handlePedidos}>
              Mis pedidos
            </button>
            <button onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </div>
      )}

      {/* Modal de Perfil */}
      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />

      {/* Modal "Mis Pedidos" */}
      {showOrdersModal && (
        <div 
          onClick={() => setShowOrdersModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
            overflow: 'auto'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#032d70', fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>
                Mis Pedidos
              </h2>
              <button 
                onClick={() => setShowOrdersModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '0.25rem 0.5rem'
                }}
              >
                ×
              </button>
            </div>
            
            {loadingOrders ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div 
                  className="spinner"
                  style={{ 
                    border: '3px solid #f3f3f3',
                    borderTop: '3px solid #032d70',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    margin: '0 auto 1rem',
                    animation: 'spin 1s linear infinite'
                  }}
                ></div>
                <p style={{ color: '#666' }}>Cargando órdenes...</p>
              </div>
            ) : ordersError ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#dc2626' }}>
                <p>{ordersError}</p>
                <button 
                  onClick={handlePedidos}
                  style={{
                    marginTop: '1rem',
                    background: '#032d70',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '0.5rem',
                    cursor: 'pointer'
                  }}
                >
                  Reintentar
                </button>
              </div>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                <p>No tienes pedidos aún.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {orders.map((order) => {
                  const subtotal = order.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
                  const total = order.totalAmount || (subtotal + (order.shippingCost || 0));
                  
                  return (
                    <div 
                      key={order.orderId}
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        padding: '1.5rem',
                        background: '#f9fafb'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <p style={{ fontWeight: 600, color: '#032d70', margin: 0 }}>
                            Orden #{order.orderId}
                          </p>
                          <p style={{ fontSize: '0.875rem', color: '#666', margin: '0.25rem 0 0 0' }}>
                            {new Date(order.createdAt).toLocaleDateString('es-AR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontWeight: 600, color: '#032d70', margin: 0 }}>
                            ${total.toLocaleString('es-AR')}
                          </p>
                          <p style={{ fontSize: '0.875rem', color: '#666', margin: '0.25rem 0 0 0', textTransform: 'capitalize' }}>
                            {order.status}
                          </p>
                        </div>
                      </div>
                      
                      <div style={{ marginBottom: '1rem' }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                          Productos:
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {order.products.map((orderProduct) => {
                            const product = products.get(orderProduct.productId);
                            const productName = product?.nombre || `Producto #${orderProduct.productId}`;
                            
                            return (
                              <div 
                                key={orderProduct.productId}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  fontSize: '0.875rem',
                                  color: '#666'
                                }}
                              >
                                <span>
                                  {productName} x {orderProduct.quantity}
                                </span>
                                <span style={{ fontWeight: 600 }}>
                                  ${(orderProduct.price * orderProduct.quantity).toLocaleString('es-AR')}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {order.deliveryAddress && (
                        <div style={{ 
                          padding: '0.75rem',
                          background: 'white',
                          borderRadius: '0.375rem',
                          fontSize: '0.875rem',
                          color: '#666'
                        }}>
                          <p style={{ fontWeight: 600, marginBottom: '0.25rem', color: '#374151' }}>
                            Dirección de entrega:
                          </p>
                          <p style={{ margin: 0 }}>
                            {order.deliveryAddress.street}, {order.deliveryAddress.city}, {order.deliveryAddress.state}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}