import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FavoriteModal } from './FavoriteModal';

interface FavoriteIconProps {
  productId: string;
  isFavorite: boolean;
  onToggle: (productId: string) => Promise<boolean>;
  isLoading?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  product?: {
    id: string;
    nombre: string;
    precio: number;
    descripcion?: string;
    imagen?: string;
  };
  existingLists?: Array<{
    id: string;
    nombre: string;
    productos: string[];
  }>;
  onCreateList?: (nombre: string, productId: string) => Promise<void>;
  onAddToList?: (listId: string, productId: string) => Promise<void>;
}

const FavoriteIcon: React.FC<FavoriteIconProps> = ({
  productId,
  isFavorite,
  onToggle,
  isLoading = false,
  disabled = false,
  size = 'md',
  className = '',
  product,
  existingLists = [],
  onCreateList,
  onAddToList
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [localIsFavorite, setLocalIsFavorite] = useState(isFavorite);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Previene que se propague al elemento padre
    if (disabled || isLoading) return;
    
    // Cambio visual local
    const newFavoriteState = !localIsFavorite;
    setLocalIsFavorite(newFavoriteState);
    
    // Si se marca como favorito Y tenemos las props del modal, abrir el modal
    if (newFavoriteState && product && onCreateList && onAddToList) {
      setIsModalOpen(true);
    }
    
    // Funcionalidad deshabilitada temporalmente
    // const success = await onToggle(productId);
    // if (success) {
    //   // Micro-animación de éxito
    // }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation(); // También previene propagación en teclado
      handleClick(e as any); // Cast temporal para compatibilidad
    }
  };

  return (
    <div className="relative">
      <motion.button
        className={`
          ${sizeClasses[size]}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isLoading ? 'cursor-wait' : ''}
          flex items-center justify-center
          rounded-full
          transition-all duration-200
          ${isHovered && !disabled ? 'shadow-lg' : 'shadow-sm'}
          ${className}
        `}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => {
          if (!disabled) {
            setIsHovered(true);
          }
        }}
        onMouseLeave={() => {
          setIsHovered(false);
        }}
        disabled={disabled || isLoading}
        aria-pressed={localIsFavorite}
        aria-label={localIsFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        tabIndex={disabled ? -1 : 0}
        whileTap={!disabled && !isLoading ? { scale: 0.95 } : {}}
        animate={localIsFavorite ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.16, ease: 'easeOut' }}
      >
        {/* Fondo del botón */}
        <div 
          className={`
            absolute inset-0 rounded-full transition-all duration-200
            ${isHovered && !disabled 
              ? 'bg-white' 
              : 'bg-white'
            }
            ${localIsFavorite 
              ? 'bg-white' 
              : ''
            }
            ${localIsFavorite && isHovered 
              ? 'bg-white' 
              : ''
            }
          `}
          style={{
            backgroundColor: isHovered && !disabled 
              ? (localIsFavorite ? '#032b70' : '#ffffff')
              : (localIsFavorite ? '#032b70' : '#ffffff')
          }}
        />
        
        {/* Íconos del corazón que se transforman */}
        <div className="relative flex items-center justify-center w-full h-full">
          {/* Corazón outline - visible cuando NO es favorito */}
          <motion.svg
            className={`${iconSizes[size]} absolute`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            style={{ 
              willChange: 'transform, opacity, color',
              color: localIsFavorite ? '#ffffff' : '#032b70'
            }}
            animate={{
              scale: localIsFavorite ? 0 : (isHovered ? 0 : 1),
              rotate: localIsFavorite ? 90 : (isHovered ? 45 : 0),
              opacity: localIsFavorite ? 0 : (isHovered ? 0 : 1),
              color: localIsFavorite ? '#ffffff' : '#032b70'
            }}
            transition={{ 
              duration: 0.4, 
              ease: [0.25, 0.46, 0.45, 0.94],
              scale: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
              rotate: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
              opacity: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
              color: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
            }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </motion.svg>

          {/* Corazón relleno - visible cuando SÍ es favorito */}
          <motion.svg
            className={`${iconSizes[size]} absolute`}
            fill="currentColor"
            viewBox="0 0 24 24"
            style={{ 
              willChange: 'transform, opacity, color',
              color: localIsFavorite ? '#ef4444' : '#ffffff'
            }}
            animate={{
              scale: localIsFavorite ? (isHovered ? 0 : 1) : 0,
              rotate: localIsFavorite ? (isHovered ? -45 : 0) : -90,
              opacity: localIsFavorite ? (isHovered ? 0 : 1) : 0,
              color: localIsFavorite ? '#ef4444' : '#ffffff'
            }}
            transition={{ 
              duration: 0.4, 
              ease: [0.25, 0.46, 0.45, 0.94],
              scale: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
              rotate: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
              opacity: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
              color: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
            }}
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </motion.svg>

          {/* Ícono de previsualización - Outline (cuando estamos en modo favorito) */}
          <motion.svg
            className={`${iconSizes[size]} absolute`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            style={{ 
              willChange: 'transform, opacity, color'
            }}
            animate={{
              scale: localIsFavorite && isHovered ? 1 : 0,
              rotate: localIsFavorite && isHovered ? 0 : 45,
              opacity: localIsFavorite && isHovered ? 1 : 0,
              color: localIsFavorite && isHovered ? '#032b70' : '#ffffff'
            }}
            transition={{ 
              duration: 0.4, 
              ease: [0.25, 0.46, 0.45, 0.94],
              scale: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
              rotate: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
              opacity: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
              color: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
            }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </motion.svg>

          {/* Ícono de previsualización - Relleno (cuando estamos en modo NO favorito) */}
          <motion.svg
            className={`${iconSizes[size]} absolute`}
            fill="currentColor"
            viewBox="0 0 24 24"
            style={{ 
              willChange: 'transform, opacity, color'
            }}
            animate={{
              scale: !localIsFavorite && isHovered ? 1 : 0,
              rotate: !localIsFavorite && isHovered ? 0 : -45,
              opacity: !localIsFavorite && isHovered ? 1 : 0,
              color: !localIsFavorite && isHovered ? '#ef4444' : '#ffffff'
            }}
            transition={{ 
              duration: 0.4, 
              ease: [0.25, 0.46, 0.45, 0.94],
              scale: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
              rotate: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
              opacity: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
              color: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
            }}
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </motion.svg>
        </div>

        {/* Indicador de carga */}
        {isLoading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-rose-500 dark:border-t-rose-400 rounded-full animate-spin" />
          </motion.div>
        )}
      </motion.button>

      {/* Modal de favoritos */}
      {product && onCreateList && onAddToList && (
        <FavoriteModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={product}
          existingLists={existingLists}
          onCreateList={onCreateList}
          onAddToList={onAddToList}
        />
      )}
    </div>
  );
};

export default FavoriteIcon;
