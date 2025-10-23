import { themes } from './themes';

export const templates = {
  classic: {
    theme: themes.classic,
    hero: {
      title: 'Timeless Elegance',
      subtitle: 'Discover our curated collection of classic products.',
      ctaText: 'Explore Now',
      backgroundImage: '',
      alignment: 'left',
    },
    productCard: {
      container: 'group bg-white border border-gray-200 rounded-lg overflow-hidden transition-shadow hover:shadow-xl',
      image: 'w-full h-56 object-contain group-hover:opacity-90 group-hover:scale-105 transition-all duration-300',
      details: 'p-5',
      title: 'font-serif text-xl font-medium text-gray-800',
      description: 'text-sm text-gray-500 mt-2 line-clamp-2',
      price: 'text-lg font-serif font-semibold text-gray-900 mt-3',
      compareAtPrice: 'text-sm text-gray-500 line-through ml-2',
      rating: 'flex items-center mt-2',
      stock: 'text-xs font-medium mt-2 px-2 py-1 rounded-full',
      button: 'mt-4 w-full py-2.5 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition-colors flex items-center justify-center gap-2',
    },
  },
  modern: {
    theme: themes.modern,
    hero: {
      title: 'Fresh & Innovative',
      subtitle: 'Experience the future with our modern designs.',
      ctaText: 'Discover What\'s New',
      backgroundImage: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?q=80&w=2070&auto=format&fit=crop',
      alignment: 'center',
    },
    productCard: {
      container: 'group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300',
      image: 'w-full h-60 object-contain group-hover:scale-105 transition-transform duration-300',
      details: 'p-6',
      title: 'font-bold text-xl text-gray-900',
      description: 'text-sm text-gray-500 mt-2 line-clamp-2 h-10',
      price: 'text-2xl font-bold text-gray-800 mt-4',
      compareAtPrice: 'text-lg text-gray-500 line-through ml-2',
      rating: 'flex items-center mt-3',
      stock: 'text-xs font-medium mt-3 px-2 py-1 rounded-full',
      button: 'mt-5 w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2',
    },
  },
  minimalist: {
    theme: themes.minimalist,
    hero: {
      title: 'Less is More',
      subtitle: 'Simplicity is the ultimate sophistication.',
      ctaText: 'Shop the Collection',
      backgroundImage: '',
      alignment: 'center',
    },
    productCard: {
      container: 'group text-left',
      image: 'w-full h-72 object-contain mb-4 rounded-lg group-hover:scale-105 transition-transform duration-300',
      details: 'px-1',
      title: 'font-semibold text-lg tracking-wide text-black',
      description: 'hidden',
      price: 'text-md text-gray-600 mt-1',
      compareAtPrice: 'text-sm text-gray-500 line-through ml-2',
      rating: 'flex items-center mt-2',
      stock: 'text-xs font-medium mt-2 px-2 py-1 rounded-full',
      button: 'mt-4 py-2.5 w-full border border-gray-300 text-black rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors',
    },
  },
  bold: {
    theme: themes.bold,
    hero: {
      title: 'MAKE A STATEMENT',
      subtitle: 'Unleash your bold side with our vibrant collection.',
      ctaText: 'DARE TO EXPLORE',
      backgroundImage: '',
      alignment: 'center',
    },
    productCard: {
      container: 'group bg-black text-white rounded-lg overflow-hidden border-2 border-black hover:border-yellow-400 transition-all duration-300 transform hover:-translate-y-1',
      image: 'w-full h-56 object-contain group-hover:scale-105 transition-transform duration-300',
      details: 'p-6',
      title: 'text-2xl font-extrabold uppercase tracking-wider text-yellow-400',
      description: 'text-sm opacity-70 mt-2 line-clamp-2 h-10',
      price: 'text-3xl font-mono font-bold mt-4 text-white',
      compareAtPrice: 'text-lg text-gray-500 line-through ml-2',
      rating: 'flex items-center mt-3',
      stock: 'text-xs font-medium mt-3 px-2 py-1 rounded-full',
      button: 'mt-6 w-full py-3 bg-yellow-400 text-black font-bold rounded-md hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2',
    },
  },
};

export type Template = keyof typeof templates;