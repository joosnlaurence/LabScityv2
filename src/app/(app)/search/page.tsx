"use client";

import {
  Avatar,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LSSpinner } from "@/components/ui/ls-spinner";
import { searchUserContent } from "@/lib/actions/data";
import type { searchResult } from "@/lib/types/data";

const FULL_RESULTS_LIMIT = 50;

function SearchSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Stack gap="xs">
      <Text size="xs" fw={700} c="gray.5" tt="uppercase">
        {title}
      </Text>
      {children}
    </Stack>
  );
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";

  const [results, setResults] = useState<searchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      setResults([]);
      setSearching(false);
      setError(null);
      return;
    }

    let isCancelled = false;

    setSearching(true);
    setError(null);

    searchUserContent({ query, limit: FULL_RESULTS_LIMIT }).then((response) => {
      if (isCancelled) {
        return;
      }

      if (!response.success) {
        setResults([]);
        setError(response.error ?? "Failed to load search results.");
        setSearching(false);
        return;
      }

      setResults(response.data ?? []);
      setSearching(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [query]);

  const groupedResults = useMemo(
    () => ({
      users: results.filter((result) => result.content_type === "user"),
      posts: results.filter((result) => result.content_type === "post"),
      groups: results.filter((result) => result.content_type === "group"),
    }),
    [results],
  );

  const hasResults = results.length > 0;

  return (
    <Stack maw={900} mx="auto" px="md" py="xl" gap="lg">
      <Stack gap={4}>
        <Text size="xl" fw={700} c="navy.7">
          Search
        </Text>
        <Text c="dimmed">
          {query
            ? `Showing results for "${query}"`
            : "Enter a search from the navbar to see results here."}
        </Text>
      </Stack>

      {searching && (
        <Group justify="center" py="xl">
          <LSSpinner />
        </Group>
      )}

      {!searching && error && (
        <Paper withBorder radius="md" p="lg">
          <Text c="red">{error}</Text>
        </Paper>
      )}

      {!searching && !error && query && !hasResults && (
        <Paper withBorder radius="md" p="lg">
          <Text c="dimmed">No results found.</Text>
        </Paper>
      )}

      {!searching && !error && hasResults && (
        <Paper withBorder radius="lg" p="lg">
          <Stack gap="lg">
            {groupedResults.users.length > 0 && (
              <SearchSection title="Users">
                {groupedResults.users.map((result) => (
                  <UnstyledButton
                    key={`user-${result.id}`}
                    onClick={() => router.push(`/profile/${result.id}`)}
                  >
                    <Group gap="sm" p="sm" style={{ borderRadius: 8 }}>
                      <Avatar radius="xl">{result.names?.[0]}</Avatar>
                      <Stack gap={0}>
                        <Text fw={600} c="navy.7">
                          {result.names}
                        </Text>
                        <Text size="sm" c="dimmed">
                          User
                        </Text>
                      </Stack>
                    </Group>
                  </UnstyledButton>
                ))}
              </SearchSection>
            )}

            {groupedResults.posts.length > 0 && (
              <>
                {groupedResults.users.length > 0 && <Divider />}
                <SearchSection title="Posts">
                  {groupedResults.posts.map((result) => (
                    <UnstyledButton
                      key={`post-${result.id}`}
                      onClick={() => router.push(`/posts/${result.id}`)}
                    >
                      <Paper withBorder radius="md" p="md">
                        <Stack gap={6}>
                          <Text size="sm" fw={600} c="navy.7">
                            Post
                          </Text>
                          <Text c="gray.8" style={{ whiteSpace: "pre-wrap" }}>
                            {result.content}
                          </Text>
                        </Stack>
                      </Paper>
                    </UnstyledButton>
                  ))}
                </SearchSection>
              </>
            )}

            {groupedResults.groups.length > 0 && (
              <>
                {(groupedResults.users.length > 0 ||
                  groupedResults.posts.length > 0) && <Divider />}
                <SearchSection title="Groups">
                  {groupedResults.groups.map((result) => (
                    <Paper
                      key={`group-${result.id}`}
                      withBorder
                      radius="md"
                      p="md"
                    >
                      <Stack gap={6}>
                        <Text fw={600} c="navy.7">
                          {result.names}
                        </Text>
                        {result.content && (
                          <Text c="gray.8" style={{ whiteSpace: "pre-wrap" }}>
                            {result.content}
                          </Text>
                        )}
                      </Stack>
                    </Paper>
                  ))}
                </SearchSection>
              </>
            )}
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
