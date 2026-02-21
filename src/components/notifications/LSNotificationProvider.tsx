'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/supabase/client'; // Your Supabase client setup

export default function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    // We declare the channel variable outside so we can clean it up later
    let channel: ReturnType<typeof supabase.channel>;

    const initializeNotifications = async () => {
      // 1. We completely pause execution until we guarantee we have the user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return;
      }


      // Fetch existing unread notifications (your previous code)
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (data) setNotifications(data);

      channel = supabase
        .channel(`notifications_${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log(payload)
            setNotifications((prev) => [payload.new, ...prev]);
          }
        )
        .subscribe((status) => {
        });
    };

    initializeNotifications();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [supabase]);

  return (
    <>
      {/* You could render a <NotificationToast /> component here */}
      {children}
    </>
  );
}
