import { useState, useRef } from 'react';

interface FilterViewButtonProps {
  onFilterClick: () => void;
  onViewChange: (view: 'grid' | 'list' | 'compact') => void;
  currentView: 'grid' | 'list' | 'compact';
  isVisible: boolean;
  autoView?: boolean;
  onToggleAutoView?: () => void;
}

export function FilterViewButton({ 
  onFilterClick, 
  onViewChange, 
  currentView, 
  isVisible,
  autoView = false,
  onToggleAutoView
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
          
          .icon-bounce {
            animation: iconBounce 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          }
          
          .smooth-press {
            animation: smoothPress 0.2s cubic-bezier(0.4, 0, 0.2, 1);
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

        {/* View Icons */}
        <div className="filter-view-icons">
          {/* Grid View Icon */}
          <button
            onClick={() => onViewChange('grid')}
            className={`filter-view-icon ${currentView === 'grid' && !autoView ? 'filter-view-icon-active' : 'filter-view-icon-inactive'}`}
            style={currentView === 'grid' && !autoView ? {
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
            aria-label="Vista en cuadrícula"
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none"
              className="transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) sm:w-[18px] sm:h-[18px]"
            >
              <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.5" rx="1"/>
              <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.5" rx="1"/>
              <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="1.5" rx="1"/>
              <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="1.5" rx="1"/>
            </svg>
          </button>

          {/* Auto View Toggle */}
          {onToggleAutoView && (
            <button
              onClick={onToggleAutoView}
              className={`filter-view-icon ${autoView ? 'filter-view-icon-active' : 'filter-view-icon-inactive'}`}
              style={autoView ? {
                background: 'linear-gradient(135deg, #032d70 0%, #02244f 100%)',
                boxShadow: '0 2px 8px rgba(3, 45, 112, 0.3)'
              } : {}}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.9)';
                const svg = e.currentTarget.querySelector('svg');
                if (svg) svg.classList.add('icon-bounce');
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              aria-label={autoView ? "Vista automática activada" : "Activar vista automática"}
              title={autoView ? "Vista automática activada" : "Activar vista automática"}
            >
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none"
                className="transition-all duration-200 sm:w-[18px] sm:h-[18px]"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              </svg>
            </button>
          )}
        </div>
      </div>
      </div>
    </>
  );
}
