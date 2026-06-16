import React from 'react';
import { Briefcase, Zap, Info, Maximize2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: any;
  onSelect: (product: any) => void;
  onDownload: (url: string, filename: string) => void;
  onViewImage: (url: string) => void;
  onViewDetails: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onSelect, 
  onDownload, 
  onViewImage,
  onViewDetails
}) => {
  return (
    <Card className="flex flex-col border border-border shadow-sm hover:shadow-xl transition-all duration-500 group overflow-hidden rounded-2xl bg-card">
      {product.image_url ? (
        <div 
          className="aspect-video w-full overflow-hidden border-b border-border relative cursor-pointer"
          onClick={() => onSelect(product)}
        >
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
            <p className="text-white text-[10px] font-bold uppercase tracking-widest">Premium Enterprise Solution</p>
          </div>
          
          <div className="absolute top-3 right-3 flex gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10">
            <Button 
              variant="secondary" 
              size="icon" 
              className="h-8 w-8 rounded-lg bg-white/90 hover:bg-white text-primary shadow-sm"
              onClick={(e) => { e.stopPropagation(); onViewImage(product.image_url); }}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="secondary" 
              size="icon" 
              className="h-8 w-8 rounded-lg bg-white/90 hover:bg-white text-primary shadow-sm"
              onClick={(e) => { e.stopPropagation(); onDownload(product.image_url, `${product.name}.jpg`); }}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="aspect-video w-full bg-primary/5 flex items-center justify-center border-b border-border">
          <Briefcase className="h-12 w-12 text-primary/20" />
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase font-bold px-2.5 py-1 rounded-full tracking-wider">{product.category}</Badge>
          <Zap className="h-4 w-4 text-accent fill-accent animate-pulse" />
        </div>
        <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-1">{product.name}</CardTitle>
        <CardDescription className="line-clamp-2 min-h-[2.5rem] text-xs">{product.description || 'Professional technology solution for growing businesses.'}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1 p-3 rounded-2xl bg-muted/50">
            <p className="text-[9px] text-muted-foreground uppercase font-extrabold tracking-tighter">Floor Price</p>
            <p className="font-black text-sm text-foreground">KES {product.min_price?.toLocaleString()}</p>
          </div>
          <div className="space-y-1 p-3 rounded-2xl bg-primary/5 border border-primary/20">
            <p className="text-[9px] text-primary uppercase font-extrabold tracking-tighter">Target Price</p>
            <p className="font-black text-sm text-primary">KES {product.rec_price?.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="bg-accent/5 p-3 rounded-2xl flex gap-3 items-center border border-accent/10">
          <div className="h-8 w-8 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
            <Info className="h-4 w-4 text-accent" />
          </div>
          <p className="text-[10px] leading-tight font-bold text-accent/80">High-yield solution: Earn up to 50% commission on excess value.</p>
        </div>
      </CardContent>
      <CardFooter className="pt-0 px-6 pb-6 flex flex-col gap-3">
        <Button 
          variant="outline" 
          className="w-full h-10 font-bold rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-all"
          onClick={() => onViewDetails(product.id)}
        >
          Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
