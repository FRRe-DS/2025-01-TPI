import { motion } from 'framer-motion';
import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggle({ 
  size = 'md', 
  showLabel = false, 
  className = '' 
}: ThemeToggleProps) {
  const { theme, toggleTheme, isDark } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  // Debug: verificar el estado
  console.log('isDark:', isDark, 'isHovered:', isHovered);
  console.log('backgroundColor should be:', isDark 
    ? (isHovered ? '#ffffff' : '#111827')
    : (isHovered ? '#111827' : '#ffffff'));

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

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Botón circular con ícono */}
      <motion.button
        onClick={toggleTheme}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative ${sizeClasses[size]} rounded-full 
          border-2 transition-all duration-400 ease-out
          flex items-center justify-center
          group overflow-hidden
          ${isDark 
            ? 'bg-gray-900 border-gray-700 hover:border-gray-600' 
            : 'bg-white border-gray-200 hover:border-gray-300'
          }
        `}
        animate={{
          backgroundColor: isDark 
            ? (isHovered ? '#ffffff' : '#111827')
            : (isHovered ? '#111827' : '#ffffff'),
          borderColor: isDark 
            ? (isHovered ? '#e5e7eb' : '#374151')
            : (isHovered ? '#374151' : '#e5e7eb')
        }}
        transition={{ 
          duration: 0.4, 
          ease: [0.25, 0.46, 0.45, 0.94] 
        }}
        style={{ willChange: 'transform, background-color, border-color' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={`Cambiar a modo ${isDark ? 'día' : 'noche'}`}
      >
        {/* Ícono que se transforma - Sol/Luna */}
        <div className="relative flex items-center justify-center w-full h-full">
          {/* Sol - visible en modo día */}
          <motion.svg
            className={`${iconSizes[size]} ${isDark ? 'text-white' : 'text-gray-900'} absolute`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            style={{ willChange: 'transform, opacity' }}
            animate={{
              scale: isDark ? 0 : (isHovered ? 0 : 1),
              rotate: isDark ? 90 : (isHovered ? 45 : 0),
              opacity: isDark ? 0 : (isHovered ? 0 : 1)
            }}
            transition={{ 
              duration: 0.4, 
              ease: [0.25, 0.46, 0.45, 0.94],
              scale: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
              rotate: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
              opacity: { duration: 0.25, ease: [0.4, 0, 0.2, 1] }
            }}
          >
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </motion.svg>

          {/* Luna - visible en modo noche */}
          <motion.svg
            className={`${iconSizes[size]} ${isDark ? 'text-white' : 'text-gray-900'} absolute`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            style={{ willChange: 'transform, opacity' }}
            animate={{
              scale: isDark ? (isHovered ? 0 : 1) : 0,
              rotate: isDark ? (isHovered ? -45 : 0) : -90,
              opacity: isDark ? (isHovered ? 0 : 1) : 0
            }}
            transition={{ 
              duration: 0.4, 
              ease: [0.25, 0.46, 0.45, 0.94],
              scale: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
              rotate: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
              opacity: { duration: 0.25, ease: [0.4, 0, 0.2, 1] }
            }}
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </motion.svg>

          {/* Ícono de previsualización - Sol (cuando estamos en modo noche) */}
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
              scale: isDark && isHovered ? 1 : 0,
              rotate: isDark && isHovered ? 0 : 45,
              opacity: isDark && isHovered ? 1 : 0,
              color: isDark && isHovered ? '#ffffff' : '#000000'
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
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </motion.svg>

          {/* Ícono de previsualización - Luna (cuando estamos en modo día) */}
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
              scale: !isDark && isHovered ? 1 : 0,
              rotate: !isDark && isHovered ? 0 : -45,
              opacity: !isDark && isHovered ? 1 : 0,
              color: !isDark && isHovered ? '#000000' : '#ffffff'
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
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </motion.svg>
        </div>

        {/* Efecto de ripple */}
        <motion.div
          className={`absolute inset-0 rounded-full ${
            isDark ? 'bg-white/10' : 'bg-gray-900/10'
          }`}
          style={{ willChange: 'transform, opacity' }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 0, opacity: 0 }}
          whileTap={{ scale: 1.5, opacity: [0, 0.2, 0] }}
          transition={{ duration: 0.12, ease: [0.4, 0, 1, 1] }}
        />
      </motion.button>

      {/* Label de texto */}
      {showLabel && (
        <motion.span 
          className={`
            ${textSizes[size]} font-medium whitespace-nowrap
            transition-colors duration-150
            ${isDark ? 'text-white' : 'text-gray-900'}
          `}
          style={{ willChange: 'transform, opacity' }}
          animate={{ 
            opacity: 1,
            x: 0,
            scale: 1
          }}
          initial={{ 
            opacity: 0,
            x: -10,
            scale: 0.9
          }}
          transition={{ 
            duration: 0.15, 
            delay: 0.03,
            ease: [0.4, 0, 1, 1]
          }}
        >
          {isDark ? 'Night' : 'Day'}
        </motion.span>
      )}
    </div>
  );
}
