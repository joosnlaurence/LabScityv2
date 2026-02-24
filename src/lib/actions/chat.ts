'use server'

import { createClient } from "@/supabase/server"
import { DataResponse } from "../types/data";
import { SupabaseClient } from "@supabase/supabase-js";

// TODO: replace and all console.log with console.error

interface createChatResponse {
  conversation_id: number
}
export async function createChat(invitees: string[]): Promise<DataResponse<createChatResponse>> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return { success: false, error: "Auth req" }
  }

  const allParticipants = Array.from(new Set([...invitees, authData.user.id]));

  const { data: conversation_id, error } = await supabase.rpc('create_conversation', {
    participant_ids: allParticipants
  })

  if (error) {
    console.log("Erroring in createChat: ", error)
    return { success: false }
  }

  console.log('created chat: ', conversation_id);

  return { success: true, data: { conversation_id: conversation_id } }
}


export interface Message {
  id: number
  conversation_id: number
  sender_id: string
  content: string
  created_at: string
}

export async function getOldMessages(conversation_id: number, supabaseClient?: SupabaseClient): Promise<DataResponse<Message[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase.from('messages').select('*').eq('conversation_id', conversation_id).order('created_at', { ascending: true }).overrideTypes<Message[]>()

  return { success: true, data: data as Message[] };

}

export interface ChatPreview {

  conversation_id: number,
  name?: string
  isGroup?: boolean,
  message: Message
}
export async function getChatsWithPreview(): Promise<DataResponse<ChatPreview[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase.from('chat_sidebar').select('*').order('last_message_at', { ascending: false });

  if (error) console.log(error);

  return { success: true, data: data as ChatPreview[] }

}

interface DidJobResponse {
  didJob: boolean
}

export async function leaveConversation(conversation_id: number): Promise<DataResponse<DidJobResponse>> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return { success: false, data: { didJob: false } }
  }

  const { error } = await supabase.from('conversation_participants').delete().eq('conversation_id', conversation_id).eq('user_id', authData.user.id)

  if (error) {
    console.log("Error in leaveConvo: ", error);
    return { success: false, data: { didJob: false } }
  }
  return { success: true, data: { didJob: true } }
}

export async function addUsersToChat(
  conversation_id: number,
  new_user_ids: string[]
): Promise<DataResponse<null>> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return { success: false, error: "Auth required" };
  }

  // 1. Double-check the current user is actually in this chat
  // (Prevents malicious users from adding people to chats they don't belong to)
  const { data: isParticipant, error: participantError } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('conversation_id', conversation_id)
    .eq('user_id', authData.user.id)
    .single();

  if (participantError || !isParticipant) {
    console.error("User not authorized to add members to this chat");
    return { success: false, error: "Not authorized" };
  }

  // 2. Prepare the data payload for the database
  const participantsToAdd = new_user_ids.map(id => ({
    conversation_id: conversation_id,
    user_id: id
  }));

  // 3. Insert the new participants
  const { error: insertError } = await supabase
    .from('conversation_participants')
    .insert(participantsToAdd);

  if (insertError) {
    console.error("Error adding users to chat: ", insertError.message);
    // If it's a unique constraint error (user is already in the chat), it will safely fail here
    return { success: false, error: insertError.message };
  }

  // 4. Upgrade the chat to a group chat (if it isn't already)
  const { error: updateError } = await supabase
    .from('conversations')
    .update({ is_group: true })
    .eq('id', conversation_id);

  if (updateError) {
    console.error("Error updating conversation to group status: ", updateError.message);
  }

  return { success: true, data: null };
}

export interface Conversation {
  id: number;
  created_at: string;
  name: string | null;
  is_group: boolean;
}

export async function updateConversationName(conversation_id: number, newName: string): Promise<DataResponse<Conversation>> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return { success: false }
  }

  const { data: updatedConversation, error } = await supabase
    .from('conversations')
    .update({ name: newName })
    .eq('id', conversation_id)
    .select()
    .single();

  if (error) {
    console.error('error in updateConversationName: ', error)
    return { success: false }
  }

  if (!updatedConversation) {
    console.error('conversation not returned from updateConversationName')
    return { success: false }
  }

  return { success: true, data: updatedConversation as Conversation }
}

export async function editMessage(message_id: number, newContent: string): Promise<DataResponse<Message>> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return { success: false }
  }

  const { data: editedMessage, error } = await supabase.from('messages').update({ content: newContent }).eq('id', message_id).select().single();

  if (error) {
    console.log('error in editMessage: ', error)
    return { success: false }
  }

  if (!editedMessage) {
    console.log('message not returned from editedMessage')
    return { success: false }
  }

  return { success: true, data: editedMessage as Message }
}

