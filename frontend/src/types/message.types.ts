export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at?: string;
}

export interface Conversation {
  id: string;
  listing_id?: string;
  participants: ConversationParticipant[];
  last_message?: Message;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface ConversationParticipant {
  user_id: string;
  display_name: string;
  activity_type?: string;
}

export interface CreateConversationRequest {
  participant_user_id: string;
  listing_id?: string;
  initial_message: string;
}
