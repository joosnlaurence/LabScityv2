"use client";

import { useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { chatKeys } from "@/lib/query-keys";
import type { ChatPreview } from "@/lib/types/chat";
import {
  type Notification,
  NotificationActor,
  useNotificationStore,
} from "@/store/notificationStore";
import { createClient } from "@/supabase/client";

type NotificationRow = Omit<Notification, "actor"> & {
  actor_id: string | null;
};


export default function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setNotifications, addNotification } = useNotificationStore();
  const [supabase] = useState(() => createClient());
  const queryClient = useQueryClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);

  const ACTOR_SELECT = "user_id, first_name, last_name, profile_pic_path";

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    const initializeNotifications = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("notifications")
        .select(`*, actor:actor_id(${ACTOR_SELECT}), subject:subject_id(post_id, text)`)
        .eq("is_read", false)
        .order("created_at", { ascending: false });

      if (data) setNotifications(data as unknown as NotificationRow[]);

      const enrichAndAdd = async(row: NotificationRow) => {
        let actor: NotificationActor | null = null;
        if(row.actor_id) {
          const { data: actorData } = await supabase
            .from('users')
            .select(ACTOR_SELECT)
            .eq("user_id", row.actor_id)
            .single();
          actor = actorData;
        }
        const { actor_id: _actorId, ...rest } = row;
        addNotification({ ...rest, actor });
      }

      if (channelRef.current) {
        await supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

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
            const row = payload.new as NotificationRow;

            if (row.type === "new_message" && row.link) {
              const notification = row as unknown as Notification;
              const conversationId = notification.link?.split("/").pop();
              const isActiveChat =
                pathnameRef.current === `/chat/${conversationId}`;

              if (!isActiveChat) {
                addNotification(notification);
              }

              if (conversationId) {
                queryClient.setQueryData<{ data: ChatPreview[] } | undefined>(
                  chatKeys.chatsWithPreview(),
                  (old) => {
                    if (!old?.data) return old;

                    return {
                      ...old,
                      data: old.data.map((chat) => {
                        if (`${chat.conversation_id}` === conversationId) {
                          return {
                            ...chat,
                            last_message: notification.content || "",
                            last_message_at: notification.created_at,
                            unread_count: isActiveChat
                              ? chat.unread_count
                              : (chat.unread_count || 0) + 1,
                          };
                        }

                        return chat;
                      }),
                    };
                  },
                );
              }
            } else {
              void enrichAndAdd(row);
            }
          },
        )
        .subscribe();
    };

    void initializeNotifications();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [supabase, setNotifications, addNotification, queryClient]);

  return <>{children}</>;
}
