import { useState, useEffect } from 'react';
import { useFavoriteLists } from '../contexts/FavoriteListsContext';
import { useFavoritesContext } from '../contexts/FavoritesContext';
import { getProductById } from '../services/product.service';
import { useNavigate } from 'react-router';

export default function FavoritesOverview() {
  const { lists, createList } = useFavoriteLists();
  const { getFavoriteIds } = useFavoritesContext();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const [allThumbs, setAllThumbs] = useState<string[]>([]);
  const [thumbsByList, setThumbsByList] = useState<Record<string, string[]>>({});
  const favIds = getFavoriteIds();

  const handleCreate = () => {
    if (!name.trim()) return;
    const l = createList(name.trim());
    setName('');
    setShowCreate(false);
    navigate(`/favorites/${l.id}`);
  };

  useEffect(() => {
    const loadThumbs = async () => {
      const ids = favIds.slice(0, 4);
      const thumbs: string[] = [];
      for (const id of ids) {
        const p = await getProductById(Number(id));
        const img = p?.imagenes.find(img => img.esPrincipal)?.url || p?.imagenes[0]?.url;
        if (img) thumbs.push(img);
      }
      setAllThumbs(thumbs);
    };
    loadThumbs();
  }, [favIds]);

  useEffect(() => {
    const loadPerList = async () => {
      const map: Record<string, string[]> = {};
      for (const l of lists) {
        const imgs: string[] = [];
        for (const pid of l.productos.slice(0, 4)) {
          const p = await getProductById(Number(pid));
          const img = p?.imagenes.find(img => img.esPrincipal)?.url || p?.imagenes[0]?.url;
          if (img) imgs.push(img);
        }
        map[l.id] = imgs;
      }
      setThumbsByList(map);
    };
    loadPerList();
  }, [lists]);

  return (
    <div className="min-h-screen bg-[#F8F7F2]">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Favorites</h1>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {/* Create new list card */}
          <button
            onClick={() => setShowCreate(true)}
            className="flex flex-col items-center justify-center gap-3 border border-gray-200 rounded-xl bg-white hover:shadow-md transition-shadow p-8"
          >
            <div className="w-14 h-14 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-600 text-3xl">+</div>
            <div className="text-gray-900 font-semibold">Create New List</div>
          </button>

          {/* All favorites aggregate */}
          <button
            onClick={() => navigate('/favorites/all')}
            className="text-left border border-gray-200 rounded-xl bg-white hover:shadow-md transition-shadow p-4"
          >
            <div className="grid grid-cols-4 gap-2 mb-3">
              {allThumbs.length > 0 ? (
                allThumbs.map((src, idx) => (
                  <div key={idx} className="w-full aspect-square bg-gray-100 rounded-md overflow-hidden">
                    <img src={src} alt="thumb" className="w-full h-full object-cover" />
                  </div>
                ))
              ) : (
                <div className="col-span-4 text-sm text-gray-400">No products yet</div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="font-semibold text-gray-900 truncate">All Favorites</div>
              <div className="text-gray-600 text-sm">❤️ {favIds.length}</div>
            </div>
          </button>

          {/* Existing lists */}
          {lists.map(list => (
            <button
              key={list.id}
              onClick={() => navigate(`/favorites/${list.id}`)}
              className="text-left border border-gray-200 rounded-xl bg-white hover:shadow-md transition-shadow p-4"
            >
              {/* Thumbnails */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {(thumbsByList[list.id]?.length || 0) > 0 ? (
                  thumbsByList[list.id]!.map((src, idx) => (
                    <div key={idx} className="w-full aspect-square bg-gray-100 rounded-md overflow-hidden">
                      <img src={src} alt="thumb" className="w-full h-full object-cover" />
                    </div>
                  ))
                ) : (
                  <div className="col-span-4 text-sm text-gray-400">No products yet</div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="font-semibold text-gray-900 truncate">{list.nombre}</div>
                <div className="text-gray-600 text-sm">❤️ {list.productos.length}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Create modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowCreate(false)}>
            <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Create a new list</h2>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="List name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
              />
              <div className="flex justify-end gap-3">
                <button className="px-4 py-2 rounded-lg border border-gray-300" onClick={() => setShowCreate(false)}>Cancel</button>
                <button className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50" onClick={handleCreate} disabled={!name.trim()}>Create</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}


