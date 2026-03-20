"use client";

import { Tabs } from "@mantine/core";
import type { getGroups, searchPublicGroups } from "@/lib/actions/groups";
import { LSDiscoverGroupsPanel } from "./ls-discover-groups-panel";
import { LSGroupLayout } from "./ls-group-layout";
import type { LSGroupLayoutProps } from "./ls-group-layout.types";

export interface LSGroupsPageShellProps extends LSGroupLayoutProps {
  searchPublicGroupsAction: typeof searchPublicGroups;
  getGroupsAction: typeof getGroups;
}

/**
 * Groups route shell: My groups (existing layout) vs Discover (public search).
 */
export function LSGroupsPageShell({
  searchPublicGroupsAction,
  getGroupsAction,
  ...layoutProps
}: LSGroupsPageShellProps) {
  return (
    <Tabs defaultValue="mine">
      <Tabs.List>
        <Tabs.Tab value="mine">My groups</Tabs.Tab>
        <Tabs.Tab value="discover">Discover</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="mine" pt="md">
        <LSGroupLayout {...layoutProps} />
      </Tabs.Panel>

      <Tabs.Panel value="discover" pt="md">
        <LSDiscoverGroupsPanel
          searchPublicGroupsAction={searchPublicGroupsAction}
          joinGroupAction={layoutProps.joinGroupAction}
          getGroupsAction={getGroupsAction}
        />
      </Tabs.Panel>
    </Tabs>
  );
}
