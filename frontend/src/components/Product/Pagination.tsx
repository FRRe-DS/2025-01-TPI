// src/components/Product/Pagination.tsx

interface PaginationProps {
        currentPage: number;
        totalPages: number;
        onPageChange: (newPage: number) => void;
    }
    
    export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
        const hasPrevious = currentPage > 1;
        const hasNext = currentPage < totalPages;
    
        return (
        <div className="flex justify-center items-center gap-4 mt-12">
            <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPrevious}
            className="px-4 py-2 border border-gray-300 dark:border-blue-500 rounded-md bg-white dark:bg-blue-700 text-gray-800 dark:text-white disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-blue-600 transition-colors"
            >
            Anterior
            </button>
            
            <span className="text-gray-700 dark:text-blue-300">
            Página {currentPage} de {totalPages}
            </span>
            
            <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNext}
            className="px-4 py-2 border border-gray-300 dark:border-blue-500 rounded-md bg-white dark:bg-blue-700 text-gray-800 dark:text-white disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-blue-600 transition-colors"
            >
            Siguiente
            </button>
        </div>
        );
    }