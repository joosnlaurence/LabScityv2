"use server";

import { z } from "zod";
import type { DataResponse } from "@/lib/types/data";
import type {
  GetGroupsResult,
  GroupListItem,
  GroupWithMembers,
} from "@/lib/types/groups";
import {
  type AddMemberValues,
  addMemberSchema,
  type CreateGroupValues,
  createGroupSchema,
  groupIdSchema,
  type InviteMembersValues,
  inviteMembersSchema,
  type RemoveMemberValues,
  type RespondToInviteValues,
  removeMemberSchema,
  respondToInviteSchema,
  type UpdateGroupValues,
  updateGroupSchema,
} from "@/lib/validations/groups";
import { createClient } from "@/supabase/server";

/**
 * Fetch all groups the authenticated user is a member of, with member counts.
 *
 * @param supabaseClient - Optional Supabase client instance (used for testing)
 * @returns Promise resolving to DataResponse with the user's group list
 */
export async function getGroups(
  supabaseClient?: ReturnType<typeof createClient> extends Promise<infer R>
    ? R
    : never,
): Promise<DataResponse<GetGroupsResult>> {
  try {
    const supabase = supabaseClient ?? (await createClient());
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return { success: false, error: "Authentication required" };
    }

    const { data: memberships, error: membershipError } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", authData.user.id);

    if (membershipError) {
      return { success: false, error: membershipError.message };
    }

    if (!memberships || memberships.length === 0) {
      return { success: true, data: [] };
    }

    const groupIds = memberships.map((m) => m.group_id);

    const { data: groups, error: groupsError } = await supabase
      .from("groups")
      .select(
        "group_id, name, description, created_at, conversation_id, topics, privacy",
      )
      .in("group_id", groupIds)
      .order("name");

    if (groupsError) {
      return { success: false, error: groupsError.message };
    }

    if (!groups || groups.length === 0) {
      return { success: true, data: [] };
    }

    // Fetch member counts per group in a single query
    const { data: memberCounts, error: countError } = await supabase
      .from("group_members")
      .select("group_id")
      .in("group_id", groupIds);

    if (countError) {
      return { success: false, error: countError.message };
    }

    const countMap = (memberCounts ?? []).reduce<Record<number, number>>(
      (acc, row) => {
        acc[row.group_id] = (acc[row.group_id] ?? 0) + 1;
        return acc;
      },
      {},
    );

    const result: GroupListItem[] = groups.map((g) => ({
      group_id: g.group_id,
      name: g.name,
      description: g.description ?? "",
      created_at: g.created_at,
      conversation_id: g.conversation_id,
      topics: Array.isArray(g.topics) ? (g.topics as string[]) : [],
      privacy: g.privacy === "private" ? "private" : "public",
      memberCount: countMap[g.group_id] ?? 0,
    }));

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message ?? "Validation failed",
      };
    }
    return { success: false, error: "Failed to fetch groups" };
  }
}

/**
 * Fetch a single group with its full member list and count.
 *
 * @param groupId - The ID of the group to fetch
 * @param supabaseClient - Optional Supabase client instance (used for testing)
 * @returns Promise resolving to DataResponse with the group and its members
 */
export async function getGroupDetails(
  groupId: number,
  supabaseClient?: ReturnType<typeof createClient> extends Promise<infer R>
    ? R
    : never,
): Promise<DataResponse<GroupWithMembers>> {
  try {
    groupIdSchema.parse(groupId);

    const supabase = supabaseClient ?? (await createClient());
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return { success: false, error: "Authentication required" };
    }

    const { data: group, error: groupError } = await supabase
      .from("groups")
      .select(
        "group_id, name, description, created_at, conversation_id, topics, privacy",
      )
      .eq("group_id", groupId)
      .single();

    if (groupError || !group) {
      return {
        success: false,
        error: groupError?.message ?? "Group not found",
      };
    }

    const { data: members, error: membersError } = await supabase
      .from("group_members")
      .select(
        `
				group_id,
				user_id,
				role,
				created_at,
				users:user_id(first_name, last_name, profile_pic_path)
			`,
      )
      .eq("group_id", groupId)
      .order("created_at");

    if (membersError) {
      return { success: false, error: membersError.message };
    }

    // Supabase join returns users as object (FK) or array depending on client version
    type RawUser = {
      first_name: string | null;
      last_name: string | null;
      profile_pic_path: string | null;
    };
    type RawMember = {
      group_id: number;
      user_id: string;
      role: string | null;
      created_at: string;
      users: RawUser | RawUser[] | null;
    };
    const toUser = (u: RawUser | RawUser[] | null): RawUser | null =>
      Array.isArray(u) ? (u[0] ?? null) : u;
    const formattedMembers = (members ?? []).map((m: RawMember) => {
      const u = toUser(m.users);
      const picPath = u?.profile_pic_path ?? null;
      return {
        group_id: m.group_id,
        user_id: m.user_id,
        role: m.role ?? "Member",
        created_at: m.created_at,
        first_name: u?.first_name ?? null,
        last_name: u?.last_name ?? null,
        profile_pic_path: picPath,
        avatar_url: picPath
          ? supabase.storage.from("profile_pictures").getPublicUrl(picPath).data
              .publicUrl
          : null,
      };
    });

    const result: GroupWithMembers = {
      group_id: group.group_id,
      name: group.name,
      description: group.description ?? "",
      created_at: group.created_at,
      conversation_id: group.conversation_id,
      topics: Array.isArray(group.topics) ? (group.topics as string[]) : [],
      privacy: group.privacy === "private" ? "private" : "public",
      members: formattedMembers,
      memberCount: formattedMembers.length,
    };

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message ?? "Validation failed",
      };
    }
    return { success: false, error: "Failed to fetch group details" };
  }
}

/**
 * Create a new group via the `create_group` RPC. Atomically provisions the
 * group row, its conversation, and the creator's Admin membership.
 *
 * @param values - Object containing name and optional description
 * @param supabaseClient - Optional Supabase client instance (used for testing)
 * @returns Promise resolving to DataResponse with the new group_id
 */
export async function createGroup(
  values: CreateGroupValues,
  supabaseClient?: ReturnType<typeof createClient> extends Promise<infer R>
    ? R
    : never,
): Promise<DataResponse<{ group_id: number }>> {
  try {
    const parsed = createGroupSchema.parse(values);

    const supabase = supabaseClient ?? (await createClient());
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return { success: false, error: "Authentication required" };
    }

    const { data: groupId, error } = await supabase.rpc("create_group", {
      group_name: parsed.name,
      group_description: parsed.description ?? "",
      creator_id: authData.user.id,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (groupId === null || groupId === undefined) {
      return { success: false, error: "Group was not created" };
    }

    const newGroupId = Number(groupId);
    if (!Number.isFinite(newGroupId)) {
      return { success: false, error: "Invalid group id from server" };
    }

    const { error: metaError } = await supabase
      .from("groups")
      .update({
        topics: parsed.topics,
        privacy: parsed.privacy,
      })
      .eq("group_id", newGroupId);

    if (metaError) {
      return { success: false, error: metaError.message };
    }

    return { success: true, data: { group_id: newGroupId } };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message ?? "Validation failed",
      };
    }
    return { success: false, error: "Failed to create group" };
  }
}

/**
 * Join an existing group. Inserts the user into `group_members` and
 * the group's conversation participants.
 *
 * @param groupId - The ID of the group to join
 * @param supabaseClient - Optional Supabase client instance (used for testing)
 * @returns Promise resolving to DataResponse indicating success or failure
 */
export async function joinGroup(
  groupId: number,
  supabaseClient?: ReturnType<typeof createClient> extends Promise<infer R>
    ? R
    : never,
): Promise<DataResponse<null>> {
  try {
    groupIdSchema.parse(groupId);

    const supabase = supabaseClient ?? (await createClient());
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return { success: false, error: "Authentication required" };
    }

    const { error: memberError } = await supabase
      .from("group_members")
      .insert({ group_id: groupId, user_id: authData.user.id, role: "Member" });

    if (memberError) {
      return { success: false, error: memberError.message };
    }

    // Add user to the group's conversation
    const { data: group } = await supabase
      .from("groups")
      .select("conversation_id")
      .eq("group_id", groupId)
      .single();

    if (group?.conversation_id) {
      await supabase.from("conversation_participants").insert({
        conversation_id: group.conversation_id,
        user_id: authData.user.id,
      });
    }

    return { success: true, data: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message ?? "Validation failed",
      };
    }
    return { success: false, error: "Failed to join group" };
  }
}

/**
 * Leave a group. Removes the user from `group_members` and the group's
 * conversation participants. Prevents the last Admin from leaving.
 *
 * @param groupId - The ID of the group to leave
 * @param supabaseClient - Optional Supabase client instance (used for testing)
 * @returns Promise resolving to DataResponse indicating success or failure
 */
export async function leaveGroup(
  groupId: number,
  supabaseClient?: ReturnType<typeof createClient> extends Promise<infer R>
    ? R
    : never,
): Promise<DataResponse<null>> {
  try {
    groupIdSchema.parse(groupId);

    const supabase = supabaseClient ?? (await createClient());
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return { success: false, error: "Authentication required" };
    }

    // Check if user is the last admin
    const { data: membership } = await supabase
      .from("group_members")
      .select("role")
      .eq("group_id", groupId)
      .eq("user_id", authData.user.id)
      .single();

    if (membership?.role === "Admin") {
      const { data: admins } = await supabase
        .from("group_members")
        .select("user_id")
        .eq("group_id", groupId)
        .eq("role", "Admin");

      if (!admins || admins.length <= 1) {
        return {
          success: false,
          error:
            "Cannot leave: you are the only Admin. Transfer admin role first.",
        };
      }
    }

    const { error: leaveError } = await supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", authData.user.id);

    if (leaveError) {
      return { success: false, error: leaveError.message };
    }

    // Remove from group conversation
    const { data: group } = await supabase
      .from("groups")
      .select("conversation_id")
      .eq("group_id", groupId)
      .single();

    if (group?.conversation_id) {
      await supabase
        .from("conversation_participants")
        .delete()
        .eq("conversation_id", group.conversation_id)
        .eq("user_id", authData.user.id);
    }

    return { success: true, data: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message ?? "Validation failed",
      };
    }
    return { success: false, error: "Failed to leave group" };
  }
}

/**
 * Updates group fields (name, description, topics, privacy). Only Admins may call.
 */
export async function updateGroup(
  values: UpdateGroupValues,
): Promise<DataResponse<null>> {
  try {
    const parsed = updateGroupSchema.parse(values);

    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return { success: false, error: "Authentication required" };
    }

    const { data: roleRow, error: roleError } = await supabase
      .from("group_members")
      .select("role")
      .eq("group_id", parsed.groupId)
      .eq("user_id", authData.user.id)
      .maybeSingle();

    if (roleError) {
      return { success: false, error: roleError.message };
    }
    if (roleRow?.role !== "Admin") {
      return {
        success: false,
        error: "Only group admins can edit group details",
      };
    }

    const patch: {
      name?: string;
      description?: string;
      topics?: string[];
      privacy?: "public" | "private";
    } = {};
    if (parsed.name !== undefined) patch.name = parsed.name;
    if (parsed.description !== undefined) {
      patch.description = parsed.description;
    }
    if (parsed.topics !== undefined) patch.topics = parsed.topics;
    if (parsed.privacy !== undefined) patch.privacy = parsed.privacy;

    const { error: updateError } = await supabase
      .from("groups")
      .update(patch)
      .eq("group_id", parsed.groupId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true, data: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message ?? "Validation failed",
      };
    }
    return { success: false, error: "Failed to update group" };
  }
}

/**
 * Creates or refreshes pending invites and notifies each user. Admin-only.
 * Skips existing members and users who already have a pending invite.
 */
export async function inviteUsersToGroup(
  values: InviteMembersValues,
): Promise<DataResponse<{ invitedCount: number }>> {
  try {
    const parsed = inviteMembersSchema.parse(values);

    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return { success: false, error: "Authentication required" };
    }

    const { data: roleRow, error: roleError } = await supabase
      .from("group_members")
      .select("role")
      .eq("group_id", parsed.groupId)
      .eq("user_id", authData.user.id)
      .maybeSingle();

    if (roleError) {
      return { success: false, error: roleError.message };
    }
    if (roleRow?.role !== "Admin") {
      return { success: false, error: "Only group admins can send invites" };
    }

    const { data: groupRow, error: groupError } = await supabase
      .from("groups")
      .select("name")
      .eq("group_id", parsed.groupId)
      .single();

    if (groupError || !groupRow) {
      return {
        success: false,
        error: groupError?.message ?? "Group not found",
      };
    }

    const inviterId = authData.user.id;
    const uniqueIds = [...new Set(parsed.userIds)].filter(
      (id) => id !== inviterId,
    );

    let invitedCount = 0;

    for (const targetUserId of uniqueIds) {
      const { data: existingMember } = await supabase
        .from("group_members")
        .select("user_id")
        .eq("group_id", parsed.groupId)
        .eq("user_id", targetUserId)
        .maybeSingle();

      if (existingMember) {
        continue;
      }

      const { data: priorInvite } = await supabase
        .from("invites")
        .select("status")
        .eq("group_id", parsed.groupId)
        .eq("user_id", targetUserId)
        .maybeSingle();

      if (priorInvite?.status === "pending") {
        continue;
      }

      const { error: upsertError } = await supabase.from("invites").upsert(
        {
          group_id: parsed.groupId,
          user_id: targetUserId,
          status: "pending",
        },
        { onConflict: "group_id,user_id" },
      );

      if (upsertError) {
        return { success: false, error: upsertError.message };
      }

      const { error: notifError } = await supabase
        .from("notifications")
        .insert({
          user_id: targetUserId,
          type: "group_invite",
          title: "Group invitation",
          content: `You've been invited to join "${groupRow.name}"`,
          link: `/groups?group=${parsed.groupId}`,
        });

      if (notifError) {
        return { success: false, error: notifError.message };
      }

      invitedCount += 1;
    }

    return { success: true, data: { invitedCount } };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message ?? "Validation failed",
      };
    }
    return { success: false, error: "Failed to send invites" };
  }
}

/**
 * Accept or decline a pending group invite. Accept joins via `joinGroup` (same
 * self-join path as open groups); `add_group_member` is admin-only and cannot
 * be called by the invitee.
 */
export async function respondToGroupInvite(
  values: RespondToInviteValues,
): Promise<DataResponse<null>> {
  try {
    const parsed = respondToInviteSchema.parse(values);

    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return { success: false, error: "Authentication required" };
    }

    const userId = authData.user.id;

    const { data: invite, error: inviteError } = await supabase
      .from("invites")
      .select("status")
      .eq("group_id", parsed.groupId)
      .eq("user_id", userId)
      .maybeSingle();

    if (inviteError) {
      return { success: false, error: inviteError.message };
    }

    if (!invite || invite.status !== "pending") {
      return {
        success: false,
        error: "No pending invitation for this group",
      };
    }

    if (parsed.response === "declined") {
      const { error } = await supabase
        .from("invites")
        .update({ status: "declined" })
        .eq("group_id", parsed.groupId)
        .eq("user_id", userId);

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, data: null };
    }

    const { data: existingMember } = await supabase
      .from("group_members")
      .select("user_id")
      .eq("group_id", parsed.groupId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existingMember) {
      const { error } = await supabase
        .from("invites")
        .update({ status: "accepted" })
        .eq("group_id", parsed.groupId)
        .eq("user_id", userId);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, data: null };
    }

    const joinResult = await joinGroup(parsed.groupId, supabase);
    if (!joinResult.success) {
      return joinResult;
    }

    const { error: updErr } = await supabase
      .from("invites")
      .update({ status: "accepted" })
      .eq("group_id", parsed.groupId)
      .eq("user_id", userId);

    if (updErr) {
      return { success: false, error: updErr.message };
    }

    return { success: true, data: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message ?? "Validation failed",
      };
    }
    return { success: false, error: "Failed to respond to invite" };
  }
}

/**
 * Add a member to a group by their email address. Only group Admins may call
 * this. Uses the `add_group_member` RPC which verifies admin status via
 * `auth.uid()` and handles both `group_members` and `conversation_participants`.
 *
 * @param values - Object containing groupId and email
 * @returns Promise resolving to DataResponse indicating success or failure
 */
export async function addMemberByEmail(
  values: AddMemberValues,
): Promise<DataResponse<null>> {
  try {
    const parsed = addMemberSchema.parse(values);

    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return { success: false, error: "Authentication required" };
    }

    const { data: targetUser, error: lookupError } = await supabase
      .from("users")
      .select("user_id")
      .eq("email", parsed.email)
      .single();

    if (lookupError || !targetUser) {
      return { success: false, error: "No user found with that email address" };
    }

    const { data: existingMember } = await supabase
      .from("group_members")
      .select("user_id")
      .eq("group_id", parsed.groupId)
      .eq("user_id", targetUser.user_id)
      .single();

    if (existingMember) {
      return {
        success: false,
        error: "This user is already a member of the group",
      };
    }

    const { error: rpcError } = await supabase.rpc("add_group_member", {
      target_group_id: parsed.groupId,
      target_user_id: targetUser.user_id,
    });

    if (rpcError) {
      return { success: false, error: rpcError.message };
    }

    return { success: true, data: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message ?? "Validation failed",
      };
    }
    return { success: false, error: "Failed to add member" };
  }
}

/**
 * Remove a member from a group. Only group Admins may call this, and Admins
 * cannot be removed. Uses the `remove_group_member` RPC which verifies admin
 * status via `auth.uid()` and handles both `group_members` and
 * `conversation_participants`.
 *
 * @param values - Object containing groupId and targetUserId
 * @returns Promise resolving to DataResponse indicating success or failure
 */
export async function removeMember(
  values: RemoveMemberValues,
): Promise<DataResponse<null>> {
  try {
    const parsed = removeMemberSchema.parse(values);

    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return { success: false, error: "Authentication required" };
    }

    const { error: rpcError } = await supabase.rpc("remove_group_member", {
      target_group_id: parsed.groupId,
      target_user_id: parsed.targetUserId,
    });

    if (rpcError) {
      return { success: false, error: rpcError.message };
    }

    return { success: true, data: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message ?? "Validation failed",
      };
    }
    return { success: false, error: "Failed to remove member" };
  }
}

/**
 * Permanently delete a group. Admin-only destructive action that removes all
 * group posts (and their comments, likes, reports), members, invites, the
 * linked conversation (with messages), and finally the group row itself.
 * Uses the `delete_group` RPC which enforces admin authorization via
 * `auth.uid()` and handles the full FK-safe cascading delete.
 *
 * @param groupId - The ID of the group to delete
 * @returns Promise resolving to DataResponse indicating success or failure
 */
export async function deleteGroup(
  groupId: number,
): Promise<DataResponse<null>> {
  try {
    groupIdSchema.parse(groupId);

    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return { success: false, error: "Authentication required" };
    }

    const { error: rpcError } = await supabase.rpc("delete_group", {
      target_group_id: groupId,
    });

    if (rpcError) {
      return { success: false, error: rpcError.message };
    }

    return { success: true, data: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message ?? "Validation failed",
      };
    }
    return { success: false, error: "Failed to delete group" };
  }
}
