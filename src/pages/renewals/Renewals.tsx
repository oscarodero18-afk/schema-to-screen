import React, { useEffect, useState } from 'react';
import { supabaseClient } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  History, 
  AlertCircle, 
  CheckCircle2, 
  Calendar,
  ArrowRight
} from 'lucide-react';
import * as Sonner from 'sonner';

const Renewals: React.FC = () => {
  const { profile } = useAuth();
  const [renewals, setRenewals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRenewals = async () => {
    setLoading(true);
    // Join with customers
    const { data, error } = await supabaseClient
      .from('renewals')
      .select(`
        *,
        customer:customers(name, company_name, agent_id)
      `)
      .order('renewal_date', { ascending: true });

    if (error) {
      Sonner.toast.error('Failed to fetch renewals');
    } else {
      // Filter by agent_id if not admin (RLS handles this but UI filter is safer)
      const filtered = profile?.role === 'admin' 
        ? data 
        : data?.filter(r => r.customer.agent_id === profile?.id);
      
      setRenewals(filtered || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (profile) fetchRenewals();
  }, [profile]);

  const getDaysRemaining = (date: string) => {
    const diffTime = new Date(date).getTime() - new Date().getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getUrgencyBadge = (days: number) => {
    if (days <= 0) return <Badge variant="destructive">Expired</Badge>;
    if (days <= 7) return <Badge className="bg-orange-500 text-white border-none">Urgent ({days}d)</Badge>;
    if (days <= 30) return <Badge className="bg-yellow-500 text-white border-none">Upcoming ({days}d)</Badge>;
    return <Badge variant="outline" className="text-muted-foreground">{days} days</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-blue-50/50 border-blue-100 shadow-none">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-600">Active Renewals</p>
                <p className="text-2xl font-bold">{renewals.filter(r => r.status !== 'renewed').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50/50 border-orange-100 shadow-none">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-600">Urgent (7 Days)</p>
                <p className="text-2xl font-bold">{renewals.filter(r => getDaysRemaining(r.renewal_date) <= 7 && r.status !== 'renewed').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50/50 border-green-100 shadow-none">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-600">Recently Renewed</p>
                <p className="text-2xl font-bold">{renewals.filter(r => r.status === 'renewed').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Renewal Schedule
          </CardTitle>
          <CardDescription>Track domain, hosting, and software renewals for your customers.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Renewal Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">Loading renewals...</TableCell>
                </TableRow>
              ) : renewals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No renewal records found.</TableCell>
                </TableRow>
              ) : (
                renewals.map((r) => (
                  <TableRow key={r.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{r.customer.name}</span>
                        <span className="text-xs text-muted-foreground">{r.customer.company_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-primary">{r.service_name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">{new Date(r.renewal_date).toLocaleDateString()}</span>
                        {getUrgencyBadge(getDaysRemaining(r.renewal_date))}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm font-semibold">KES {r.renewal_amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={r.status === 'renewed' ? 'outline' : 'secondary'} className={r.status === 'renewed' ? 'bg-green-50 text-green-700' : ''}>
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="gap-2">
                        Notify <ArrowRight className="h-3 w-3" />
                      </Button>
                    </TableCell>
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

export default Renewals;
