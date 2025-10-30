import { createContext, useContext, useEffect, useState } from "react";
import { getShopCart, createProduct, deleteProduct, updateProductQuantity, clearShopCart } from "~/services/shopcart.service";

type Context = {
    products: any[],
    loading: boolean,
    error: string,
    loadShopCart: () => void,
    addProduct: (product: Record<string,any>) => void,
    removeProduct: (id: number) => void,
    modifyProductQuantity: (id: number, quantity: number) => void,
    clearCart: () => void,
}

const ShopCartContext = createContext(undefined);

const STORAGE_KEY = "shopcart";

export function ShopCartProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function loader(action: (...args: any[]) => Promise<any>): () => any {
    return async () => {
      setError(null);
      setLoading(true);
      try {
        const result = await action();
        return result;
      } catch (err) {
        console.error(err);
        setError(err.message);
        return undefined;
      } finally {
        setLoading(false);
      }
    }
  }

  async function loadShopCart() {
    const res = await getShopCart();
    setProducts(res);
  }

  useEffect(() => {
    loader(loadShopCart)();
  }, []);

  //actualizar local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  async function refreshShopCart() {
    await loader(loadShopCart)();
  }

  async function addProduct(product: Record<string,any>, amount: number) {
    const res = await createProduct({product, amount})
    setProducts([...products, res])
  }

  async function removeProduct(id: string) {
    const res = await deleteProduct(id);
    if (res) {
      await refreshShopCart();
    }
  }

  async function modifyProductQuantity(id: string, quantity: number) {
    const res = await updateProductQuantity(id, quantity);
    if (res) {
      await refreshShopCart();
    }
  }

  async function clearCart() {
    const res = await clearShopCart();
    if (res) {
      setProducts([])
    }
  }

  const context: Context = {
    products,
    loading,
    error,
    loadShopCart: loader(loadShopCart),
    addProduct: loader(addProduct),
    removeProduct: loader(removeProduct),
    modifyProductQuantity: loader(modifyProductQuantity),
    clearCart: loader(clearCart),
  };

  return <ShopCartContext.Provider value={context}>
    {children}
  </ShopCartContext.Provider>;
}

export function useShopCart(): Context {
  const ctx = useContext(ShopCartContext);
  if (!ctx) throw new Error("useShopCart debe usarse dentro de ShopCartProvider");
  return ctx;
}