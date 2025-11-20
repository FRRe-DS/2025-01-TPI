import { useState, useRef } from 'react';

interface FilterViewButtonProps {
  onFilterClick: () => void;
  onViewChange: (density: 'comfortable' | 'compact') => void;
  currentView: 'comfortable' | 'compact';
  isVisible: boolean;
}

export function FilterViewButton({
  onFilterClick,
  onViewChange,
  currentView,
  isVisible
}: FilterViewButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <style>
        {`
          @keyframes ripple {
            0% {
              transform: scale(0);
              opacity: 0.6;
            }
            50% {
              opacity: 0.3;
            }
            to {
              transform: scale(2.5);
              opacity: 0;
            }
          }

          @keyframes iconBounce {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.15);
            }
          }

          @keyframes smoothPress {
            0% { transform: scale(1); }
            50% { transform: scale(0.95); }
            100% { transform: scale(1); }
          }

          /* Container principal */
          .filter-view-container {
            display: flex;
            align-items: center;
            gap: 12px;
            background: linear-gradient(135deg, #032d70 0%, #02244f 100%);
            border-radius: 24px;
            padding: 8px;
            box-shadow: 0 8px 32px rgba(3, 45, 112, 0.4);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          /* Botón principal de filtrar */
          .filter-view-button {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 12px 20px;
            border: none;
            border-radius: 16px;
            color: white;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
            white-space: nowrap;
          }

          .filter-view-button-text {
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 0.025em;
          }

          /* Contenedor de iconos de vista */
          .filter-view-icons {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          /* Iconos individuales */
          .filter-view-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 44px;
            height: 44px;
            border: none;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.7);
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          .filter-view-icon:hover {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(3, 45, 112, 0.3);
          }

          .filter-view-icon-active {
            background: linear-gradient(135deg, #032d70 0%, #02244f 100%) !important;
            color: white !important;
            box-shadow: 0 2px 8px rgba(3, 45, 112, 0.3) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
          }

          .filter-view-icon-inactive {
            background: rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.6);
          }

          .icon-bounce {
            animation: iconBounce 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          }

          .smooth-press {
            animation: smoothPress 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          }

          /* Responsive */
          @media (max-width: 640px) {
            .filter-view-container {
              padding: 6px;
              gap: 8px;
            }

            .filter-view-button {
              padding: 10px 16px;
              font-size: 13px;
            }

            .filter-view-button-text {
              display: none;
            }

            .filter-view-icon {
              width: 40px;
              height: 40px;
            }
          }
        `}
      </style>
      <div 
        className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ease-out ${
          isVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
      <div className="filter-view-container">
        {/* Filter & Sort Button */}
        <button
          ref={buttonRef}
          onClick={onFilterClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="filter-view-button"
          style={{ 
            width: '60%',
            background: isHovered ? 'linear-gradient(135deg, #02244f 0%, #032d70 100%)' : 'linear-gradient(135deg, #032d70 0%, #02244f 100%)',
            boxShadow: isPressed ? '0 2px 8px rgba(3, 45, 112, 0.4)' : isHovered ? '0 6px 16px rgba(3, 45, 112, 0.4)' : '0 4px 12px rgba(3, 45, 112, 0.3)',
            transform: isPressed ? 'translateY(1px) scale(0.98)' : isHovered ? 'translateY(-1px) scale(1)' : 'translateY(0) scale(1)'
          }}
          onMouseDown={(e) => {
            setIsPressed(true);
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(3, 45, 112, 0.4)';
            
            // Efecto ripple
            const rect = e.currentTarget.getBoundingClientRect();
            const ripple = document.createElement('span');
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
              position: absolute;
              width: ${size}px;
              height: ${size}px;
              left: ${x}px;
              top: ${y}px;
              background: radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 70%, transparent 100%);
              border-radius: 50%;
              transform: scale(0);
              animation: ripple 0.8s cubic-bezier(0.4, 0, 0.2, 1);
              pointer-events: none;
            `;
            
            e.currentTarget.appendChild(ripple);
            
            setTimeout(() => {
              ripple.remove();
            }, 800);
          }}
          onMouseUp={() => {
            setIsPressed(false);
          }}
        >
          <svg 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            className="flex-shrink-0 sm:w-4 sm:h-4 transition-transform duration-300 ease-out"
            style={{ transform: isPressed ? 'scale(0.9)' : 'scale(1)' }}
          >
            <path 
              d="M3 7h18M6 12h12M9 17h6" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
          <span className="filter-view-button-text">Filtrar</span>
        </button>

        {/* View Density Icons */}
        <div className="filter-view-icons">
          {/* Comfortable View (Espaciado amplio) */}
          <button
            onClick={() => onViewChange('comfortable')}
            className={`filter-view-icon ${currentView === 'comfortable' ? 'filter-view-icon-active' : 'filter-view-icon-inactive'}`}
            style={currentView === 'comfortable' ? {
              background: 'linear-gradient(135deg, #032d70 0%, #02244f 100%)',
              boxShadow: '0 2px 8px rgba(3, 45, 112, 0.3)'
            } : {}}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.9)';
              e.currentTarget.classList.add('smooth-press');
              const svg = e.currentTarget.querySelector('svg');
              if (svg) svg.classList.add('icon-bounce');
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.classList.remove('smooth-press');
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.classList.remove('smooth-press');
            }}
            aria-label="Vista cómoda (4 productos por fila)"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className="transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) sm:w-[18px] sm:h-[18px]"
            >
              <rect x="3" y="3" width="6" height="6" stroke="currentColor" strokeWidth="1.5" rx="1"/>
              <rect x="15" y="3" width="6" height="6" stroke="currentColor" strokeWidth="1.5" rx="1"/>
              <rect x="3" y="15" width="6" height="6" stroke="currentColor" strokeWidth="1.5" rx="1"/>
              <rect x="15" y="15" width="6" height="6" stroke="currentColor" strokeWidth="1.5" rx="1"/>
            </svg>
          </button>

          {/* Compact View (Más productos) */}
          <button
            onClick={() => onViewChange('compact')}
            className={`filter-view-icon ${currentView === 'compact' ? 'filter-view-icon-active' : 'filter-view-icon-inactive'}`}
            style={currentView === 'compact' ? {
              background: 'linear-gradient(135deg, #032d70 0%, #02244f 100%)',
              boxShadow: '0 2px 8px rgba(3, 45, 112, 0.3)'
            } : {}}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.9)';
              e.currentTarget.classList.add('smooth-press');
              const svg = e.currentTarget.querySelector('svg');
              if (svg) svg.classList.add('icon-bounce');
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.classList.remove('smooth-press');
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.classList.remove('smooth-press');
            }}
            aria-label="Vista compacta (más productos por fila)"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className="transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) sm:w-[18px] sm:h-[18px]"
            >
              <rect x="2" y="2" width="8" height="8" stroke="currentColor" strokeWidth="1.5" rx="1"/>
              <rect x="14" y="2" width="8" height="8" stroke="currentColor" strokeWidth="1.5" rx="1"/>
              <rect x="2" y="14" width="8" height="8" stroke="currentColor" strokeWidth="1.5" rx="1"/>
              <rect x="14" y="14" width="8" height="8" stroke="currentColor" strokeWidth="1.5" rx="1"/>
            </svg>
          </button>
        </div>
      </div>
      </div>
    </>
  );
}
