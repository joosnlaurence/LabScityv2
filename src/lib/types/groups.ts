/**
 * Type definitions for the groups feature.
 * Based on Supabase tables: groups, group_members.
 */

/** Row from the `groups` table. */
export interface Group {
	group_id: number;
	name: string;
	description: string;
	created_at: string;
	conversation_id: number | null;
}

/** Row from `group_members` joined with `users` for display info. */
export interface GroupMember {
	group_id: number;
	user_id: string;
	role: string;
	created_at: string;
	first_name: string | null;
	last_name: string | null;
	profile_pic_path: string | null;
	avatar_url?: string | null;
}

/** A group with its full member list and count. */
export interface GroupWithMembers extends Group {
	members: GroupMember[];
	memberCount: number;
}

/** Sidebar-friendly group item with just the member count. */
export interface GroupListItem extends Group {
	memberCount: number;
}

/** Shape returned by getGroups server action on success. */
export type GetGroupsResult = GroupListItem[];
