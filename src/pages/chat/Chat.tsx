import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabaseClient } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Send, 
  ChevronLeft, 
  Image as ImageIcon, 
  Video, 
  MapPin, 
  Phone,
  MoreVertical,
  CheckCheck,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import * as Sonner from 'sonner';

const Chat = () => {
  const { id: receiverId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [receiverProfile, setReceiverProfile] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchReceiver = async () => {
      const { data } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', receiverId)
        .single();
      setReceiverProfile(data);
    };

    const fetchMessages = async () => {
      if (!user || !receiverId) return;
      const { data } = await supabaseClient
        .from('messages' as any)
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });
      
      if (data) setMessages(data);
      setLoading(false);
      setTimeout(scrollToBottom, 100);
    };

    if (receiverId) {
      fetchReceiver();
      fetchMessages();
    }

    const channel = supabaseClient
      .channel(`chat:${receiverId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages' 
      }, (payload) => {
        const msg = payload.new;
        if ((msg.sender_id === user?.id && msg.receiver_id === receiverId) || 
            (msg.sender_id === receiverId && msg.receiver_id === user?.id)) {
          setMessages(prev => [...prev, msg]);
        }
      })
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [receiverId, user]);

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !user || !receiverId) return;

    const content = newMessage.trim();
    setNewMessage('');

    try {
      const { error } = await supabaseClient
        .from('messages' as any)
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          content,
          message_type: 'text'
        });
      
      if (error) throw error;
    } catch (err: any) {
      Sonner.toast.error(err.message || 'Failed to send message');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file || !user || !receiverId) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `chat/${user.id}/${fileName}`;

      const { error: uploadError } = await supabaseClient.storage
        .from('chat-attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabaseClient.storage
        .from('chat-attachments')
        .getPublicUrl(filePath);

      const { error: msgError } = await supabaseClient
        .from('messages' as any)
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          content: `Sent a ${type}`,
          message_type: type,
          file_url: publicUrl
        });

      if (msgError) throw msgError;
    } catch (err: any) {
      Sonner.toast.error(err.message || 'File upload failed');
    }
  };

  const shareLocation = () => {
    if (!navigator.geolocation) {
      Sonner.toast.error('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const { error } = await supabaseClient
          .from('messages' as any)
          .insert({
            sender_id: user?.id,
            receiver_id: receiverId,
            content: 'Shared a location',
            message_type: 'location',
            metadata: { latitude, longitude }
          });
        if (error) throw error;
      } catch (err: any) {
        Sonner.toast.error(err.message);
      }
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] md:h-[calc(100vh-40px)] max-w-2xl mx-auto bg-card rounded-3xl shadow-2xl overflow-hidden border">
      <header className="flex items-center justify-between p-4 border-b bg-muted/20">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarFallback className="bg-primary text-white font-bold">
              {receiverProfile?.full_name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-bold text-sm leading-tight">{receiverProfile?.full_name}</h4>
            <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Active Now</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <a href={`tel:${receiverProfile?.phone}`} className="p-2 hover:bg-muted rounded-full transition-colors text-primary">
            <Phone className="h-5 w-5" />
          </a>
          <Button variant="ghost" size="icon" className="rounded-full">
            <MoreVertical className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20 opacity-30">
            <MessageSquare className="h-16 w-16 mx-auto mb-4" />
            <p className="text-sm font-bold uppercase tracking-widest">Start of communication</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                <div className={cn(
                  "max-w-[80%] px-4 py-2.5 rounded-3xl text-sm shadow-sm relative group",
                  isMe ? "bg-primary text-white rounded-tr-none" : "bg-muted text-foreground rounded-tl-none"
                )}>
                  {msg.message_type === 'text' && <p>{msg.content}</p>}
                  {msg.message_type === 'image' && <img src={msg.file_url} className="rounded-2xl max-h-60" />}
                  {msg.message_type === 'video' && <video src={msg.file_url} controls className="rounded-2xl max-h-60" />}
                  {msg.message_type === 'location' && (
                    <a 
                      href={`https://www.google.com/maps?q=${msg.metadata?.latitude},${msg.metadata?.longitude}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-2 font-bold underline"
                    >
                      <MapPin className="h-4 w-4" /> View Location
                    </a>
                  )}
                  
                  <div className={cn(
                    "flex items-center gap-1 mt-1 opacity-50 text-[8px] font-bold uppercase",
                    isMe ? "justify-end" : "justify-start"
                  )}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {isMe && <CheckCheck className="h-3 w-3" />}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-muted/30 border-t">
        <form onSubmit={handleSendMessage} className="flex items-end gap-2">
          <div className="flex-1 bg-card rounded-3xl border border-border p-1.5 flex flex-col gap-1 shadow-sm">
            <div className="flex items-center gap-1 px-1">
               <input type="file" id="img-upload" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} />
               <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => document.getElementById('img-upload')?.click()}>
                 <ImageIcon className="h-4 w-4 text-muted-foreground" />
               </Button>
               <input type="file" id="vid-upload" className="hidden" accept="video/*" onChange={(e) => handleFileUpload(e, 'video')} />
               <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => document.getElementById('vid-upload')?.click()}>
                 <Video className="h-4 w-4 text-muted-foreground" />
               </Button>
               <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={shareLocation}>
                 <MapPin className="h-4 w-4 text-muted-foreground" />
               </Button>
            </div>
            <div className="flex items-center gap-2">
              <Input 
                placeholder="Type encrypted message..." 
                className="flex-1 border-none bg-transparent focus-visible:ring-0 shadow-none h-10"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <Button type="submit" size="icon" className="h-9 w-9 rounded-full bg-primary shrink-0 shadow-lg" disabled={!newMessage.trim()}>
                <Send className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;
