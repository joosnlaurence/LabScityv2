import { z } from "zod";

export const createGroupSchema = z.object({
	name: z
		.string()
		.min(1, { message: "Group name is required" })
		.max(100, { message: "Group name must be less than 100 characters" }),
	description: z
		.string()
		.max(500, { message: "Description must be less than 500 characters" })
		.optional()
		.default(""),
});

/** Reusable schema for actions that take a group_id (join, leave, details). */
export const groupIdSchema = z.number().int().positive("Invalid group ID");

export const addMemberSchema = z.object({
	groupId: z.number().int().positive("Invalid group ID"),
	email: z.email("Valid email required"),
});

export const removeMemberSchema = z.object({
	groupId: z.number().int().positive("Invalid group ID"),
	targetUserId: z.uuid("Invalid user ID"),
});

export type CreateGroupValues = z.infer<typeof createGroupSchema>;
export type AddMemberValues = z.infer<typeof addMemberSchema>;
export type RemoveMemberValues = z.infer<typeof removeMemberSchema>;
