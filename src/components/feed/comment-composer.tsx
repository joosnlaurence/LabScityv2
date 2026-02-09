"use client";

import { Button, Group, Paper, Stack, Textarea, TextInput } from "@mantine/core";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	createCommentSchema,
	type CreateCommentValues,
} from "@/lib/validations/post";
import classes from "./comment-composer.module.css";

export interface CommentComposerProps {
	postId: string;
	onAddComment: (postId: string, values: CreateCommentValues) => void | Promise<void>;
	isSubmitting?: boolean;
}

export function CommentComposer({
	postId,
	onAddComment,
	isSubmitting: isMutationPending = false,
}: CommentComposerProps) {
	const {
		handleSubmit,
		register,
		reset,
		formState: { errors, isSubmitting, isValid },
	} = useForm<CreateCommentValues>({
		resolver: zodResolver(createCommentSchema),
		mode: "onChange",
		defaultValues: {
			userName: "",
			content: "",
		},
	});

	const onCommentSubmit = handleSubmit(async (values) => {
		try {
			await onAddComment(postId, values);
			reset({
				userName: "",
				content: "",
			});
		} catch {
			// Hook's mutation onError already showed notification; don't reset form so user can retry.
		}
	});

	return (
		<Paper className={classes.commentComposer}>
			<form onSubmit={onCommentSubmit}>
				<Stack gap="sm">
					<TextInput
						label="Name"
						placeholder="Dr. Ada Lovelace"
						error={errors.userName?.message}
						{...register("userName")}
					/>
					<Textarea
						label="Comment"
						placeholder="Share a thought..."
						minRows={2}
						error={errors.content?.message}
						{...register("content")}
					/>
					<Group className={classes.formActions}>
						<Button
							type="submit"
							disabled={!isValid || isSubmitting || isMutationPending}
							loading={isMutationPending}
						>
							Comment
						</Button>
					</Group>
				</Stack>
			</form>
		</Paper>
	);
}
