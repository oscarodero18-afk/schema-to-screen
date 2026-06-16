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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, MoreHorizontal, Mail, Phone, Download, FileSpreadsheet, FileText, Send, ChevronDown, Edit, Trash2 } from 'lucide-react';
import * as Sonner from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const Leads: React.FC = () => {
  const { profile } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    business_name: '',
    contact_person: '',
    phone: '',
    email: '',
    location: '',
    industry: '',
    product_of_interest: '',
    estimated_budget: '',
    source: '',
    status: 'new',
    notes: ''
  });

  const fetchLeads = async () => {
    setLoading(true);
    let query = supabaseClient.from('leads').select('*').order('created_at', { ascending: false });
    
    if (profile?.role === 'agent') {
      query = query.eq('agent_id', profile.id);
    }

    const { data, error } = await query;
    if (error) {
      Sonner.toast.error('Failed to fetch leads');
    } else {
      setLeads(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (profile) fetchLeads();
  }, [profile]);

  const handleCreateOrUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    if (profile.role === 'agent' && !profile.agent_code) {
      Sonner.toast.error("Valid Agent Code required to add lead. Please contact admin.");
      return;
    }

    try {
      const payload = {
        ...formData,
        agent_id: profile.id,
        estimated_budget: parseFloat(formData.estimated_budget) || 0
      };

      let error;
      if (editingLead) {
        const res = await supabaseClient.from('leads').update(payload).eq('id', editingLead.id);
        error = res.error;
      } else {
        const res = await supabaseClient.from('leads').insert([payload]);
        error = res.error;
      }

      if (error) {
        Sonner.toast.error(error.message);
      } else {
        Sonner.toast.success(editingLead ? 'Lead updated successfully' : 'Lead created successfully');
        setIsDialogOpen(false);
        setEditingLead(null);
        fetchLeads();
        setFormData({
          name: '',
          business_name: '',
          contact_person: '',
          phone: '',
          email: '',
          location: '',
          industry: '',
          product_of_interest: '',
          estimated_budget: '',
          source: '',
          status: 'new',
          notes: ''
        });
      }
    } catch (err: any) {
      Sonner.toast.error(err.message || 'An unexpected error occurred');
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      const { error } = await supabaseClient.from('leads').delete().eq('id', id);
      if (error) {
        Sonner.toast.error(error.message);
      } else {
        Sonner.toast.success('Lead deleted successfully');
        fetchLeads();
      }
    } catch (err: any) {
      Sonner.toast.error(err.message || 'An unexpected error occurred');
    }
  };

  const handleEditLead = (lead: any) => {
    setEditingLead(lead);
    setFormData({
      name: lead.name || '',
      business_name: lead.business_name || '',
      contact_person: lead.contact_person || '',
      phone: lead.phone || '',
      email: lead.email || '',
      location: lead.location || '',
      industry: lead.industry || '',
      product_of_interest: lead.product_of_interest || '',
      estimated_budget: lead.estimated_budget?.toString() || '',
      source: lead.source || '',
      status: lead.status || 'new',
      notes: lead.notes || ''
    });
    setIsDialogOpen(true);
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Business', 'Email', 'Phone', 'Status', 'Created At'];
    const rows = filteredLeads.map(l => [l.name, l.business_name, l.email, l.phone, l.status, l.created_at]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join('\x0A');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "leads_report.csv");
    document.body.appendChild(link);
    link.click();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Prospect Leads Report', 14, 15);
    const tableData = filteredLeads.map(l => [
      l.name, 
      l.business_name || '', 
      l.email || '', 
      l.phone || '', 
      l.status
    ]);
    autoTable(doc, {
      head: [['Name', 'Business', 'Email', 'Phone', 'Status']],
      body: tableData,
      startY: 20,
    });
    doc.save('leads_report.pdf');
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredLeads.map(l => ({
      Name: l.name,
      Business: l.business_name,
      Email: l.email,
      Phone: l.phone,
      Status: l.status,
      'Created At': l.created_at
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    XLSX.writeFile(wb, "leads_report.xlsx");
  };

  const sendToAdmin = async () => {
    if (!profile) return;
    try {
      const headers = ['Name', 'Business', 'Email', 'Phone', 'Status', 'Created At'];
      const rows = filteredLeads.map(l => [l.name, l.business_name, l.email, l.phone, l.status, l.created_at]);
      const content = [headers, ...rows].map(e => e.join(",")).join('\n');
      
      const fileName = `report_leads_${profile.id}_${Date.now()}.csv`;
      const { error: uploadError } = await supabaseClient.storage
        .from('reports')
        .upload(fileName, content);
      
      if (uploadError) throw uploadError;

      const { error: dbError } = await supabaseClient
        .from('reports' as any)
        .insert({
          agent_id: profile.id,
          report_type: 'csv',
          file_url: fileName
        });
      
      if (dbError) throw dbError;

      Sonner.toast.success('Report sent to admin successfully');
    } catch (err: any) {
      Sonner.toast.error(err.message || 'Failed to send report');
    }
  };

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(search.toLowerCase()) ||
    lead.business_name?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      new: 'bg-blue-100 text-blue-700 border-blue-200',
      contacted: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      follow_up: 'bg-purple-100 text-purple-700 border-purple-200',
      won: 'bg-green-100 text-green-700 border-green-200',
      lost: 'bg-red-100 text-red-700 border-red-200',
    };
    return (
      <Badge variant="outline" className={variants[status] || 'bg-gray-100 text-gray-700'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search leads..." 
            className="pl-10" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="hidden md:flex">
                <Download className="mr-2 h-4 w-4" /> Export Report <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportToCSV}><FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" /> CSV Format</DropdownMenuItem>
              <DropdownMenuItem onClick={exportToExcel}><FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" /> Excel Format</DropdownMenuItem>
              <DropdownMenuItem onClick={exportToPDF}><FileText className="mr-2 h-4 w-4 text-red-600" /> PDF Format</DropdownMenuItem>
              <DropdownMenuItem onClick={sendToAdmin} className="border-t mt-1 font-bold text-primary"><Send className="mr-2 h-4 w-4" /> Send to Admin</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditingLead(null); }}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" /> Add Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingLead ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
                <DialogDescription>
                  {editingLead ? 'Update details for this potential customer' : 'Capture details for a potential customer'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateOrUpdateLead} className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Lead Name *</Label>
                    <Input 
                      id="name" 
                      required 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business">Business Name</Label>
                    <Input 
                      id="business" 
                      value={formData.business_name}
                      onChange={(e) => setFormData({...formData, business_name: e.target.value})}
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
                    <Label htmlFor="location">Location</Label>
                    <Input 
                      id="location" 
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input 
                      id="industry" 
                      value={formData.industry}
                      onChange={(e) => setFormData({...formData, industry: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product">Product of Interest</Label>
                    <Input 
                      id="product" 
                      value={formData.product_of_interest}
                      onChange={(e) => setFormData({...formData, product_of_interest: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget">Estimated Budget (KES)</Label>
                    <Input 
                      id="budget" 
                      type="number" 
                      value={formData.estimated_budget}
                      onChange={(e) => setFormData({...formData, estimated_budget: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="follow_up">Follow Up</SelectItem>
                        <SelectItem value="meeting_scheduled">Meeting Scheduled</SelectItem>
                        <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
                        <SelectItem value="negotiation">Negotiation</SelectItem>
                        <SelectItem value="won">Won</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input 
                    id="notes" 
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={profile?.role === 'agent' && !profile?.agent_code}
                >
                  {editingLead ? 'Update Lead' : 'Create Lead'}
                </Button>
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
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Business</TableHead>
                <TableHead className="font-semibold">Contact</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">Loading leads...</TableCell>
                </TableRow>
              ) : filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground italic">No leads found.</TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => (
                  <TableRow key={lead.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>{lead.business_name || '-'}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                        {lead.email && <div className="flex items-center gap-1"><Mail className="h-3 w-3" /> {lead.email}</div>}
                        {lead.phone && <div className="flex items-center gap-1"><Phone className="h-3 w-3" /> {lead.phone}</div>}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(lead.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEditLead(lead)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteLead(lead.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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

export default Leads;