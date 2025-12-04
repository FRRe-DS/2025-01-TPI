import { useState, useEffect, useRef } from "react";
import { useAuth } from "react-oidc-context";
import ProfileModal from "./ProfileModal";
import { ThemeToggle } from "../ThemeToggle";
import { getUserOrders, type OrderResponse } from "../../services/order.service";
import { getAccessToken } from "../../services/auth/getAccessToken";
import { getProductByIdFromStock, type Product } from "../../services/product.service";
import { getShippingById, translateShippingStatus, getShippingStatusColor, cancelShipping, type ShippingDetailResponse } from "../../services/shipping.service";
import { useNavigate } from "react-router";
import { notificationManager } from "../../utils/notifications";

export default function UserModal() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [products, setProducts] = useState<Map<number, Product>>(new Map());
  const [shippings, setShippings] = useState<Map<number, ShippingDetailResponse>>(new Map());
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [cancellingShippingId, setCancellingShippingId] = useState<number | null>(null);
  const [confirmCancelShippingId, setConfirmCancelShippingId] = useState<number | null>(null);
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
      
      console.log('[UserModal] Órdenes cargadas:', ordersData.orders?.length);
      console.log('[UserModal] Órdenes con shippingId:', ordersData.orders?.filter(o => o.shippingId).map(o => ({ orderId: o.orderId, shippingId: o.shippingId })));
      
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
      
      // Obtener detalles de envíos para órdenes que tengan shippingId
      const shippingMap = new Map<number, ShippingDetailResponse>();
      const shippingPromises: Promise<void>[] = [];
      
      ordersData.orders?.forEach(order => {
        if (order.shippingId && !shippingMap.has(order.shippingId)) {
          shippingPromises.push(
            getShippingById(order.shippingId, token)
              .then(shipping => {
                shippingMap.set(order.shippingId!, shipping);
              })
              .catch(err => {
                console.error(`Error al obtener envío ${order.shippingId}:`, err);
                // No fallar si no se puede obtener el envío, simplemente no lo mostramos
              })
          );
        }
      });
      
      await Promise.all(shippingPromises);
      setShippings(shippingMap);
      
      console.log('[UserModal] Envíos cargados:', shippingMap.size, 'de', ordersData.orders?.filter(o => o.shippingId).length);
    } catch (error: any) {
      console.error('Error al cargar órdenes:', error);
      setOrdersError(error.message || 'Error al cargar las órdenes');
      notificationManager.error(
        'Error al cargar pedidos',
        error.message || 'No se pudieron cargar tus pedidos. Por favor, intenta nuevamente.'
      );
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleLogout = () => {
    setShowModal(false);
    auth.removeUser();
    auth.signoutRedirect();
  };

  const handleViewTracking = (shippingId: number) => {
    setShowOrdersModal(false);
    navigate(`/shipping/tracking?id=${shippingId}`);
  };

  const handleCancelShipping = (shippingId: number) => {
    setConfirmCancelShippingId(shippingId);
  };

  const confirmCancelShipping = async () => {
    const shippingId = confirmCancelShippingId;
    if (!shippingId) return;

    if (!auth.user) {
      notificationManager.error(
        'Error de autenticación',
        'Usuario no autenticado. Por favor, inicia sesión nuevamente.'
      );
      setConfirmCancelShippingId(null);
      return;
    }

    setConfirmCancelShippingId(null);
    setCancellingShippingId(shippingId);
    try {
      const token = getAccessToken(auth.user);
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      await cancelShipping(shippingId, token);
      
      // Recargar los envíos
      const updatedShipping = await getShippingById(shippingId, token);
      setShippings(prev => {
        const newMap = new Map(prev);
        newMap.set(shippingId, updatedShipping);
        return newMap;
      });

      // Disparar evento para notificar a otras partes de la app (como la página de tracking)
      window.dispatchEvent(new CustomEvent('shippingStatusChanged', {
        detail: { shippingId, shipping: updatedShipping }
      }));

      // Mostrar notificación de éxito
      notificationManager.success(
        'Envío cancelado',
        'El envío ha sido cancelado exitosamente.'
      );
    } catch (error: any) {
      console.error('Error al cancelar envío:', error);
      notificationManager.error(
        'Error al cancelar envío',
        error.message || 'No se pudo cancelar el envío. Por favor, intenta nuevamente.'
      );
    } finally {
      setCancellingShippingId(null);
    }
  };

  const canCancelShipping = (status: string): boolean => {
    return status === 'created' || status === 'reserved';
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
              Cerrar sesión
            </button>
          </div>
      )}

      {/* Modal de Confirmación para Cancelar Envío */}
      {confirmCancelShippingId && (
        <div 
          onClick={() => setConfirmCancelShippingId(null)}
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
            zIndex: 2000,
            padding: '1rem'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
            }}
          >
            <h3 style={{ color: '#032d70', fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
              Confirmar cancelación
            </h3>
            <p style={{ color: '#374151', marginBottom: '1.5rem' }}>
              ¿Estás seguro de que deseas cancelar este envío? Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmCancelShippingId(null)}
                style={{
                  padding: '0.5rem 1.5rem',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmCancelShipping}
                style={{
                  padding: '0.5rem 1.5rem',
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
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
                Mis pedidos
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
                        padding: '1rem',
                        background: 'white'
                      }}
                    >
                      {/* Header compacto */}
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start',
                        marginBottom: '0.75rem',
                        paddingBottom: '0.75rem',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                            <p style={{ fontWeight: 600, color: '#032d70', margin: 0, fontSize: '0.9375rem' }}>
                              Orden #{order.orderId}
                            </p>
                            <span style={{
                              display: 'inline-block',
                              padding: '0.125rem 0.5rem',
                              borderRadius: '0.25rem',
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              backgroundColor: '#f3f4f6',
                              color: '#374151',
                              textTransform: 'capitalize'
                            }}>
                              {order.status}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
                            {new Date(order.createdAt).toLocaleDateString('es-AR', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontWeight: 700, color: '#032d70', margin: 0, fontSize: '1.125rem' }}>
                            ${total.toLocaleString('es-AR')}
                          </p>
                        </div>
                      </div>
                      
                      {/* Productos compactos */}
                      <div style={{ marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {order.products.map((orderProduct) => {
                            const product = products.get(orderProduct.productId);
                            const productName = product?.nombre || `Producto #${orderProduct.productId}`;
                            const mainImage = product?.imagenes && product.imagenes.length > 0
                              ? product.imagenes[0].url
                              : `https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80`;
                            
                            return (
                              <div 
                                key={orderProduct.productId}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  padding: '0.5rem',
                                  background: '#f9fafb',
                                  borderRadius: '0.375rem'
                                }}
                              >
                                <img
                                  src={mainImage}
                                  alt={productName}
                                  style={{
                                    width: '40px',
                                    height: '40px',
                                    objectFit: 'cover',
                                    borderRadius: '0.25rem',
                                    flexShrink: 0
                                  }}
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <p style={{ 
                                    fontSize: '0.8125rem', 
                                    fontWeight: 500, 
                                    color: '#374151',
                                    margin: 0,
                                    marginBottom: '0.125rem',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}>
                                    {productName}
                                  </p>
                                  <p style={{ 
                                    fontSize: '0.75rem', 
                                    color: '#6b7280',
                                    margin: 0
                                  }}>
                                    {orderProduct.quantity} × ${orderProduct.price.toLocaleString('es-AR')}
                                  </p>
                                </div>
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                  <p style={{ 
                                    fontSize: '0.8125rem', 
                                    fontWeight: 600, 
                                    color: '#032d70',
                                    margin: 0
                                  }}>
                                    ${(orderProduct.price * orderProduct.quantity).toLocaleString('es-AR')}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Información de envío y acciones */}
                      {order.shippingId ? (
                        <div style={{ 
                          padding: '0.75rem',
                          background: '#f9fafb',
                          borderRadius: '0.375rem',
                          border: '1px solid #e5e7eb'
                        }}>
                          {shippings.has(order.shippingId) ? (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                              <div>
                                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0 0 0.25rem 0' }}>
                                  Estado del envío:
                                </p>
                                <span style={{
                                  display: 'inline-block',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '0.25rem',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  color: '#1f2937',
                                  backgroundColor: getShippingStatusColor(shippings.get(order.shippingId)!.status) + '40',
                                  border: `1px solid ${getShippingStatusColor(shippings.get(order.shippingId)!.status)}`
                                }}>
                                  {translateShippingStatus(shippings.get(order.shippingId)!.status)}
                                </span>
                              </div>
                              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <button
                                  onClick={() => handleViewTracking(order.shippingId!)}
                                  style={{
                                    padding: '0.375rem 0.75rem',
                                    fontSize: '0.75rem',
                                    background: '#032d70',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.25rem',
                                    cursor: 'pointer',
                                    fontWeight: 500
                                  }}
                                >
                                  Ver Seguimiento
                                </button>
                                {canCancelShipping(shippings.get(order.shippingId)!.status) && (
                                  <button
                                    onClick={() => handleCancelShipping(order.shippingId!)}
                                    disabled={cancellingShippingId === order.shippingId}
                                    style={{
                                      padding: '0.375rem 0.75rem',
                                      fontSize: '0.75rem',
                                      background: cancellingShippingId === order.shippingId ? '#9ca3af' : '#dc2626',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '0.25rem',
                                      cursor: cancellingShippingId === order.shippingId ? 'not-allowed' : 'pointer',
                                      fontWeight: 500,
                                      opacity: cancellingShippingId === order.shippingId ? 0.6 : 1
                                    }}
                                  >
                                    {cancellingShippingId === order.shippingId ? 'Cancelando...' : 'Cancelar'}
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.75rem', color: '#6b7280', fontStyle: 'italic' }}>
                                Cargando estado del envío...
                              </span>
                              <button
                                onClick={() => handleViewTracking(order.shippingId!)}
                                style={{
                                  padding: '0.375rem 0.75rem',
                                  fontSize: '0.75rem',
                                  background: '#032d70',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '0.25rem',
                                  cursor: 'pointer',
                                  fontWeight: 500
                                }}
                              >
                                Ver Seguimiento
                              </button>
                            </div>
                          )}
                        </div>
                      ) : null}
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