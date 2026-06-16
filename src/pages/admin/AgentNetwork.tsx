import React from 'react';
import AgentManagement from '@/components/admin/AgentManagement';
import { Users } from 'lucide-react';

const AgentNetwork = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="space-y-1">
        <h2 className="text-3xl font-extrabold tracking-tight text-primary flex items-center gap-2">
          <Users className="h-8 w-8" /> Agent Network
        </h2>
        <p className="text-muted-foreground">View and manage the professional Vertex agent ecosystem.</p>
      </div>
      
      <AgentManagement />
    </div>
  );
};

export default AgentNetwork;
