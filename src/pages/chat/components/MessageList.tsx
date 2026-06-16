import React from 'react';
import { MapPin, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Message } from '../types';

interface MessageListProps {
  messages: Message[];
  currentUserId?: string;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId, messagesEndRef }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5">
      {messages.map((msg) => {
        const isMine = msg.sender_id === currentUserId;
        return (
          <div 
            key={msg.id} 
            className={cn(
              "flex w-full",
              isMine ? "justify-end" : "justify-start"
            )}
          >
            <div className={cn(
              "max-w-[80%] rounded-2xl p-3 shadow-sm",
              isMine 
                ? "bg-primary text-primary-foreground rounded-tr-none" 
                : "bg-background border border-border rounded-tl-none"
            )}>
              {msg.type === 'text' && (
                <p className="text-sm leading-relaxed">{msg.content}</p>
              )}
              {msg.type === 'image' && (
                <div className="rounded-lg overflow-hidden border border-white/20">
                  <img src={msg.content} alt="attachment" className="max-w-full h-auto max-h-64 object-cover" />
                </div>
              )}
              {msg.type === 'location' && (
                <a 
                  href={msg.content} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex flex-col gap-2 group"
                >
                  <div className="h-32 bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
                    <MapPin className="h-8 w-8 text-primary animate-bounce" />
                    <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors" />
                  </div>
                  <span className="text-[10px] font-bold underline flex items-center gap-1">
                    View Shared Location
                  </span>
                </a>
              )}
              <div className={cn(
                "text-[8px] mt-1.5 opacity-50 flex items-center gap-1",
                isMine ? "justify-end" : "justify-start"
              )}>
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {isMine && (
                  <CheckCircle2 className={cn("h-3 w-3", msg.is_read ? "text-accent" : "text-white/40")} />
                )}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
