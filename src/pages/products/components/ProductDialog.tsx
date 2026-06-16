import React from 'react';
import { X, Maximize2, Download, Briefcase, Zap, ArrowRight, FileText, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface ProductDialogProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (url: string, filename: string) => void;
  onViewImage: (url: string) => void;
  onStartSale: () => void;
}

const ProductDialog: React.FC<ProductDialogProps> = ({
  product,
  isOpen,
  onClose,
  onDownload,
  onViewImage,
  onStartSale
}) => {
  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl p-0 overflow-y-auto max-h-[95vh] md:max-h-[90vh] border-none bg-card rounded-3xl shadow-2xl no-scrollbar">
        <div className="flex flex-col">
          {/* Full Image/Video Section */}
          <div className="relative w-full aspect-[16/9] md:aspect-video bg-black overflow-hidden shadow-2xl">
            {product.video_url ? (
              <iframe 
                src={product.video_url.replace('watch?v=', 'embed/') + '?autoplay=1&mute=1'} 
                className="w-full h-full border-none"
                allowFullScreen
                title={product.name}
              />
            ) : (
              <img 
                src={product.image_url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=2070'} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
            
            {!product.video_url && (
              <div className="absolute top-6 left-6 flex gap-2 z-10">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md"
                  onClick={() => onViewImage(product.image_url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=2070')}
                >
                  <Maximize2 className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md"
                  onClick={() => onDownload(product.image_url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=2070', `${product.name}.jpg`)}
                >
                  <Download className="h-5 w-5" />
                </Button>
              </div>
            )}

            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-6 right-6 h-10 w-10 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-md z-10"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
            <div className="absolute bottom-10 left-10 right-10 pointer-events-none">
              <Badge className="bg-primary text-white border-none text-[10px] px-5 py-2 uppercase font-black tracking-[0.2em] mb-6 shadow-xl">
                {product.category}
              </Badge>
              <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter drop-shadow-2xl leading-none">
                {product.name}
              </h2>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-10 md:p-20 space-y-16 bg-gradient-to-b from-card to-muted/10">
            <div className="grid lg:grid-cols-5 gap-16 md:gap-24">
              <div className="lg:col-span-3 space-y-12">
                <div className="space-y-4">
                  <h3 className="text-xl font-black flex items-center gap-3">
                    <div className="h-8 w-1 bg-primary rounded-full" />
                    Executive Overview
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {product.description || "Vertex Tech's enterprise-grade solution designed to streamline operations and enhance productivity through cutting-edge automation and integration tools."}
                  </p>
                </div>
                
                <div className="space-y-6">
                  <h3 className="text-xl font-black flex items-center gap-3">
                    <div className="h-8 w-1 bg-accent rounded-full" />
                    Core Value Propositions
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-6">
                    {[
                      { title: 'Scalability', desc: 'Grows with your business demand' },
                      { title: 'Security', desc: 'Military-grade data encryption' },
                      { title: 'Integration', desc: 'Seamless API-first connectivity' },
                      { title: 'Support', desc: '24/7 dedicated technical team' }
                    ].map(feature => (
                      <div key={feature.title} className="p-4 rounded-2xl bg-muted/30 border border-border/50 group hover:border-primary/30 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="h-4 w-4 text-accent fill-accent" />
                          <span className="font-bold text-sm uppercase tracking-widest">{feature.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{feature.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-10">
                <div className="p-10 rounded-[2.5rem] bg-primary/5 border border-primary/10 space-y-8 relative overflow-hidden group shadow-inner">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                    <Briefcase className="h-20 w-20 text-primary" />
                  </div>
                  <h3 className="text-xl font-black tracking-tight relative">Commercial Value</h3>
                  
                  <div className="space-y-5 relative">
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Base Floor Price</p>
                      <p className="text-3xl font-black tracking-tight">KES {product.min_price?.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest">Target Acquisition Price</p>
                      <p className="text-4xl font-black text-primary tracking-tighter">KES {product.rec_price?.toLocaleString()}</p>
                    </div>
                    
                    <div className="pt-6 border-t border-primary/10">
                      <div className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-primary/5">
                        <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                          <Zap className="h-5 w-5 text-accent fill-accent" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-accent uppercase tracking-widest leading-none mb-1">Agent Incentive</p>
                          <p className="text-xs font-bold leading-tight">Earn 50% commission on value above floor.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <Button 
                    className="w-full h-16 rounded-2xl bg-primary text-white font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                    onClick={onStartSale}
                  >
                    Start Sale Cycle
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {product.document_url && (
                      <Button variant="outline" className="h-14 rounded-2xl border-border hover:bg-muted font-bold gap-2 text-xs" asChild>
                        <a href={product.document_url} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-4 w-4" /> Technical PDF
                        </a>
                      </Button>
                    )}
                    <Button variant="outline" className="h-14 rounded-2xl border-border hover:bg-muted font-bold gap-2 text-xs">
                      <Globe className="h-4 w-4" /> Web Details
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDialog;
