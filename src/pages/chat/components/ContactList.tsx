import React from 'react';
import { User, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Contact } from '../types';

interface ContactListProps {
  contacts: Contact[];
  selectedContact: Contact | null;
  onSelectContact: (contact: Contact) => void;
}

const ContactList: React.FC<ContactListProps> = ({ contacts, selectedContact, onSelectContact }) => {
  return (
    <div className={cn(
      "w-full md:w-80 border-r border-border flex flex-col",
      selectedContact ? "hidden md:flex" : "flex"
    )}>
      <div className="p-4 border-b border-border bg-muted/20">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Internal Network
        </h2>
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-10 bg-background/50" placeholder="Search colleagues..." />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {contacts.map((contact) => (
          <button
            key={contact.id}
            onClick={() => onSelectContact(contact)}
            className={cn(
              "w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors border-b border-border/50 text-left",
              selectedContact?.id === contact.id && "bg-primary/5 border-r-4 border-r-primary"
            )}
          >
            <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
              <AvatarImage src={contact.avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {contact.full_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <p className="font-bold truncate text-sm">{contact.full_name}</p>
                <span className="text-[10px] text-muted-foreground uppercase tracking-tighter">
                  {contact.role}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate opacity-70">
                Click to start conversation
              </p>
            </div>
          </button>
        ))}
        {contacts.length === 0 && (
          <div className="p-10 text-center text-muted-foreground">
            <p className="text-sm">No available contacts found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactList;
