// src/components/CategoryCard.tsx
interface CategoryCardProps {
  title: string;
  description: string;
  imageUrl: string;
  categoryId: string;
  onClick: () => void;
}

export default function CategoryCard({ 
  title, 
  description, 
  imageUrl, 
  categoryId, 
  onClick 
}: CategoryCardProps) {
  return (
    <div 
      className="relative group cursor-pointer overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105"
      onClick={onClick}
    >
      {/* Background Image */}
      <div className="relative h-80 w-full">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20 group-hover:from-black/80 group-hover:via-black/50 group-hover:to-black/30 transition-all duration-300" />
        
        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
          <h3 className="text-3xl font-bold mb-3 group-hover:text-blue-200 transition-colors duration-300">
            {title}
          </h3>
          <p className="text-lg text-gray-200 group-hover:text-gray-100 transition-colors duration-300 leading-relaxed">
            {description}
          </p>
          
          {/* Hover Effect Arrow */}
          <div className="mt-4 flex items-center text-blue-200 group-hover:text-blue-100 transition-all duration-300">
            <span className="text-sm font-semibold mr-2">Explorar</span>
            <svg 
              className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M17 8l4 4m0 0l-4 4m4-4H3" 
              />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Subtle border on hover */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-300/50 transition-all duration-300" />
    </div>
  );
}
