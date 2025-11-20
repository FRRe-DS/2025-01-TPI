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
        className="search-bar-container"
        data-search-bar
        >
        <input
            type="text"
            name="q"
            defaultValue={initialQuery}
            placeholder="Buscar productos, marcas, descripciones..."
            className="search-bar-input"
        />
        <button 
            type="submit" 
            disabled={isSearching}
            className={`search-bar-button ${isSearching ? 'search-bar-button-loading' : ''}`}
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