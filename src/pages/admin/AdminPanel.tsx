import React, { useEffect, useState } from 'react';
import { supabaseClient } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Wallet, 
  ShoppingBag,
  RefreshCw,
  Upload,
  BarChart,
  Target
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import * as Sonner from 'sonner';
import { cn } from '@/lib/utils';
import { ResponsiveContainer, BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import AgentManagement from '@/components/admin/AgentManagement';

const AdminPanel = () => {
  const [stats, setStats] = useState<any>({
    totalAgents: 0,
    activeAgents: 0,
    pendingApprovals: 0,
    totalRevenue: 0,
    performanceLeaders: []
  });
  const [pendingSales, setPendingSales] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const fetchData = async () => {
    try {
      const [agentsRes, salesRes, productsRes] = await Promise.all([
        supabaseClient.from('profiles').select('*').eq('role', 'agent'),
        supabaseClient.from('sales').select('*, product:products(name), customer:customers(name), agent:profiles(full_name)').order('created_at', { ascending: false }),
        supabaseClient.from('products').select('*').order('name')
      ]);

      const sales = salesRes.data || [];
      const pending = sales.filter((s: any) => s.status === 'pending_approval');
      const approved = sales.filter((s: any) => s.status === 'approved');
      
      const revenue = approved.reduce((acc, curr) => acc + (curr.sale_price || 0), 0);
      
      const agentPerf = (agentsRes.data || []).map(agent => ({
        name: agent.full_name,
        revenue: approved.filter(s => s.agent_id === agent.id).reduce((acc, curr) => acc + (curr.sale_price || 0), 0),
        sales: approved.filter(s => s.agent_id === agent.id).length
      })).sort((a, b) => b.revenue - a.revenue);

      setStats({
        totalAgents: agentsRes.data?.length || 0,
        activeAgents: agentsRes.data?.filter(a => a.status === 'active')?.length || 0,
        pendingApprovals: pending.length,
        totalRevenue: revenue,
        performanceLeaders: agentPerf.slice(0, 5)
      });

      setPendingSales(pending);
      setAgents(agentsRes.data || []);
      setProducts(productsRes.data || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerifyPayment = async (id: string, type: 'deposit' | 'final') => {
    try {
      const updateData = type === 'deposit' ? { deposit_verified: true } : { payment_verified: true };
      const { error } = await supabaseClient.from('sales').update(updateData).eq('id', id);
      if (error) throw error;
      Sonner.toast.success(`${type === 'deposit' ? 'Deposit' : 'Final payment'} verified`);
      fetchData();
    } catch (error: any) {
      Sonner.toast.error(error.message);
    }
  };

  const handleApproveSale = async (id: string) => {
    try {
      const { error } = await supabaseClient.from('sales').update({ 
        status: 'approved',
        payment_verified: true,
        deposit_verified: true
      }).eq('id', id);
      
      if (error) throw error;
      Sonner.toast.success('Sale approved successfully');
      fetchData();
    } catch (error: any) {
      Sonner.toast.error(error.message);
    }
  };

  const handleRejectSale = async (id: string) => {
    try {
      const { error } = await supabaseClient.from('sales').update({ status: 'rejected' }).eq('id', id);
      if (error) throw error;
      Sonner.toast.success('Sale rejected');
      fetchData();
    } catch (error: any) {
      Sonner.toast.error(error.message);
    }
  };

  const uploadFile = async (file: File, path: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabaseClient.storage
      .from('product-media')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabaseClient.storage
      .from('product-media')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const imageFile = (document.getElementById('image_file') as HTMLInputElement)?.files?.[0];
      const videoFile = (document.getElementById('video_file') as HTMLInputElement)?.files?.[0];
      const docFile = (document.getElementById('doc_file') as HTMLInputElement)?.files?.[0];

      let imageUrl = formData.get('image_url') as string;
      let videoUrl = formData.get('video_url') as string;
      let documentUrl = formData.get('document_url') as string;

      if (imageFile) imageUrl = await uploadFile(imageFile, 'images');
      if (videoFile) videoUrl = await uploadFile(videoFile, 'videos');
      if (docFile) documentUrl = await uploadFile(docFile, 'documents');

      const productData = {
        name: formData.get('name'),
        category: formData.get('category'),
        min_price: Number(formData.get('min_price')),
        rec_price: Number(formData.get('rec_price')),
        image_url: imageUrl,
        video_url: videoUrl,
        document_url: documentUrl,
        description: formData.get('description'),
      };

      const { error } = editingProduct 
        ? await supabaseClient.from('products').update(productData).eq('id', editingProduct.id)
        : await supabaseClient.from('products').insert(productData);

      if (error) throw error;

      Sonner.toast.success('Product catalog updated');
      setIsProductDialogOpen(false);
      fetchData();
    } catch (error: any) {
      Sonner.toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to remove this solution?')) return;
    try {
      const { error } = await supabaseClient.from('products').delete().eq('id', id);
      if (error) throw error;
      Sonner.toast.success('Product removed');
      fetchData();
    } catch (error: any) {
      Sonner.toast.error(error.message);
    }
  };

  const StatBox = ({ title, value, icon: Icon, subValue }: any) => (
    <Card className="border border-border bg-card rounded-2xl shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            {subValue && <p className="text-xs text-accent font-medium mt-1">{subValue}</p>}
          </div>
          <div className="h-12 w-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Vertex Operations Hub</h2>
          <p className="text-muted-foreground">System administration and revenue oversight.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchData} variant="outline" className="rounded-xl"><RefreshCw className="mr-2 h-4 w-4" /> Sync Data</Button>
          <Button className="rounded-xl bg-primary text-white shadow-lg" onClick={() => { setEditingProduct(null); setIsProductDialogOpen(true); }}><Plus className="mr-2 h-4 w-4" /> New Solution</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatBox title="Total Revenue" value={`KSH ${stats.totalRevenue.toLocaleString()}`} icon={Wallet} subValue="+14% from last month" />
        <StatBox title="Network Capacity" value={stats.totalAgents} icon={Users} subValue={`${stats.activeAgents} Operational`} />
        <StatBox title="Pending Actions" value={stats.pendingApprovals} icon={ShieldCheck} subValue="Requires immediate review" />
        <StatBox title="Solution Count" value={products.length} icon={ShoppingBag} subValue="Across all categories" />
      </div>

      <Tabs defaultValue="approvals" className="space-y-4">
        <TabsList className="bg-muted/50 p-1 border border-border h-auto flex flex-wrap gap-1 rounded-xl">
          <TabsTrigger value="approvals" className="flex-1 h-10 rounded-lg">Approvals ({stats.pendingApprovals})</TabsTrigger>
          <TabsTrigger value="agents" className="flex-1 h-10 rounded-lg">Agent Network</TabsTrigger>
          <TabsTrigger value="analytics" className="flex-1 h-10 rounded-lg">Analytics</TabsTrigger>
          <TabsTrigger value="products" className="flex-1 h-10 rounded-lg">Solution Catalog</TabsTrigger>
        </TabsList>

        <TabsContent value="approvals">
          <Card className="border border-border shadow-sm bg-card rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-muted/20">
              <CardTitle>Sales Approvals Workflow</CardTitle>
              <CardDescription>Verify deposits and approve final sales for commission triggers.</CardDescription>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent / Client</TableHead>
                  <TableHead>Solution</TableHead>
                  <TableHead>Amount (KSH)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingSales.map((sale) => (
                  <TableRow key={sale.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="font-bold">{sale.agent?.full_name}</div>
                      <div className="text-[10px] text-muted-foreground">Client: {sale.customer?.name}</div>
                    </TableCell>
                    <TableCell>{sale.product?.name}</TableCell>
                    <TableCell className="font-mono font-bold text-accent">{sale.sale_price.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 capitalize">
                        {sale.status?.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="outline" size="icon" className={cn("h-8 w-8", sale.deposit_verified ? 'text-accent bg-accent/10 border-accent/20' : '')} onClick={() => handleVerifyPayment(sale.id, 'deposit')} title="Verify Deposit"><Wallet className="h-4 w-4" /></Button>
                      <Button variant="outline" size="icon" className="h-8 w-8 text-destructive border-destructive/20 hover:bg-destructive/10" onClick={() => handleRejectSale(sale.id)} title="Reject"><X className="h-4 w-4" /></Button>
                      <Button size="sm" onClick={() => handleApproveSale(sale.id)} className="h-8 bg-accent hover:bg-accent/90 text-white rounded-lg shadow-sm"><Check className="h-4 w-4 mr-1" /> Approve</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {pendingSales.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No pending sales requiring approval.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="agents">
          <Card className="border border-border shadow-sm bg-card rounded-2xl p-6">
            <AgentManagement />
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border border-border shadow-sm col-span-2 bg-card rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-border/50 bg-muted/20">
                <CardTitle className="flex items-center gap-2"><BarChart className="h-5 w-5 text-primary"/> Revenue Leaderboard</CardTitle>
                <CardDescription>Top performing agents by approved sales volume.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <ReBarChart data={stats.performanceLeaders}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: 'var(--muted-foreground)'}} />
                    <Tooltip cursor={{fill: 'var(--muted)'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)'}} />
                    <Bar dataKey="revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  </ReBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="border border-border shadow-sm bg-card rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-border/50 bg-muted/20">
                <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-accent"/> Agent Rankings</CardTitle>
                <CardDescription>Efficiency and output metrics.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {stats.performanceLeaders.map((p: any, i: number) => (
                    <div key={p.name} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold", i === 0 ? 'bg-accent text-white ring-4 ring-accent/10' : 'bg-muted')}>{i + 1}</div>
                        <div>
                          <p className="text-sm font-bold">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground">Network Member</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono font-bold">KSH {p.revenue.toLocaleString()}</p>
                        <p className="text-[10px] text-accent font-medium">{p.sales} Approved Sales</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products">
          <Card className="border border-border shadow-sm bg-card rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-muted/20">
              <div>
                <CardTitle>Solution Catalog</CardTitle>
                <CardDescription>Manage the ecosystem of products available to agents.</CardDescription>
              </div>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Solution Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Pricing (Min/Rec)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell><Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10">{product.category}</Badge></TableCell>
                    <TableCell className="font-mono text-sm">KSH {product.min_price?.toLocaleString()} / {product.rec_price?.toLocaleString()}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary" onClick={() => { setEditingProduct(product); setIsProductDialogOpen(true); }}><TrendingUp className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteProduct(product.id)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{editingProduct ? 'Synchronize Solution' : 'Publish New Solution'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveProduct} className="space-y-4 py-4">
            <div className="space-y-2"><Label>Product Name</Label><Input name="name" defaultValue={editingProduct?.name} required placeholder="e.g. Vertex POS System" className="rounded-lg" /></div>
            <div className="space-y-2"><Label>Category</Label><Input name="category" defaultValue={editingProduct?.category} required placeholder="e.g. Software" className="rounded-lg" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Floor Price (Min)</Label><Input name="min_price" type="number" defaultValue={editingProduct?.min_price} required className="rounded-lg" /></div>
              <div className="space-y-2"><Label>Target Price (Rec)</Label><Input name="rec_price" type="number" defaultValue={editingProduct?.rec_price} required className="rounded-lg" /></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Product Image</Label>
                <div className="flex gap-2">
                  <Input name="image_url" defaultValue={editingProduct?.image_url} placeholder="URL or upload" className="flex-1 rounded-lg text-xs" />
                  <div className="relative">
                    <input type="file" name="image_file" className="hidden" id="image_file" accept="image/*" onChange={(e) => { if(e.target.files?.[0]) Sonner.toast.success('Image selected: ' + e.target.files[0].name) }} />
                    <Button type="button" variant="outline" size="icon" className="h-10 w-10 rounded-lg" onClick={() => document.getElementById('image_file')?.click()}>
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Demo Video</Label>
                <div className="flex gap-2">
                  <Input name="video_url" defaultValue={editingProduct?.video_url} placeholder="URL or upload" className="flex-1 rounded-lg text-xs" />
                  <div className="relative">
                    <input type="file" name="video_file" className="hidden" id="video_file" accept="video/*" onChange={(e) => { if(e.target.files?.[0]) Sonner.toast.success('Video selected: ' + e.target.files[0].name) }} />
                    <Button type="button" variant="outline" size="icon" className="h-10 w-10 rounded-lg" onClick={() => document.getElementById('video_file')?.click()}>
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Product Document (PDF)</Label>
              <div className="flex gap-2">
                <Input name="document_url" defaultValue={editingProduct?.document_url} placeholder="URL or upload" className="flex-1 rounded-lg text-xs" />
                <div className="relative">
                  <input type="file" name="doc_file" className="hidden" id="doc_file" accept=".pdf" onChange={(e) => { if(e.target.files?.[0]) Sonner.toast.success('Document selected: ' + e.target.files[0].name) }} />
                  <Button type="button" variant="outline" size="icon" className="h-10 w-10 rounded-lg" onClick={() => document.getElementById('doc_file')?.click()}>
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2"><Label>Solution Description</Label><Textarea name="description" defaultValue={editingProduct?.description} rows={3} className="rounded-lg" /></div>
            <Button type="submit" className="w-full rounded-xl bg-primary text-white h-11 shadow-lg" disabled={loading}>
              {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editingProduct ? 'Synchronize Updates' : 'Publish to Catalog'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;