import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface Product {
  id: string;
  nombre: string;
  precio: number;
  descripcion?: string;
  imagen?: string;
}

interface FavoriteList {
  id: string;
  nombre: string;
  productos: string[];
}

interface FavoriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  existingLists: FavoriteList[];
  onCreateList: (nombre: string, productId: string) => Promise<void>;
  onAddToList: (listId: string, productId: string) => Promise<void>;
}

export function FavoriteModal({
  isOpen,
  onClose,
  product,
  existingLists,
  onCreateList,
  onAddToList
}: FavoriteModalProps) {
  const [newListName, setNewListName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setNewListName('');
      setIsCreating(false);
      setIsAdding(null);
      setShowSuccess(null);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    
    setIsCreating(true);
    try {
      await onCreateList(newListName.trim(), product.id);
      setShowSuccess(`Lista "${newListName.trim()}" creada`);
      setNewListName('');
    } catch (error) {
      console.error('Error creating list:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddToList = async (listId: string, listName: string) => {
    setIsAdding(listId);
    try {
      await onAddToList(listId, product.id);
      setShowSuccess(`Añadido a "${listName}"`);
    } catch (error) {
      console.error('Error adding to list:', error);
    } finally {
      setIsAdding(null);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  console.log('FavoriteModal render:', { isOpen, product: product?.nombre });
  
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed top-16 left-0 right-0 bottom-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={handleOverlayClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: 0.25, 
            ease: [0.4, 0, 0.2, 1] 
          }}
        >
      {/* Modal */}
      <motion.div
        className="relative w-full max-w-md bg-white rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        initial={{ 
          opacity: 0, 
          scale: 0.9,
          y: 20
        }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          y: 0
        }}
        exit={{ 
          opacity: 0, 
          scale: 0.9,
          y: -20
        }}
        transition={{ 
          duration: 0.4, 
          ease: [0.25, 0.46, 0.45, 0.94],
          scale: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
          y: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
        }}
      >
        {/* Header */}
        <motion.div 
          className="flex items-center justify-between p-6 border-b border-gray-100"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h2 className="text-xl font-semibold text-gray-900">
            Añadir este producto a favoritos
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Cerrar modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </motion.div>

        {/* Product Preview */}
        <motion.div 
          className="p-6 border-b border-gray-100"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              {product?.imagen ? (
                <img 
                  src={product.imagen} 
                  alt={product.nombre}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">{product?.nombre}</h3>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                ${product?.precio?.toLocaleString()}
              </p>
              {product?.descripcion && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {product.descripcion}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Existing Lists */}
        <motion.div 
          className="p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <h3 className="font-medium text-gray-900 mb-4">Listas existentes</h3>
          
          {existingLists.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No tienes listas creadas aún</p>
          ) : (
            <div className="space-y-3">
              {existingLists.map((list) => (
                <div key={list.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{list.nombre}</p>
                    <p className="text-sm text-gray-500">
                      {list.productos.length} producto{list.productos.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAddToList(list.id, list.nombre)}
                    disabled={isAdding === list.id}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isAdding === list.id ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Añadir'
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Create New List */}
        <motion.div 
          className="p-6 border-t border-gray-100"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <h3 className="font-medium text-gray-900 mb-4">Crear nueva lista</h3>
          <div className="flex space-x-3">
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="Nombre de la lista"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
            />
            <button
              onClick={handleCreateList}
              disabled={!newListName.trim() || isCreating}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isCreating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Crear y Añadir'
              )}
            </button>
          </div>
        </motion.div>

        {/* Success Message */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              className="absolute top-4 left-4 right-4 bg-green-50 border border-green-200 rounded-lg p-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <p className="text-sm font-medium text-green-800">{showSuccess}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
