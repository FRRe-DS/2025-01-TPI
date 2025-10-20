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
            className="px-4 py-2 border rounded-md bg-white disabled:opacity-50"
            >
            Anterior
            </button>
            
            <span className="text-gray-700">
            Página {currentPage} de {totalPages}
            </span>
            
            <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNext}
            className="px-4 py-2 border rounded-md bg-white disabled:opacity-50"
            >
            Siguiente
            </button>
        </div>
        );
    }