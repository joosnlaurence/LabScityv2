"use client";

import { Paper, Avatar, Text, Group, Skeleton } from "@mantine/core";
import { useEffect, useState } from "react";
import { User } from "@/lib/types/feed";
import { getUser } from "@/lib/actions/data";
import { useAuth } from "@/components/auth/use-auth";
import classes from "./user-profile-widget.module.css";

interface UserProfileWidgetProps {
  user?: User;
}

export function UserProfileWidget({ user: initialUser }: UserProfileWidgetProps) {
  const { user: authUser, loading: authLoading } = useAuth();
  const [user, setUser] = useState<User | null>(initialUser || null);
  const [isLoading, setIsLoading] = useState(!initialUser);

  useEffect(() => {
    if (initialUser) return; // Use provided user if available
    if (!authUser || authLoading) return; // Wait for auth to load

    const fetchUser = async () => {
      try {
        const result = await getUser(authUser.id);
        if (result.success && result.data) {
          setUser(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [authUser, authLoading, initialUser]);

  if (isLoading || !user) {
    return (
      <Paper
        bg="gray.0"
        p="md"
        radius="lg"
        className={classes.card}
      >
        <Group gap="sm" align="center">
          <Skeleton height={41} width={41} radius="xl" />
          <Skeleton height={20} width={120} />
        </Group>
      </Paper>
    );
  }

  return (
    <Paper
      bg="gray.0"
      p="md"
      radius="lg"
      className={classes.card}
    >
      <Group gap="sm" align="center">
        <Avatar
          size={41}
          radius="xl"
          color="navy.7"
          src={user.avatar_url || undefined}
        >
          {user.first_name?.[0]}
          {user.last_name?.[0]}
        </Avatar>
        <Text
          c="navy.7"
          fw={600}
          className={classes.userName}
        >
          {user.first_name} {user.last_name}
        </Text>
      </Group>
    </Paper>
  );
}
