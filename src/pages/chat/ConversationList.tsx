import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseClient } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, MessageSquare, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const ConversationList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!user) return;
      const { data } = await supabaseClient
        .from('profiles')
        .select('*')
        .neq('id', user.id);
      
      if (data) setProfiles(data);
      setLoading(false);
    };
    fetchProfiles();
  }, [user]);

  const filteredProfiles = profiles.filter(p => 
    p.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-md mx-auto space-y-4 pb-24">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-2xl font-bold">Messages</h2>
        <Button size="icon" variant="ghost" className="rounded-full">
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search teammates..." 
          className="pl-10 h-12 rounded-2xl bg-muted/30 border-none focus-visible:ring-primary"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        {loading ? (
          <p className="text-center py-10 text-muted-foreground">Syncing network...</p>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground">No teammates found.</p>
          </div>
        ) : (
          filteredProfiles.map((p) => (
            <div 
              key={p.id} 
              onClick={() => navigate(`/chat/${p.id}`)}
              className="flex items-center gap-4 p-4 rounded-3xl hover:bg-primary/5 cursor-pointer transition-all active:scale-[0.98]"
            >
              <Avatar className="h-14 w-14 border-2 border-background shadow-sm">
                <AvatarFallback className="bg-primary text-white text-lg font-bold">
                  {p.full_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold truncate">{p.full_name}</h4>
                  <span className="text-[10px] text-muted-foreground">Active</span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-xs text-muted-foreground truncate capitalize">{p.role}</p>
                  <Badge variant="outline" className="text-[8px] h-4 px-1 uppercase font-bold border-primary/20 text-primary">Chat Now</Badge>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;
