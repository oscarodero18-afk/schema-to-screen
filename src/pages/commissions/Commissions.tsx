import React, { useEffect, useState } from 'react';
import { supabaseClient } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  BadgePercent, 
  Wallet, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  ArrowUpRight,
  Download
} from 'lucide-react';
import * as Sonner from 'sonner';

const Commissions: React.FC = () => {
  const { profile } = useAuth();
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCommissions = async () => {
    setLoading(true);
    // Join with sales and products for details
    const { data, error } = await supabaseClient
      .from('commissions')
      .select(`
        *,
        sale:sales(
          sale_price,
          sale_date,
          product:products(name)
        )
      `)
      .eq('agent_id', profile?.id)
      .order('created_at', { ascending: false });

    if (error) {
      Sonner.toast.error('Failed to fetch commissions');
    } else {
      setCommissions(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (profile) fetchCommissions();
  }, [profile]);

  const totals = commissions.reduce((acc, curr) => {
    acc.total += curr.amount;
    if (curr.status === 'pending') acc.pending += curr.amount;
    if (curr.status === 'approved') acc.approved += curr.amount;
    if (curr.status === 'paid') acc.paid += curr.amount;
    return acc;
  }, { total: 0, pending: 0, approved: 0, paid: 0 });

  const exportCommissions = () => {
    const headers = ['Date', 'Product', 'Sale Price', 'Base Commission', 'Upsell Bonus', 'Total', 'Status'];
    const rows = commissions.map(c => [c.sale.sale_date, c.sale.product.name, c.sale.sale_price, c.base_commission, c.upsell_bonus, c.amount, c.status]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "commissions_report.csv");
    document.body.appendChild(link);
    link.click();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      approved: 'bg-blue-100 text-blue-700 border-blue-200',
      paid: 'bg-green-100 text-green-700 border-green-200',
    };
    return (
      <Badge variant="outline" className={variants[status]}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">KES {totals.total.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="border-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">KES {totals.pending.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="border-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">KES {totals.approved.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="border-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Paid to You</CardTitle>
            <Wallet className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">KES {totals.paid.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <BadgePercent className="h-5 w-5 text-primary" />
            <CardTitle>Commission History</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={exportCommissions}>
            <Download className="mr-2 h-4 w-4" /> Export Report
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Sale Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Sale Price</TableHead>
                <TableHead>Base Comm.</TableHead>
                <TableHead>Upsell Bonus</TableHead>
                <TableHead>Total Comm.</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">Loading commissions...</TableCell>
                </TableRow>
              ) : commissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No commission records yet.</TableCell>
                </TableRow>
              ) : (
                commissions.map((comm) => (
                  <TableRow key={comm.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(comm.sale.sale_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">{comm.sale.product.name}</TableCell>
                    <TableCell className="font-mono text-xs">KES {comm.sale.sale_price.toLocaleString()}</TableCell>
                    <TableCell className="font-mono text-xs">KES {comm.base_commission.toLocaleString()}</TableCell>
                    <TableCell className="font-mono text-xs text-green-600">
                      {comm.upsell_bonus > 0 ? `+ KES ${comm.upsell_bonus.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell className="font-bold font-mono">KES {comm.amount.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(comm.status)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Commissions;
