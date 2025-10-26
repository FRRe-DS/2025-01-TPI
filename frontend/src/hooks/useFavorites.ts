import { useState, useEffect, useCallback } from 'react';

interface FavoriteState {
  [productId: string]: boolean;
}

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteState>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar favoritos desde localStorage al inicializar
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('favorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (err) {
      console.error('Error loading favorites from localStorage:', err);
    }
  }, []);

  // Guardar favoritos en localStorage
  const saveToLocalStorage = useCallback((newFavorites: FavoriteState) => {
    try {
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
    } catch (err) {
      console.error('Error saving favorites to localStorage:', err);
    }
  }, []);

  // Alternar estado de favorito
  const toggleFavorite = useCallback(async (productId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const newFavorites = {
        ...favorites,
        [productId]: !favorites[productId]
      };

      setFavorites(newFavorites);
      saveToLocalStorage(newFavorites);

      // TODO: Aquí se podría hacer una llamada a la API para usuarios logueados
      // if (isLoggedIn) {
      //   await api.toggleFavorite(productId);
      // }

      return true;
    } catch (err) {
      // Revertir cambio en caso de error
      setFavorites(favorites);
      setError('No se pudo guardar. Intenta de nuevo.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [favorites, saveToLocalStorage]);

  // Verificar si un producto es favorito
  const isFavorite = useCallback((productId: string) => {
    return favorites[productId] || false;
  }, [favorites]);

  // Obtener lista de IDs de productos favoritos
  const getFavoriteIds = useCallback(() => {
    return Object.keys(favorites).filter(id => favorites[id]);
  }, [favorites]);

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    favorites,
    isLoading,
    error,
    toggleFavorite,
    isFavorite,
    getFavoriteIds,
    clearError
  };
};
