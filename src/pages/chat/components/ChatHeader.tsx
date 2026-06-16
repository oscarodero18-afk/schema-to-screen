import React from 'react';
import { Phone, Video, MoreVertical, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Contact } from '../types';

interface ChatHeaderProps {
  selectedContact: Contact;
  onBack: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ selectedContact, onBack }) => {
  return (
    <div className="p-4 border-b border-border flex items-center justify-between bg-card z-10">
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden" 
          onClick={onBack}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-10 w-10">
          <AvatarImage src={selectedContact.avatar_url} />
          <AvatarFallback className="bg-primary text-primary-foreground font-bold">
            {selectedContact.full_name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-bold text-sm">{selectedContact.full_name}</p>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Active Now</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
          <Phone className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
          <Video className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
