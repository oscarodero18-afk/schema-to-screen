import React from 'react';
import { Send, ImageIcon, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (val: string) => void;
  onSend: (e?: React.FormEvent) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onShareLocation: () => void;
  sending: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

const MessageInput: React.FC<MessageInputProps> = ({
  newMessage,
  setNewMessage,
  onSend,
  onFileUpload,
  onShareLocation,
  sending,
  fileInputRef
}) => {
  return (
    <div className="p-4 border-t border-border bg-card">
      <form onSubmit={onSend} className="flex items-center gap-2">
        <div className="flex items-center gap-1 px-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileUpload}
            className="hidden"
            accept="image/*,video/*"
          />
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-primary"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="h-5 w-5" />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-primary"
            onClick={onShareLocation}
          >
            <MapPin className="h-5 w-5" />
          </Button>
        </div>
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary h-11"
          disabled={sending}
        />
        <Button 
          type="submit" 
          size="icon" 
          className="h-11 w-11 rounded-full shadow-lg shadow-primary/20 shrink-0"
          disabled={!newMessage.trim() || sending}
        >
          {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </Button>
      </form>
    </div>
  );
};

export default MessageInput;
