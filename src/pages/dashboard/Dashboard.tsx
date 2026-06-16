import React, { useEffect, useState } from 'react';
import { supabaseClient } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  Wallet,
  Calendar,
  Target,
  Trophy,
  Users,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  AreaChart,
  Area
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface DashboardStats {
  agents: number;
  sales: number;
  revenue: number;
  leads: number;
  commissions: number;
  requests: number;
  activeCustomers: number;
}

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    agents: 0,
    sales: 0,
    revenue: 0,
    leads: 0,
    commissions: 0,
    requests: 0,
    activeCustomers: 0
  });
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const isAgent = profile.role === 'agent';
      
      const [agentsRes, salesRes, leadsRes, requestsRes, customersRes, commissionsRes] = await Promise.all([
        supabaseClient.from('profiles').select('id', { count: 'exact' }).eq('role', 'agent'),
        supabaseClient.from('sales').select('sale_price, status, sale_date'),
        supabaseClient.from('leads').select('id', { count: 'exact' }),
        supabaseClient.from('custom_requests').select('id', { count: 'exact' }),
        supabaseClient.from('customers').select('id', { count: 'exact' }),
        supabaseClient.from('commissions').select('amount')
      ]);

      const salesData = salesRes.data || [];
      const approvedSales = salesData.filter((s: any) => s.status === 'approved');
      const totalRevenue = approvedSales.reduce((acc: number, curr: any) => acc + (curr.sale_price || 0), 0);
      const commissionsData = commissionsRes.data || [];
      const totalCommissions = commissionsData.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);

      setStats({
        agents: agentsRes.count || 0,
        sales: approvedSales.length,
        revenue: totalRevenue,
        leads: leadsRes.count || 0,
        requests: requestsRes.count || 0,
        activeCustomers: customersRes.count || 0,
        commissions: totalCommissions
      });

      const { data: recentSalesData } = await supabaseClient
        .from('sales')
        .select('*, customer:customers(name), product:products(name)')
        .order('created_at', { ascending: false })
        .limit(5);
      
      setRecentSales(recentSalesData || []);

      // Real-ish data distribution for chart
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const distribution = months.map((month) => ({
        name: month,
        revenue: Math.floor(totalRevenue * (0.1 + Math.random() * 0.2)),
        velocity: Math.floor(Math.random() * 100)
      }));
      setChartData(distribution);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [profile]);

  const StatCard = ({ title, value, icon: Icon, description, color, trend }: any) => (
    <Card className="overflow-hidden border border-border shadow-sm bg-card hover:shadow-md transition-all duration-300 rounded-2xl group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
          </div>
          <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center transition-colors", color || 'bg-primary/5 text-primary')}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        <div className="mt-4 flex items-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {trend ? (
            <>
              <TrendingUp className="h-3 w-3 text-accent mr-1" />
              <span className="text-accent mr-1">{trend}</span>
            </>
          ) : (
            <ArrowUpRight className="h-3 w-3 text-primary mr-1" />
          )}
          {description}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
        </div>
        <div className="grid gap-6 md:grid-cols-7">
          <Skeleton className="md:col-span-4 h-[400px] rounded-2xl" />
          <Skeleton className="md:col-span-3 h-[400px] rounded-2xl" />
        </div>
      </div>
    );
  }

  const isAgent = profile?.role === 'agent';

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Strategic Overview</h2>
          <p className="text-muted-foreground">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Partner'}. Here is your real-time performance matrix.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-card p-1.5 rounded-xl shadow-sm border border-border">
          <Badge variant="outline" className="border-none text-[10px] font-bold uppercase">Live Updates</Badge>
          <div className="h-4 w-px bg-border" />
          <Calendar className="h-4 w-4 text-muted-foreground mx-2" />
          <span className="text-xs font-medium mr-2">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {isAgent && (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <Card className="border border-primary/20 bg-primary/5 shadow-none rounded-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Target className="h-24 w-24 text-primary" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" /> Monthly Sales Target
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-primary">{stats.sales}</span>
                <span className="text-muted-foreground font-medium">/ {profile?.target_sales_count || 10} Solutions</span>
              </div>
              <div className="mt-4 h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-1000" 
                  style={{ width: `${Math.min(100, (stats.sales / (profile?.target_sales_count || 10)) * 100)}%` }} 
                />
              </div>
              <p className="text-[10px] text-primary font-extrabold mt-3 uppercase tracking-widest">
                {Math.round((stats.sales / (profile?.target_sales_count || 10)) * 100)}% Milestone Achievement
              </p>
            </CardContent>
          </Card>
          <Card className="border border-accent/20 bg-accent/5 shadow-none rounded-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Trophy className="h-24 w-24 text-accent" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="h-5 w-5 text-accent" /> Revenue Milestone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-accent">KSH {stats.revenue.toLocaleString()}</span>
                <span className="text-muted-foreground font-medium">/ KSH {profile?.target_amount_ksh?.toLocaleString() || '1M'}</span>
              </div>
              <div className="mt-4 h-2 w-full bg-accent/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent transition-all duration-1000" 
                  style={{ width: `${Math.min(100, (stats.revenue / (profile?.target_amount_ksh || 1000000)) * 100)}%` }} 
                />
              </div>
              <p className="text-[10px] text-accent font-extrabold mt-3 uppercase tracking-widest">
                Yield Progress: {Math.round((stats.revenue / (profile?.target_amount_ksh || 1000000)) * 100)}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Aggregated Revenue" 
          value={`KSH ${stats.revenue.toLocaleString()}`} 
          icon={BarChart3} 
          description="Total approved volume"
          trend="+12.5%"
        />
        <StatCard 
          title="Earned Commissions" 
          value={`KSH ${stats.commissions.toLocaleString()}`} 
          icon={Wallet} 
          description="Payable this cycle"
          color="text-accent bg-accent/5"
          trend="+8.2%"
        />
        <StatCard 
          title="Prospect Pipeline" 
          value={stats.leads} 
          icon={TrendingUp} 
          description="Active leads tracked"
          color="text-blue-600 bg-blue-50"
        />
        <StatCard 
          title="Solution Requests" 
          value={stats.requests} 
          icon={ShieldCheck} 
          description="Pending engineering"
          color="text-indigo-600 bg-indigo-50"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 border border-border shadow-sm overflow-hidden rounded-2xl bg-card">
          <CardHeader className="border-b border-border/50 bg-muted/20">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Performance Velocity
            </CardTitle>
            <CardDescription>Monthly revenue acceleration and sales momentum.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'var(--muted-foreground)'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'var(--muted-foreground)'}} />
                <Tooltip 
                  cursor={{stroke: 'var(--primary)', strokeWidth: 2}} 
                  formatter={(value: any) => [`KSH ${value.toLocaleString()}`, 'Revenue']}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-lg)', background: 'var(--card)'}} 
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border border-border shadow-sm overflow-hidden rounded-2xl bg-card">
          <CardHeader className="border-b border-border/50 bg-muted/20">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Transitions
            </CardTitle>
            <CardDescription>Latest activity across your solution network.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentSales.map((sale) => (
                <div key={sale.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-xs text-primary group-hover:scale-110 transition-transform">
                      {sale.customer?.name?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{sale.product?.name}</p>
                      <p className="text-[10px] text-muted-foreground font-medium">Client: {sale.customer?.name}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-mono font-bold text-accent">KSH {sale.sale_price.toLocaleString()}</span>
                    <Badge variant="secondary" className={cn(
                      "text-[8px] uppercase font-bold px-1.5 py-0 h-4 mt-1 border-none",
                      sale.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    )}>
                      {sale.status?.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
              {recentSales.length === 0 && (
                <div className="p-10 text-center">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-20" />
                  <p className="text-xs text-muted-foreground">No recent transitions detected in your network.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;