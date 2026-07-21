"use client";

import { Box, Tabs } from "@mantine/core";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import type { getGroups, searchPublicGroups } from "@/lib/actions/groups";
import { groupsPath } from "@/lib/utils/groups-url";
import { LSDiscoverGroupsPanel } from "./ls-discover-groups-panel";
import { LSGroupLayout } from "./ls-group-layout";
import type { LSGroupLayoutProps } from "./ls-group-layout.types";
import classes from './ls-tabs.module.css';

export interface LSGroupsPageShellProps extends LSGroupLayoutProps {
  searchPublicGroupsAction: typeof searchPublicGroups;
  getGroupsAction: typeof getGroups;
}

/**
 * Groups route shell: My groups (existing layout) vs Discover (public search).
 * Tabs are controlled from the URL so client navigations (e.g. join from Discover)
 * can switch to My groups without remounting the route.
 */
export function LSGroupsPageShell({
  searchPublicGroupsAction,
  getGroupsAction,
  ...layoutProps
}: LSGroupsPageShellProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabValue = useMemo(() => {
    const q = searchParams.get("tab");
    if (q === "discover") return "discover" as const;
    return "mine" as const;
  }, [searchParams]);
  const autoOpenCreateGroup = searchParams.get("action") === "create";

  const setTabInUrl = useCallback(
    (next: "mine" | "discover") => {
      if (next === "discover") {
        router.replace(groupsPath({ tab: "discover" }));
        return;
      }
      const groupRaw = searchParams.get("group");
      const gid =
        groupRaw != null &&
        groupRaw !== "" &&
        Number.isFinite(Number(groupRaw)) &&
        Number(groupRaw) > 0
          ? Number(groupRaw)
          : undefined;
      router.replace(groupsPath({ tab: "mine", groupId: gid }));
    },
    [router, searchParams],
  );

  return (
    <Box mih="calc(100vh - 60px)">
      <Tabs
        value={tabValue}
        onChange={(v) => {
          if (v === "mine" || v === "discover") setTabInUrl(v);
        }}
        color="navy"
        radius="xl"
      >
        <Box 
          w='100%' 
          mx="auto" 
          px={{ base: "md", md: "lg" }} 
          py='md'
          style={{
            borderBottom: '1px solid var(--mantine-color-gray-3)'
          }}
        >
          <Tabs.List
            w='fit-content'
            mx='auto'
            px='md'
            bdrs='md'
            classNames={classes}
          >
            <Tabs.Tab px='xl' fz='md' py='md' value="mine">My Groups</Tabs.Tab>
            <Tabs.Tab px='xl' fz='md' py='md' value="discover">Discover</Tabs.Tab>
          </Tabs.List>
        </Box>

        <Tabs.Panel value="mine">
          <LSGroupLayout
            {...layoutProps}
            autoOpenCreateGroup={autoOpenCreateGroup}
          />
        </Tabs.Panel>

        <Tabs.Panel value="discover">
          <LSDiscoverGroupsPanel
            searchPublicGroupsAction={searchPublicGroupsAction}
            joinGroupAction={layoutProps.joinGroupAction}
            getGroupsAction={getGroupsAction}
          />
        </Tabs.Panel>
      </Tabs>
    </Box>
  );
}
