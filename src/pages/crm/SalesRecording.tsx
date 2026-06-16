import React, { useEffect, useState } from 'react';
import { supabaseClient } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import * as Sonner from 'sonner';
import { Loader2, Calculator, UserPlus, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

const SalesRecording: React.FC = () => {
  const { profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  
  const [formData, setFormData] = useState({
    customer_id: '',
    product_id: location.state?.productId || '',
    sale_price: '',
    deposit_paid: '0',
    payment_method: 'Cash',
    sale_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      const [prodRes, custRes] = await Promise.all([
        supabaseClient.from('products').select('*').order('name'),
        supabaseClient.from('customers').select('*').order('name').eq('agent_id', profile?.id)
      ]);
      
      const allProducts = prodRes.data || [];
      // Add custom solution option
      const customSolution = {
        id: 'custom-solution',
        name: 'Custom Solution (Non-Catalog)',
        min_price: 1,
        rec_price: 0,
        category: 'Custom'
      };
      
      setProducts([...allProducts, customSolution]);
      setCustomers(custRes.data || []);
    };
    if (profile) fetchData();
  }, [profile]);

  const selectedProduct = products.find(p => p.id === formData.product_id);
  const balanceDue = (parseFloat(formData.sale_price) || 0) - (parseFloat(formData.deposit_paid) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    if (profile.role === 'agent' && !profile.agent_code) {
      Sonner.toast.error("Valid Agent Code required to finalize sale. Please contact admin.");
      return;
    }

    if (selectedProduct && selectedProduct.id !== 'custom-solution' && parseFloat(formData.sale_price) < selectedProduct.min_price) {
      Sonner.toast.error(`Sale price cannot be lower than minimum product price (KES ${selectedProduct.min_price.toLocaleString()})`);
      return;
    }

    if (selectedProduct && selectedProduct.id !== 'custom-solution' && parseFloat(formData.sale_price) < selectedProduct.min_price) {
      Sonner.toast.error(`Sale price cannot be lower than minimum product price (KES ${selectedProduct.min_price.toLocaleString()})`);
      return;
    }

    setLoading(true);
    try {
      let finalCustomerId = formData.customer_id;

      // Handle new customer creation
      if (isNewCustomer && newCustomerName) {
        const { data: newCust, error: custError } = await supabaseClient
          .from('customers')
          .insert([{ name: newCustomerName, agent_id: profile.id }])
          .select()
          .single();
        
        if (custError) throw custError;
        finalCustomerId = newCust.id;
      }

      if (!finalCustomerId) {
        Sonner.toast.error('Please select or add a customer');
        setLoading(false);
        return;
      }

      const salePayload: any = {
        agent_id: profile.id,
        customer_id: finalCustomerId,
        sale_price: parseFloat(formData.sale_price),
        min_price: selectedProduct?.id === 'custom-solution' ? 0 : (selectedProduct?.min_price || 0),
        deposit_paid: parseFloat(formData.deposit_paid) || 0,
        balance_due: balanceDue,
        payment_method: formData.payment_method,
        sale_date: formData.sale_date,
        notes: formData.notes,
        status: 'pending_approval'
      };

      if (formData.product_id !== 'custom-solution') {
        salePayload.product_id = formData.product_id;
      } else {
        salePayload.notes = `[CUSTOM SOLUTION] ${formData.notes}`;
      }

      const { error } = await supabaseClient.from('sales').insert([salePayload]);

      if (error) {
        Sonner.toast.error(error.message);
      } else {
        Sonner.toast.success('Sale recorded and pending approval');
        navigate('/dashboard');
      }
    } catch (err: any) {
      Sonner.toast.error(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <Card className="border border-border shadow-lg rounded-3xl overflow-hidden bg-card">
        <CardHeader className="bg-primary/5 border-b border-primary/10">
          <CardTitle className="text-2xl font-black text-primary">Record Transaction</CardTitle>
          <CardDescription>Enter the strategic details of your closed deal for revenue verification.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Client Intelligence</Label>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className={cn("h-7 text-[10px] font-black uppercase rounded-full", isNewCustomer ? "text-primary bg-primary/10" : "text-muted-foreground")}
                    onClick={() => setIsNewCustomer(!isNewCustomer)}
                  >
                    <UserPlus className="h-3 w-3 mr-1" /> {isNewCustomer ? "Select Existing" : "New Client"}
                  </Button>
                </div>
                
                {isNewCustomer ? (
                  <Input 
                    placeholder="Enter client full name" 
                    className="h-12 rounded-xl border-primary/20 focus:ring-primary" 
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    required
                  />
                ) : (
                  <Select value={formData.customer_id} onValueChange={(val) => setFormData({...formData, customer_id: val})}>
                    <SelectTrigger className="h-12 rounded-xl border-border bg-muted/20">
                      <SelectValue placeholder="Select established client" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Solution Deployment</Label>
                <Select value={formData.product_id} onValueChange={(val) => setFormData({...formData, product_id: val})}>
                  <SelectTrigger className="h-12 rounded-xl border-border bg-muted/20">
                    <SelectValue placeholder="Select solution" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(p => (
                      <SelectItem key={p.id} value={p.id} className={cn(p.id === 'custom-solution' && "font-bold text-accent")}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="sale_price" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Negotiated Price (KES)</Label>
                <div className="relative">
                  <Input 
                    id="sale_price" 
                    type="number" 
                    required 
                    className="h-12 rounded-xl border-border bg-muted/20 font-black text-lg" 
                    value={formData.sale_price}
                    onChange={(e) => setFormData({...formData, sale_price: e.target.value})}
                    placeholder={selectedProduct?.id !== 'custom-solution' && selectedProduct ? `Min: ${selectedProduct.min_price}` : "0"}
                  />
                  {selectedProduct && selectedProduct.id !== 'custom-solution' && (
                    <div className="mt-2 flex justify-between text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                      <span className="bg-muted px-2 py-0.5 rounded">Floor: {selectedProduct.min_price.toLocaleString()}</span>
                      <span className="bg-primary/5 text-primary px-2 py-0.5 rounded">Target: {selectedProduct.rec_price.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="deposit" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Initial Deposit (KES)</Label>
                <Input 
                  id="deposit" 
                  type="number" 
                  className="h-12 rounded-xl border-border bg-muted/20 font-bold" 
                  value={formData.deposit_paid}
                  onChange={(e) => setFormData({...formData, deposit_paid: e.target.value})}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Financial Channel</Label>
                <Select value={formData.payment_method} onValueChange={(val) => setFormData({...formData, payment_method: val})}>
                  <SelectTrigger className="h-12 rounded-xl border-border bg-muted/20">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash Remittance</SelectItem>
                    <SelectItem value="M-Pesa">M-Pesa Mobile</SelectItem>
                    <SelectItem value="Bank Transfer">Direct Bank Transfer</SelectItem>
                    <SelectItem value="Cheque">Corporate Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="date" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Execution Date</Label>
                <Input 
                  id="date" 
                  type="date" 
                  className="h-12 rounded-xl border-border bg-muted/20" 
                  value={formData.sale_date}
                  onChange={(e) => setFormData({...formData, sale_date: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="notes" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Strategic Notes</Label>
              <Textarea 
                id="notes" 
                rows={4} 
                className="rounded-2xl border-border bg-muted/20 resize-none" 
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Describe custom requirements or special terms..."
              />
            </div>

            <div className="bg-accent/5 p-6 rounded-3xl flex items-center justify-between border border-accent/10 shadow-inner">
              <div className="flex items-center gap-4">
                <div className="bg-white h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm">
                  <Calculator className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-accent uppercase tracking-widest leading-none mb-1">Outstanding Balance</p>
                  <p className="text-xs font-bold text-muted-foreground">Settlement required post-deployment</p>
                </div>
              </div>
              <p className="text-2xl font-black text-accent">KES {balanceDue.toLocaleString()}</p>
            </div>

            <Button type="submit" className="w-full h-16 text-lg font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-white shadow-xl rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-3" disabled={loading}>
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Briefcase className="h-6 w-6" />}
              Finalize Sale Cycle
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
};

export default SalesRecording;