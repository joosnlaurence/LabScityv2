'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/supabase/client'
import { SupabaseClient } from '@supabase/supabase-js'

// 1. Define the shape of a Message based on your database schema
export interface Message {
  id: number
  conversation_id: number
  sender_id: string
  content: string
  created_at: string
}

export async function getOldMessages(conversation_id: number, supabaseClient?: SupabaseClient): Promise<Message[]> {
  const supabase = supabaseClient || createClient()
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

  const supabase = createClient()

  const { data, error } = await supabase.from('chat_sidebar').select('*').order('last_message_at', { ascending: false });

  if (error) console.log(error);
  console.log("Chats", data)

  return data as ChatPreview[]
}
