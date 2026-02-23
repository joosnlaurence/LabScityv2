'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/supabase/client';

export default function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const supabase = createClient();

  // NOTE: You must make sure the user has been identified first.
  // WARN: This should be being passed down by a parent component probably
  useEffect(() => {

    let channel: ReturnType<typeof supabase.channel>;

    const initializeNotifications = async () => {

      // NOTE: this is an async function and because we need to have user be defined we must make it wait
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return;
      }


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
