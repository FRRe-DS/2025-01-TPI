// src/components/Product/SearchBar.tsx
import { getCategories } from '../../services/product.service';

interface SearchBarProps {
    initialQuery: string;
    initialCategory: string;
    onSearch: (query: string, category: string) => void;
}

const categories = getCategories();

export function SearchBar({ initialQuery, initialCategory, onSearch }: SearchBarProps) {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const query = formData.get('q') as string;
        const category = formData.get('category') as string;
        onSearch(query, category);
    };

    return (
        <form 
        onSubmit={handleSubmit} 
        className="flex flex-col md:flex-row gap-4 mb-8 p-4 bg-white rounded-lg shadow-md"
        >
        <input
            type="text"
            name="q"
            defaultValue={initialQuery}
            placeholder="Buscar productos..."
            className="flex-grow p-2 border rounded-md text-black placeholder:text-gray-700"
        />
        <select
            name="category"
            defaultValue={initialCategory}
            className="p-2 border rounded-md bg-white text-black"
        >
            <option value="all">Todas las categorías</option>
            {categories.map(cat => (
            <option key={cat.id} value={cat.id.toString()}>{cat.nombre}</option>
            ))}
        </select>
        <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Buscar
        </button>
        </form>
    );
    }