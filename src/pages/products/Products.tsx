import React, { useEffect, useState } from 'react';
import { supabaseClient } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as Sonner from 'sonner';
import { 
  Dialog,
  DialogContent 
} from "@/components/ui/dialog";
import ProductCard from './components/ProductCard';
import ProductDialog from './components/ProductDialog';

const Products = () => {
  const { profile } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [fullImage, setFullImage] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabaseClient.from('products').select('*').order('name');
    if (error) {
      Sonner.toast.error('Product catalog sync failed');
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      Sonner.toast.success('Download started');
    } catch (err) {
      window.open(url, '_blank');
    }
  };

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const handleActionCheck = (callback: () => void) => {
    if (profile?.role === 'agent' && !profile?.agent_code) {
      Sonner.toast.error("Valid Agent Code required to perform this action. Please contact admin.");
      return;
    }
    callback();
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                         p.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter text-foreground">Solutions Catalog</h1>
            <p className="text-muted-foreground font-medium">Empowering your sales with world-class technology.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by product name or description..." 
              className="pl-10 h-12 bg-card border-border/50 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={activeCategory === cat ? 'default' : 'outline'}
                className={`h-12 rounded-xl px-6 whitespace-nowrap font-bold transition-all ${
                  activeCategory === cat ? 'shadow-lg shadow-primary/20' : 'bg-card border-border/50'
                }`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-[400px] bg-card rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-32 bg-muted/10 rounded-3xl border-2 border-dashed border-border">
          <div className="bg-card h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Filter className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground">No solutions match your search</h3>
          <p className="text-muted-foreground mt-1">Try adjusting your filters or search keywords.</p>
          <Button variant="link" onClick={() => { setSearch(''); setActiveCategory('All'); }} className="mt-4 text-primary font-bold">Clear all filters</Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard 
              key={product.id}
              product={product}
              onSelect={setSelectedProduct}
              onDownload={handleDownload}
              onViewImage={setFullImage}
              onViewDetails={(id) => navigate(`/products/${id}`)}
            />
          ))}
        </div>
      )}

      <ProductDialog
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onDownload={handleDownload}
        onViewImage={setFullImage}
        onStartSale={() => {
          handleActionCheck(() => {
            setSelectedProduct(null);
            navigate('/sales', { state: { productId: selectedProduct.id } });
          });
        }}
      />

      {/* Full Image Lightbox */}
      <Dialog open={!!fullImage} onOpenChange={() => setFullImage(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-transparent shadow-none">
          {fullImage && (
            <div className="relative w-full h-full flex items-center justify-center">
              <img 
                src={fullImage} 
                alt="Product preview" 
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              />
              <Button 
                variant="secondary" 
                size="icon" 
                className="absolute top-4 right-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border-none"
                onClick={() => setFullImage(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Products;
