import { createContext, useContext, useState, useEffect } from 'react';
import React from 'react';
import type { ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Verificar si estamos en el cliente
    if (typeof window === 'undefined') {
      return 'light'; // Valor por defecto en el servidor
    }
    
    // Verificar si hay un tema guardado en localStorage
    const savedTheme = localStorage.getItem('shipper-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    // Si no hay tema guardado, usar la preferencia del sistema
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const isDark = theme === 'dark';

  // Aplicar el tema al documento
  useEffect(() => {

    // Remover todas las clases de tema
    document.documentElement.classList.remove('light', 'dark');

    // Agregar la clase del tema actual
    document.documentElement.classList.add(theme);

    // También agregar la clase al body para mayor compatibilidad
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);

    console.log('Clases del html:', document.documentElement.classList.toString());
    console.log('Clases del body:', document.body.classList.toString());

    // Guardar en localStorage solo en el cliente
    if (typeof window !== 'undefined') {
      localStorage.setItem('shipper-theme', theme);
    }
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
