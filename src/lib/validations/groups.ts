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

export type CreateGroupValues = z.infer<typeof createGroupSchema>;
