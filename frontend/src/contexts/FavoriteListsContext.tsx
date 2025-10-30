import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

export interface FavoriteList {
  id: string;
  nombre: string;
  productos: string[]; // product IDs
}

interface FavoriteListsContextType {
  lists: FavoriteList[];
  createList: (name: string) => FavoriteList;
  addProductToList: (listId: string, productId: string) => void;
  removeProductFromList: (listId: string, productId: string) => void;
  getListById: (id: string) => FavoriteList | undefined;
}

const FavoriteListsContext = createContext<FavoriteListsContextType | undefined>(undefined);

export const useFavoriteLists = (): FavoriteListsContextType => {
  const ctx = useContext(FavoriteListsContext);
  if (!ctx) throw new Error('useFavoriteLists must be used within a FavoriteListsProvider');
  return ctx;
};

interface FavoriteListsProviderProps { children: ReactNode }

export const FavoriteListsProvider: React.FC<FavoriteListsProviderProps> = ({ children }) => {
  const [lists, setLists] = useState<FavoriteList[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('favoriteLists');
      if (raw) setLists(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = useCallback((next: FavoriteList[]) => {
    setLists(next);
    try { localStorage.setItem('favoriteLists', JSON.stringify(next)); } catch {}
  }, []);

  const createList = useCallback((name: string): FavoriteList => {
    const generateId = () => {
      try {
        // @ts-ignore
        if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
      } catch {}
      return `fl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    };
    const newList: FavoriteList = { id: generateId(), nombre: name, productos: [] };
    persist([newList, ...lists]);
    return newList;
  }, [lists, persist]);

  const addProductToList = useCallback((listId: string, productId: string) => {
    const pid = String(productId);
    const next = lists.map(l => l.id === listId ? { ...l, productos: Array.from(new Set([...(l.productos || []), pid])) } : l);
    persist(next);
  }, [lists, persist]);

  const removeProductFromList = useCallback((listId: string, productId: string) => {
    const pid = String(productId);
    const next = lists.map(l => l.id === listId ? { ...l, productos: (l.productos || []).filter(id => id !== pid) } : l);
    persist(next);
  }, [lists, persist]);

  const getListById = useCallback((id: string) => lists.find(l => l.id === id), [lists]);

  const value = useMemo(() => ({
    lists,
    createList,
    addProductToList,
    removeProductFromList,
    getListById,
  }), [lists, createList, addProductToList, removeProductFromList, getListById]);

  return (
    <FavoriteListsContext.Provider value={value}>
      {children}
    </FavoriteListsContext.Provider>
  );
};


