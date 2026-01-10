import React, { useState, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ProductCard } from './components/ProductCard';
import { ProductDetail } from './components/ProductDetail';
import { CartDrawer } from './components/CartDrawer';
import { ChatWidget } from './components/ChatWidget';
import { MOCK_PRODUCTS, CATEGORIES } from './constants';
import { Product, CartItem } from './types';

const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All Products');
  const [maxPrice, setMaxPrice] = useState(150);
  const [currentView, setCurrentView] = useState<'grid' | 'detail'>('grid');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Filter Logic
  const filteredProducts = useMemo(() => {
    let filtered = MOCK_PRODUCTS;

    // Category Filtering
    if (activeCategory === 'New Arrivals') {
      filtered = filtered.filter(p => p.isNew);
    } else if (activeCategory !== 'All Products') {
      filtered = filtered.filter(p => p.category === activeCategory || p.category === activeCategory.replace(' ', ''));
    }

    // Price Filtering
    filtered = filtered.filter(p => p.price <= maxPrice);

    return filtered;
  }, [activeCategory, maxPrice]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('detail');
    window.scrollTo(0, 0);
  };

  const handleBackToShop = () => {
    setSelectedProduct(null);
    setCurrentView('grid');
  };

  const handleAddToCart = (item: CartItem) => {
    setCartItems(prev => [...prev, item]);
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 selection:bg-red-600 selection:text-white">
      <Navbar 
        cartCount={cartItems.length} 
        onOpenCart={() => setIsCartOpen(true)}
        onGoHome={handleBackToShop}
      />
      
      <main className="max-w-[1600px] mx-auto">
        {currentView === 'grid' ? (
          <div className="flex flex-col md:flex-row px-4 sm:px-6 lg:px-8 pb-12">
            <Sidebar 
              activeCategory={activeCategory} 
              onCategoryChange={setActiveCategory} 
              maxPrice={maxPrice}
              onPriceChange={setMaxPrice}
            />
            
            <div className="flex-1 pt-8">
              <div className="mb-8">
                <div className="flex items-baseline justify-between mb-2">
                  <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tight display-text text-white">
                    {activeCategory}
                  </h2>
                  <span className="text-sm text-gray-500 font-mono">{filteredProducts.length} SIGNALS DETECTED</span>
                </div>
                <div className="w-full h-px bg-neutral-800"></div>
                {/* Mobile Filter Tabs */}
                <div className="md:hidden flex overflow-x-auto gap-4 py-4 scrollbar-hide">
                  {['All Products', 'Music', 'Apparel'].map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`whitespace-nowrap px-4 py-2 rounded border text-xs font-bold uppercase ${
                        activeCategory === cat 
                        ? 'bg-red-600 text-white border-red-600 shadow-[0_0_10px_rgba(220,38,38,0.4)]' 
                        : 'bg-black text-gray-400 border-neutral-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
                  {filteredProducts.map(product => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onClick={handleProductClick} 
                    />
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center border border-dashed border-neutral-800 rounded-lg">
                  <p className="text-gray-500 text-lg font-mono">No signals found in this frequency.</p>
                  <button 
                    onClick={() => setMaxPrice(150)} 
                    className="mt-4 text-sm text-red-500 hover:text-red-400 underline"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          selectedProduct && (
            <ProductDetail 
              product={selectedProduct} 
              onBack={handleBackToShop}
              onAddToCart={handleAddToCart}
            />
          )
        )}
      </main>

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems}
        onRemove={handleRemoveFromCart}
      />

      <ChatWidget />
    </div>
  );
};

export default App;