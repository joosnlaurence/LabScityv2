'use client'
import { Button } from '@mantine/core'
import { createClient } from '@/supabase/client'
import { useRouter } from 'next/navigation'

export function NewChatButton({ friendId }: { friendId: string }) {
  const router = useRouter()
  const supabase = createClient()

  const handleCreateChat = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const { data: conversationId, error } = await supabase.rpc('create_conversation', {
      participant_ids: [user.id, friendId]
    })

    if (error) {
      console.error('Error creating chat:', error)
      return
    }

    console.log('created chat: ', conversationId)
    router.push(`/chat/${conversationId}`)
  }

  return (
    <Button onClick={handleCreateChat}>
      Message this user
    </Button>
  )

}
