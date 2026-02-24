"use server";

import { createClient } from "@/supabase/server";
import type {
  ChatPreview,
  Conversation,
  createChatResponse,
  Message,
} from "../types/chat";
import type { DataResponse } from "../types/data";

export type {
  ChatPreview,
  Conversation,
  createChatResponse,
  Message,
} from "../types/chat";

/**
 * Creates a new conversation (chat) with the current user and specified invitees.
 * The authenticated user is automatically added as a participant.
 *
 * @param invitees - Array of user IDs to invite to the conversation
 * @returns Promise resolving to DataResponse containing the new conversation_id, or an error
 *
 * @example
 * ```typescript
 * const result = await createChat(["user-id-1", "user-id-2"]);
 * if (result.success) {
 *   const conversationId = result.data.conversation_id;
 * }
 * ```
 */
export async function createChat(
  invitees: string[],
): Promise<DataResponse<createChatResponse>> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return { success: false, error: "Auth req" };
  }

  const allParticipants = Array.from(new Set([...invitees, authData.user.id]));

  const { data: conversation_id, error } = await supabase.rpc(
    "create_conversation",
    {
      participant_ids: allParticipants,
    },
  );

  if (error) {
    console.log("Erroring in createChat: ", error);
    return { success: false };
  }

  console.log("created chat: ", conversation_id);

  return { success: true, data: { conversation_id: conversation_id } };
}

/**
 * Retrieves older messages from a conversation for pagination.
 * Returns up to 50 messages older than the provided cursor timestamp.
 * Results are returned in chronological order (oldest first).
 *
 * @param conversation_id - The ID of the conversation to fetch messages from
 * @param cursor - Optional timestamp of the oldest message currently loaded (for pagination)
 * @returns Promise resolving to DataResponse containing an array of Message objects, or an error
 *
 * @example
 * ```typescript
 * // Initial load (most recent 50 messages)
 * const result = await getOldMessages(123);
 *
 * // Load older messages (pagination)
 * const olderResult = await getOldMessages(123, "2024-01-15T10:30:00Z");
 * ```
 */
export async function getOldMessages(
  conversation_id: number,
  cursor?: string,
): Promise<DataResponse<Message[]>> {
  const supabase = await createClient();

  let query = supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversation_id)
    .order("created_at", { ascending: false }) // GET NEWEST FIRST
    .limit(50);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data, error } = await query.overrideTypes<Message[]>();

  if (error) {
    console.error("Error in getOldMessages:", error);
    return { success: false };
  }

  const chronologicalData = (data as Message[]).reverse();

  return { success: true, data: chronologicalData };
}

/**
 * Retrieves all conversations the current user participates in,
 * each with a preview of the most recent message.
 * Results are sorted by last_message_at in descending order (newest first).
 *
 * @returns Promise resolving to DataResponse containing an array of ChatPreview objects
 *
 * @example
 * ```typescript
 * const result = await getChatsWithPreview();
 * if (result.success) {
 *   result.data.forEach(chat => {
 *     console.log(chat.name, chat.message.content);
 *   });
 * }
 * ```
 */
export async function getChatsWithPreview(): Promise<
  DataResponse<ChatPreview[]>
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("chat_sidebar")
    .select("*")
    .order("last_message_at", { ascending: false });

  if (error) console.log(error);

  return { success: true, data: data as ChatPreview[] };
}

/**
 * Removes the current user from a conversation.
 * The user will no longer receive messages or see the conversation.
 *
 * @param conversation_id - The ID of the conversation to leave
 * @returns Promise resolving to DataResponse indicating success or failure
 *
 * @example
 * ```typescript
 * const result = await leaveConversation(123);
 * if (result.success) {
 *   console.log("Successfully left the conversation");
 * }
 * ```
 */
export async function leaveConversation(
  conversation_id: number,
): Promise<DataResponse<null>> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return { success: false };
  }

  const { error } = await supabase
    .from("conversation_participants")
    .delete()
    .eq("conversation_id", conversation_id)
    .eq("user_id", authData.user.id);

  if (error) {
    console.log("Error in leaveConvo: ", error);
    return { success: false };
  }
  return { success: true };
}

/**
 * Adds new users to an existing conversation.
 * The current user must be a participant in the conversation to add others.
 * If the conversation was a direct message, it will be upgraded to a group chat.
 *
 * @param conversation_id - The ID of the conversation to add users to
 * @param new_user_ids - Array of user IDs to add to the conversation
 * @returns Promise resolving to DataResponse indicating success or failure
 *
 * @example
 * ```typescript
 * const result = await addUsersToChat(123, ["user-id-1", "user-id-2"]);
 * if (result.success) {
 *   console.log("Users added successfully");
 * }
 * ```
 */
export async function addUsersToChat(
  conversation_id: number,
  new_user_ids: string[],
): Promise<DataResponse<null>> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return { success: false, error: "Auth required" };
  }

  // Double-check the current user is actually in this chat
  // (Prevents malicious users from adding people to chats they don't belong to)
  const { data: isParticipant, error: participantError } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("conversation_id", conversation_id)
    .eq("user_id", authData.user.id)
    .single();

  if (participantError || !isParticipant) {
    console.error("User not authorized to add members to this chat");
    return { success: false, error: "Not authorized" };
  }

  // Prepare the data payload for the database
  const participantsToAdd = new_user_ids.map((id) => ({
    conversation_id: conversation_id,
    user_id: id,
  }));

  const { error: insertError } = await supabase
    .from("conversation_participants")
    .insert(participantsToAdd);

  if (insertError) {
    console.error("Error adding users to chat: ", insertError.message);
    // If it's a unique constraint error (user is already in the chat), it will safely fail here
    return { success: false, error: insertError.message };
  }

  // Upgrade the chat to a group chat (if it isn't already)
  const { error: updateError } = await supabase
    .from("conversations")
    .update({ is_group: true })
    .eq("id", conversation_id);

  if (updateError) {
    console.error(
      "Error updating conversation to group status: ",
      updateError.message,
    );
  }

  return { success: true, data: null };
}

/**
 * Updates the name of an existing conversation.
 *
 * @param conversation_id - The ID of the conversation to rename
 * @param newName - The new name for the conversation
 * @returns Promise resolving to DataResponse containing the updated Conversation, or an error
 *
 * @example
 * ```typescript
 * const result = await updateConversationName(123, "Project Team");
 * if (result.success) {
 *   console.log("Conversation renamed to:", result.data.name);
 * }
 * ```
 */
export async function updateConversationName(
  conversation_id: number,
  newName: string,
): Promise<DataResponse<Conversation>> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return { success: false };
  }

  const { data: updatedConversation, error } = await supabase
    .from("conversations")
    .update({ name: newName })
    .eq("id", conversation_id)
    .select()
    .single();

  if (error) {
    console.error("error in updateConversationName: ", error);
    return { success: false };
  }

  if (!updatedConversation) {
    console.error("conversation not returned from updateConversationName");
    return { success: false };
  }

  return { success: true, data: updatedConversation as Conversation };
}

/**
 * Edits the content of an existing message.
 * Only the sender of the message can edit it.
 *
 * @param message_id - The ID of the message to edit
 * @param newContent - The new content for the message
 * @returns Promise resolving to DataResponse containing the edited Message, or an error
 *
 * @example
 * ```typescript
 * const result = await editMessage(456, "Updated message content");
 * if (result.success) {
 *   console.log("Message edited:", result.data.content);
 * }
 * ```
 */
export async function editMessage(
  message_id: number,
  newContent: string,
): Promise<DataResponse<Message>> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return { success: false };
  }

  const { data: editedMessage, error } = await supabase
    .from("messages")
    .update({ content: newContent })
    .eq("id", message_id)
    .select()
    .single();

  if (error) {
    console.log("error in editMessage: ", error);
    return { success: false };
  }

  if (!editedMessage) {
    console.log("message not returned from editedMessage");
    return { success: false };
  }

  return { success: true, data: editedMessage as Message };
}
