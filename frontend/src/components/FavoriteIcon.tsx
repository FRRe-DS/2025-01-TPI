import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface FavoriteIconProps {
  productId: string;
  isFavorite: boolean;
  onToggle: (productId: string) => Promise<boolean>;
  isLoading?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const FavoriteIcon: React.FC<FavoriteIconProps> = ({
  productId,
  isFavorite,
  onToggle,
  isLoading = false,
  disabled = false,
  size = 'md',
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

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

  const handleClick = async () => {
    if (disabled || isLoading) return;
    
    const success = await onToggle(productId);
    if (success) {
      // Micro-animación de éxito
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
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
            setShowTooltip(true);
          }
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          setShowTooltip(false);
        }}
        onFocus={() => {
          if (!disabled) setShowTooltip(true);
        }}
        onBlur={() => setShowTooltip(false)}
        disabled={disabled || isLoading}
        aria-pressed={isFavorite}
        aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        tabIndex={disabled ? -1 : 0}
        whileTap={!disabled && !isLoading ? { scale: 0.95 } : {}}
        animate={isFavorite ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.16, ease: 'easeOut' }}
      >
        {/* Fondo del botón */}
        <div className={`
          absolute inset-0 rounded-full transition-all duration-200
          ${isHovered && !disabled 
            ? 'bg-white/90 dark:bg-blue-800/90' 
            : 'bg-white/80 dark:bg-blue-800/80'
          }
          ${isFavorite 
            ? 'bg-red-50 dark:bg-red-900/20' 
            : ''
          }
        `} />
        
        {/* Ícono del corazón */}
        <motion.div
          className={`
            relative z-10 transition-all duration-200
            ${isFavorite ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}
            ${isHovered && !disabled ? 'text-gray-600 dark:text-gray-300' : ''}
            ${isFavorite && isHovered ? 'text-red-600' : ''}
          `}
          animate={isFavorite ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {isFavorite ? (
            // Corazón relleno
            <svg 
              className={iconSizes[size]} 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          ) : (
            // Corazón outline
            <svg 
              className={iconSizes[size]} 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
        </motion.div>

        {/* Indicador de carga */}
        {isLoading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          </motion.div>
        )}
      </motion.button>

      {/* Tooltip */}
      {showTooltip && !disabled && (
        <motion.div
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.2 }}
        >
          {isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800" />
        </motion.div>
      )}
    </div>
  );
};

export default FavoriteIcon;
