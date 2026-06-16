import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabaseClient } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Zap, 
  FileText, 
  Globe, 
  ArrowRight, 
  Briefcase,
  Maximize2,
  Download,
  Loader2
} from 'lucide-react';
import * as Sonner from 'sonner';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        Sonner.toast.error('Product not found');
        navigate('/products');
      } else {
        setProduct(data);
      }
      setLoading(false);
    };

    if (id) fetchProduct();
  }, [id, navigate]);

  const handleActionCheck = (action: () => void) => {
    if (profile?.role === 'agent' && !profile?.agent_code) {
      Sonner.toast.error("Valid Agent Code required for this action. Please update your profile.");
      return;
    }
    action();
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/products')}
        className="group hover:bg-transparent -ml-2 text-muted-foreground hover:text-primary transition-colors font-bold"
      >
        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Back to Catalog
      </Button>

      <div className="bg-card rounded-[2.5rem] overflow-hidden shadow-2xl border border-border/50">
        {/* Hero Section */}
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-black overflow-hidden">
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
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />
          
          <div className="absolute bottom-10 left-10 right-10 pointer-events-none">
            <Badge className="bg-primary text-white border-none text-[10px] px-5 py-2 uppercase font-black tracking-[0.2em] mb-6 shadow-xl">
              {product.category}
            </Badge>
            <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter drop-shadow-2xl leading-none">
              {product.name}
            </h1>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 md:p-16 space-y-16 bg-gradient-to-b from-card to-muted/10">
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
                    <div key={feature.title} className="p-6 rounded-2xl bg-muted/30 border border-border/50 group hover:border-primary/30 transition-colors shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="h-5 w-5 text-accent fill-accent" />
                        <span className="font-bold text-sm uppercase tracking-widest">{feature.title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
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
                
                <div className="space-y-6 relative">
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Base Floor Price</p>
                    <p className="text-3xl font-black tracking-tight">KES {product.min_price?.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">Target Acquisition Price</p>
                    <p className="text-4xl font-black text-primary tracking-tighter">KES {product.rec_price?.toLocaleString()}</p>
                  </div>
                  
                  <div className="pt-8 border-t border-primary/10">
                    <div className="flex items-center gap-4 bg-white p-5 rounded-3xl shadow-sm border border-primary/5">
                      <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
                        <Zap className="h-6 w-6 text-accent fill-accent" />
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
                  className="w-full h-20 rounded-3xl bg-primary text-white font-black text-xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                  onClick={() => {
                    handleActionCheck(() => {
                      navigate('/sales', { state: { productId: product.id } });
                    });
                  }}
                >
                  Start Sale Cycle
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
                
                <div className="grid grid-cols-2 gap-4">
                  {product.document_url && (
                    <Button variant="outline" className="h-16 rounded-3xl border-border hover:bg-muted font-bold gap-3 text-sm shadow-sm" asChild>
                      <a href={product.document_url} target="_blank" rel="noopener noreferrer">
                        <FileText className="h-5 w-5" /> Technical PDF
                      </a>
                    </Button>
                  )}
                  <Button variant="outline" className="h-16 rounded-3xl border-border hover:bg-muted font-bold gap-3 text-sm shadow-sm">
                    <Globe className="h-5 w-5" /> Web Details
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;