export interface Message {
  id: number;
  conversation_id: number;
  sender_id: string;
  content: string;
  created_at: string;
  sender?: {
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    profile_pic_url: string | null;
  };
}

export interface Conversation {
  id: number;
  created_at: string;
  name: string | null;
  is_group: boolean;
}

export interface ConversationParticipant {
  conversation_id: number;
  user_id: string;
  joined_at: string;
  user?: {
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    profile_pic_url: string | null;
  };
}

export interface ConversationWithParticipant extends Conversation {
  participants: ConversationParticipant[];
  other_user?: {
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    profile_pic_url: string | null;
  };
}
