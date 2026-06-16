export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'location' | 'call';
  metadata?: any;
  created_at: string;
  is_read: boolean;
}

export interface Contact {
  id: string;
  full_name: string;
  role: string;
  avatar_url?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count?: number;
}
