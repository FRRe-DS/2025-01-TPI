export default function ShopCartModal() {

  let count = 1

  return <div className="relative">
      <a href="/shopcart" className="w-14 flex justify-center items-center">
        <svg 
          className="w-7 h-7 text-gray-500 group-hover:text-gray-900 transition-colors" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path d="M4 4h2l3.6 12h10l3.4-8H8" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="11" cy="20" r="1"/>
          <circle cx="18" cy="20" r="1"/>
        </svg>
        {count > 0 && (
          <span className="absolute -right-1 -top-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {count}
          </span>
        )}
      </a>
    </div>
}