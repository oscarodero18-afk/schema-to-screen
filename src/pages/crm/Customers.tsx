import React, { useEffect, useState } from 'react';
import { supabaseClient } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, MoreHorizontal, Mail, Phone, Building, Download, Edit, DollarSign } from 'lucide-react';
import * as Sonner from 'sonner';

const Customers: React.FC = () => {
  const { profile } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    phone: '',
    email: '',
    address: '',
    status: 'active',
    unpaid_balance: '0'
  });

  const fetchCustomers = async () => {
    setLoading(true);
    let query = supabaseClient.from('customers').select('*').order('created_at', { ascending: false });
    
    if (profile?.role === 'agent') {
      query = query.eq('agent_id', profile.id);
    }

    const { data, error } = await query;
    if (error) {
      Sonner.toast.error('Failed to fetch customers');
    } else {
      setCustomers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (profile) fetchCustomers();
  }, [profile]);

  const handleCreateOrUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const payload = {
        ...formData,
        agent_id: profile.id,
        unpaid_balance: parseFloat(formData.unpaid_balance) || 0
      };

      let error;
      if (editingCustomer) {
        const res = await supabaseClient.from('customers').update(payload).eq('id', editingCustomer.id);
        error = res.error;
      } else {
        const res = await supabaseClient.from('customers').insert([payload]);
        error = res.error;
      }

      if (error) {
        Sonner.toast.error(error.message);
      } else {
        Sonner.toast.success(editingCustomer ? 'Customer updated successfully' : 'Customer added successfully');
        setIsDialogOpen(false);
        setEditingCustomer(null);
        fetchCustomers();
        setFormData({
          name: '',
          company_name: '',
          phone: '',
          email: '',
          address: '',
          status: 'active',
          unpaid_balance: '0'
        });
      }
    } catch (err: any) {
      Sonner.toast.error(err.message || 'An unexpected error occurred');
    }
  };

  const handleEditCustomer = (customer: any) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || '',
      company_name: customer.company_name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      status: customer.status || 'active',
      unpaid_balance: customer.unpaid_balance?.toString() || '0'
    });
    setIsDialogOpen(true);
  };

  const exportCustomers = () => {
    const headers = ['Name', 'Company', 'Email', 'Phone', 'Address', 'Status', 'Unpaid Balance'];
    const rows = filteredCustomers.map(c => [c.name, c.company_name, c.email, c.phone, c.address, c.status, c.unpaid_balance]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "customers_report.csv");
    document.body.appendChild(link);
    link.click();
  };

  const filteredCustomers = customers.filter(cust => 
    cust.name.toLowerCase().includes(search.toLowerCase()) ||
    cust.company_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search customers..." 
            className="pl-10" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportCustomers} className="hidden md:flex">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingCustomer(null); }}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" /> Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
                <DialogDescription>
                  {editingCustomer ? 'Update customer details and balance' : 'Store details for a customer who has purchased'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateOrUpdateCustomer} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Customer Name *</Label>
                  <Input 
                    id="name" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input 
                    id="company" 
                    value={formData.company_name}
                    onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Physical Address</Label>
                  <Input 
                    id="address" 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unpaid_balance">Unpaid Balance (KES)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      id="unpaid_balance" 
                      type="number"
                      className="pl-9"
                      value={formData.unpaid_balance}
                      onChange={(e) => setFormData({...formData, unpaid_balance: e.target.value})}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">{editingCustomer ? 'Update Customer' : 'Add Customer'}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-2 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Customer</TableHead>
                <TableHead className="font-semibold">Company</TableHead>
                <TableHead className="font-semibold">Contact Info</TableHead>
                <TableHead className="font-semibold">Unpaid Balance</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">Loading customers...</TableCell>
                </TableRow>
              ) : filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground italic">No customers found.</TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((cust) => (
                  <TableRow key={cust.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">{cust.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3 text-muted-foreground" />
                        {cust.company_name || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                        {cust.email && <div className="flex items-center gap-1"><Mail className="h-3 w-3" /> {cust.email}</div>}
                        {cust.phone && <div className="flex items-center gap-1"><Phone className="h-3 w-3" /> {cust.phone}</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`font-semibold ${cust.unpaid_balance > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                        KES {Number(cust.unpaid_balance || 0).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cust.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                        {cust.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEditCustomer(cust)}>
                        <Edit className="h-4 w-4" />
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

export default Customers;