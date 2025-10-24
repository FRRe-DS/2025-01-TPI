// src/components/Product/SearchBar.tsx
interface SearchBarProps {
    initialQuery: string;
    onSearch: (query: string) => void;
    isSearching?: boolean;
}

export function SearchBar({ initialQuery, onSearch, isSearching = false }: SearchBarProps) {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const query = formData.get('q') as string;
        onSearch(query);
    };

    return (
        <form 
        onSubmit={handleSubmit} 
        className="flex flex-col md:flex-row gap-4 p-6 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20"
        data-search-bar
        >
        <input
            type="text"
            name="q"
            defaultValue={initialQuery}
            placeholder="Buscar productos, marcas, descripciones..."
            className="flex-grow p-4 border-2 border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300 text-lg"
        />
        <button 
            type="submit" 
            disabled={isSearching}
            className={`px-8 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 ${
                isSearching 
                    ? 'bg-blue-600 text-white cursor-not-allowed opacity-75' 
                    : 'bg-blue-900 text-white hover:bg-blue-800'
            }`}
        >
            {isSearching ? (
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Buscando...
                </div>
            ) : (
                'Buscar'
            )}
        </button>
        </form>
    );
    }