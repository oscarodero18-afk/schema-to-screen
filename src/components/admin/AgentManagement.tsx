import React, { useState, useEffect } from 'react';
import { supabaseClient } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { 
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
  Search, 
  MoreHorizontal, 
  ShieldAlert, 
  ShieldCheck, 
  UserPlus,
  RefreshCw,
  MapPin,
  Target,
  Edit,
  MessageSquare,
  FileDown,
  Send
  Send
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AgentForm from './AgentForm';
import * as Sonner from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Agent {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  agent_code: string;
  national_id: string;
  position: string;
  territory: string;
  target_sales_count: number;
  target_amount_ksh: number;
}

const AgentManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsAgentDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsAgentDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('role', 'agent')
        .order('full_name');

      if (error) throw error;
      setAgents(data || []);
    } catch (error: any) {
      Sonner.toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const { error } = await supabaseClient
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      Sonner.toast.success(`Agent ${newStatus === 'active' ? 'activated' : 'suspended'}`);
      fetchAgents();
    } catch (error: any) {
      Sonner.toast.error(error.message);
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      Sonner.toast.success('Password reset email sent to the agent');
    } catch (error: any) {
      Sonner.toast.error(error.message);
    }
  };

  const exportAgentReport = (agent: Agent) => {
    const reportData = [
      ['Field', 'Value'],
      ['Agent Name', agent.full_name],
      ['Agent Code', agent.agent_code],
      ['Email', agent.email],
      ['Phone', agent.phone],
      ['Position', agent.position],
      ['Territory', agent.territory],
      ['Target Sales', String(agent.target_sales_count)],
      ['Target Amount', `KSH ${agent.target_amount_ksh}`],
      ['Status', agent.status],
    ];

    const csvContent = reportData.map(e => e.join(',')).join(String.fromCharCode(10));
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `report_${agent.agent_code || agent.full_name}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    Sonner.toast.success('Report exported successfully');
  };

  const forwardReport = (agent: Agent) => {
    const subject = encodeURIComponent(`Performance Report: ${agent.full_name}`);
    const body = encodeURIComponent(
      `Hello,

Here is the performance report for Agent ${agent.full_name} (${agent.agent_code}):

` +
      `Territory: ${agent.territory}
` +
      `Targets: ${agent.target_sales_count} sales / KSH ${agent.target_amount_ksh}
` +
      `Status: ${agent.status}

` +
      `Best regards,
Admin Team`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const filteredAgents = agents.filter(agent => 
    agent.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.agent_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search agents..."
            className="pl-10 h-11 rounded-xl bg-card border-border"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="rounded-xl h-11 px-6 font-bold shadow-lg shadow-primary/10">
          <UserPlus className="mr-2 h-4 w-4" /> Invite New Agent
        </Button>
      </div>

      <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border">
              <TableHead className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">Agent Identity</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">Performance Targets</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">Account Status</TableHead>
              <TableHead className="text-right font-black uppercase text-[10px] tracking-widest text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-40 text-center">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary/40" />
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Synchronizing Workforce...</span>
                </TableCell>
              </TableRow>
            ) : filteredAgents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-40 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Search className="h-8 w-8 opacity-20" />
                    <p className="font-bold uppercase tracking-widest text-xs">No active agents found matching criteria.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredAgents.map((agent) => (
                <TableRow key={agent.id} className="hover:bg-muted/20 transition-colors border-b border-border/50">
                  <TableCell>
                    <div className="flex flex-col py-1">
                      <span className="font-black text-foreground tracking-tight">{agent.full_name}</span>
                      <span className="text-xs text-muted-foreground">{agent.email}</span>
                      <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-md bg-primary/5 text-primary text-[9px] font-black tracking-widest uppercase">
                        CODE: {agent.agent_code || 'PENDING'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 text-accent" /> {agent.territory || 'Unassigned Territory'}
                      </div>
                      <div className="flex items-center gap-2 font-bold text-foreground">
                        <Target className="h-3.5 w-3.5 text-primary" /> {agent.target_sales_count} Sales / KES {agent.target_amount_ksh?.toLocaleString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={agent.status === 'active' ? 'outline' : 'destructive'}
                      className={cn(
                        "rounded-full px-3 py-1 font-black text-[9px] uppercase tracking-widest",
                        agent.status === 'active' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                      )}
                    >
                      {agent.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted rounded-full transition-all"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 rounded-2xl border-border shadow-2xl p-2">
                        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground p-3">Agent Management</DropdownMenuLabel>
                        <DropdownMenuItem className="rounded-xl focus:bg-primary/5 focus:text-primary cursor-pointer p-3" onClick={() => { setEditingAgent(agent); setIsAgentDialogOpen(true); }}>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl focus:bg-primary/5 focus:text-primary cursor-pointer p-3" onClick={() => navigate(`/chat/${agent.id}`)}>
                          <MessageSquare className="mr-3 h-4 w-4" /> <span className="font-bold text-sm">Open Chat</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl focus:bg-primary/5 focus:text-primary cursor-pointer p-3" onClick={() => exportAgentReport(agent)}>
                        <DropdownMenuItem className="rounded-xl focus:bg-primary/5 focus:text-primary cursor-pointer p-3" onClick={() => navigate(`/chat/${agent.id}`)}>
                          <MessageSquare className="mr-3 h-4 w-4" /> <span className="font-bold text-sm">Open Chat</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl focus:bg-primary/5 focus:text-primary cursor-pointer p-3" onClick={() => exportAgentReport(agent)}>
                          <FileDown className="mr-3 h-4 w-4" /> <span className="font-bold text-sm">Download Report</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl focus:bg-primary/5 focus:text-primary cursor-pointer p-3" onClick={() => forwardReport(agent)}>
                          <Send className="mr-3 h-4 w-4" /> <span className="font-bold text-sm">Forward Metrics</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-2 bg-border/50" />
                        <DropdownMenuItem 
                          className={cn(
                            "rounded-xl cursor-pointer p-3 focus:text-white",
                            agent.status === 'active' ? "focus:bg-destructive text-destructive" : "focus:bg-emerald-500 text-emerald-600"
                          )} 
                          onClick={() => handleStatusToggle(agent.id, agent.status)}
                        >
                          {agent.status === 'active' ? <ShieldAlert className="mr-3 h-4 w-4" /> : <ShieldCheck className="mr-3 h-4 w-4" />}
                          <span className="font-bold text-sm">{agent.status === 'active' ? 'Suspend Account' : 'Reactivate Account'}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl focus:bg-orange-500/10 focus:text-orange-600 cursor-pointer p-3" onClick={() => handleResetPassword(agent.email)}>
                          <RefreshCw className="mr-3 h-4 w-4" /> <span className="font-bold text-sm">Reset Credentials</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl rounded-[2rem] border-none shadow-2xl bg-card overflow-hidden p-0">
          <div className="bg-primary p-6 md:p-10 flex flex-col gap-2">
            <h2 className="text-3xl font-black text-white tracking-tighter">Invite Agent</h2>
            <p className="text-primary-foreground/70 font-medium">Add a new professional to the Vertex Tech sales network.</p>
          </div>
          <div className="p-6 md:p-10">
            <AgentForm onSuccess={() => { setIsCreateDialogOpen(false); fetchAgents(); }} onCancel={() => setIsCreateDialogOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsAgentDialogOpen}>
        <DialogContent className="max-w-2xl rounded-[2rem] border-none shadow-2xl bg-card overflow-hidden p-0">
          <div className="bg-accent p-6 md:p-10 flex flex-col gap-2">
            <h2 className="text-3xl font-black text-white tracking-tighter">Edit Agent</h2>
            <p className="text-white/70 font-medium">Update profile details and performance targets for {editingAgent?.full_name}.</p>
          </div>
          <div className="p-6 md:p-10">
            {editingAgent && <AgentForm initialData={editingAgent} onSuccess={() => { setIsAgentDialogOpen(false); fetchAgents(); }} onCancel={() => setIsAgentDialogOpen(false)} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgentManagement;