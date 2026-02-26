/**
 * Represents a message in a conversation.
 * @interface Message
 */
export interface Message {
  /** Unique identifier for the message */
  id: number;
  /** ID of the conversation this message belongs to */
  conversation_id: number;
  /** ID of the user who sent the message */
  sender_id: string;
  /** Content of the message */
  content: string;
  /** ISO timestamp when the message was created */
  created_at: string;
  /** Optional sender user details (populated when joining tables) */
  sender?: {
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    profile_pic_url: string | null;
  };
}

/**
 * Represents a conversation in the system.
 * @interface Conversation
 */
export interface Conversation {
  /** Unique identifier for the conversation */
  id: number;
  /** ISO timestamp when the conversation was created */
  created_at: string;
  /** Custom name of the conversation (null for direct messages between two users) */
  name: string | null;
  /** Whether this is a group conversation (true) or direct message (false) */
  is_group: boolean;
}

/**
 * Represents a participant in a conversation.
 * @interface ConversationParticipant
 */
export interface ConversationParticipant {
  /** ID of the conversation */
  conversation_id: number;
  /** ID of the user */
  user_id: string;
  /** ISO timestamp when the user joined the conversation */
  joined_at: string;
  /** Optional user details (populated when joining tables) */
  user?: {
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    profile_pic_url: string | null;
  };
}

/**
 * Extended conversation type that includes participant information.
 * Used when fetching a conversation with all its participants.
 * @interface ConversationWithParticipant
 */
export interface ConversationWithParticipant extends Conversation {
  /** Array of all participants in the conversation */
  participants: ConversationParticipant[];
  /** Details of the other user (for direct messages) */
  other_user?: {
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    profile_pic_url: string | null;
  };
}

/**
 * Response type for the createChat function.
 * @interface createChatResponse
 */
export interface createChatResponse {
  /** The ID of the newly created conversation */
  conversation_id: number;
}


/**
 * Represents a chat preview shown in the sidebar.
 * Contains conversation info and the most recent message.
 * @interface ChatPreview
 */
export interface ChatPreview {
  /** Unique identifier for the conversation */
  conversation_id: number;
  /** Optional custom name for the conversation (null for direct messages) */
  name?: string;
  /** Whether this is a group conversation */
  isGroup?: boolean;
  /** The most recent message in the conversation */
  message: Message;
}
