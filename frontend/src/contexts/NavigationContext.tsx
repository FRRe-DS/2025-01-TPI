import { createContext, useContext, useState, useEffect } from 'react';
import React from 'react';
import type { ReactNode } from 'react';

interface NavigationContextType {
  isTransitioning: boolean;
  transitionDirection: 'left' | 'right';
  startTransition: (direction: 'left' | 'right') => void;
  endTransition: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider = ({ children }: NavigationProviderProps) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'left' | 'right'>('right');

  const startTransition = (direction: 'left' | 'right') => {
    setTransitionDirection(direction);
    setIsTransitioning(true);
  };

  const endTransition = () => {
    setIsTransitioning(false);
  };

  const value: NavigationContextType = {
    isTransitioning,
    transitionDirection,
    startTransition,
    endTransition,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};
