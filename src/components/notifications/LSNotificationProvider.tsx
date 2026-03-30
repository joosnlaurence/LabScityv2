"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { chatKeys } from "@/lib/query-keys";
import type { ChatPreview } from "@/lib/types/chat";
import {
  type Notification,
  useNotificationStore,
} from "@/store/notificationStore";
import { createClient } from "@/supabase/client";

export default function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setNotifications, addNotification } = useNotificationStore();
  const [supabase] = useState(() => createClient());
  const queryClient = useQueryClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    const initializeNotifications = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("is_read", false)
        .order("created_at", { ascending: false });

      if (data) setNotifications(data);

      channelRef.current = supabase
        .channel(`notifications_${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const notification = payload.new as Notification;
            addNotification(notification);

            // Update chat sidebar when new message notification arrives
            if (notification.type === "new_message" && notification.link) {
              // Extract conversation ID from link (format: "/chat/123")
              const conversationId = notification.link.split("/").pop();

              if (conversationId) {
                queryClient.setQueryData<{ data: ChatPreview[] } | undefined>(
                  chatKeys.chatsWithPreview(),
                  (old) => {
                    if (!old?.data) return old;

                    return {
                      ...old,
                      data: old.data.map((chat) => {
                        if (chat.conversation_id + "" === conversationId) {
                          return {
                            ...chat,
                            last_message: notification.content || "",
                            last_message_at: notification.created_at,
                            unread_count: (chat.unread_count || 0) + 1,
                          };
                        }
                        return chat;
                      }),
                    };
                  },
                );
              }
            }
          },
        )
        .subscribe();
    };

    initializeNotifications();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [supabase, setNotifications, addNotification, queryClient]);

  return <>{children}</>;
}
