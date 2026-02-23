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

export async function getOldMessages(conversation_id: number, supabaseClient?: SupabaseClient): Promise<Message[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.from('messages').select('*').eq('conversation_id', conversation_id).order('created_at', { ascending: true }).overrideTypes<Message[]>()

  return data as Message[];

}

export interface ChatPreview {

  conversation_id: number,
  name?: string
  isGroup?: boolean,
  message: Message
}
export async function getChatsWithPreview(): Promise<ChatPreview[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.from('chat_sidebar').select('*').order('last_message_at', { ascending: false });

  if (error) console.log(error);

  return data as ChatPreview[]
}
