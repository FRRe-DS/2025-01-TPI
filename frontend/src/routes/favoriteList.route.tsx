import { useParams, Link } from 'react-router';
import { useEffect, useState } from 'react';
import { useFavoriteLists } from '../contexts/FavoriteListsContext';
import { useFavoritesContext } from '../contexts/FavoritesContext';
import { getProductById, type Product } from '../services/product.service';

export default function FavoriteListDetail() {
  const { id } = useParams();
  const { getListById } = useFavoriteLists();
  const { getFavoriteIds } = useFavoritesContext();
  const isAll = id === 'all';
  let list = !isAll && id ? getListById(id) : { id: 'all', nombre: 'All Favorites', productos: getFavoriteIds() };

  // Fallback a localStorage si todavía no está sincronizado el provider
  if (!isAll && !list && id) {
    try {
      const raw = localStorage.getItem('favoriteLists');
      if (raw) {
        const parsed = JSON.parse(raw) as Array<{ id: string; nombre: string; productos: string[] }>;
        const found = parsed.find(l => l.id === id);
        if (found) {
          list = found as any;
        }
      }
    } catch {}
  }
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!list) return;
      const items: Product[] = [];
      for (const pid of list.productos) {
        const p = await getProductById(Number(pid));
        if (p) items.push(p);
      }
      setProducts(items);
    };
    load();
  }, [list]);

  if (!list) {
    return (
      <div className="min-h-screen bg-[#F8F7F2] flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-800 mb-2">Lista no encontrada</div>
          <Link to="/favorites" className="text-blue-600">Volver a Favorites</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F2]">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{list.nombre}</h1>
          <Link to="/favorites" className="text-sm text-gray-600 hover:text-gray-900">← Back to Favorites</Link>
        </div>
        {products.length === 0 ? (
          <div className="text-gray-600">Esta lista no tiene productos.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map(p => {
              const mainImage = p.imagenes.find(img => img.esPrincipal)?.url || p.imagenes[0]?.url;
              return (
                <Link key={p.id} to={`/product/${p.id}`} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                  <div className="w-full aspect-square bg-gray-100 overflow-hidden">
                    {mainImage && <img src={mainImage} alt={p.nombre} className="w-full h-full object-cover" />}
                  </div>
                  <div className="p-4">
                    <div className="font-semibold text-gray-900 truncate mb-1">{p.nombre}</div>
                    <div className="text-gray-900 font-bold">${p.precio.toLocaleString('es-AR')}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


