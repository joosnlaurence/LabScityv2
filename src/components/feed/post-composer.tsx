"use client";

import { Button, FileInput, Group, Paper, Stack, TextInput, Textarea } from "@mantine/core";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	createPostSchema,
	type CreatePostValues,
} from "@/lib/validations/post";
import classes from "./post-composer.module.css";

export interface PostComposerProps {
	onSubmit: (values: CreatePostValues) => void | Promise<void>;
	isPending: boolean;
}

export function PostComposer({ onSubmit: onSubmitProp, isPending }: PostComposerProps) {
	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting, isValid },
		register,
	} = useForm<CreatePostValues>({
		resolver: zodResolver(createPostSchema),
		mode: "onChange",
		defaultValues: {
			userName: "",
			scientificField: "",
			content: "",
			category: "general",
			mediaFile: undefined,
			mediaUrl: "",
			link: "",
		},
	});

	const onSubmit = handleSubmit((values) => {
		onSubmitProp(values);
	});

	return (
		<Paper className={classes.newPostCard}>
			<form onSubmit={onSubmit}>
				<Stack gap="sm">
					<TextInput
						label="Name"
						placeholder="Need to remove this"
						error={errors.userName?.message}
						{...register("userName")}
					/>
					<TextInput
						label="Scientific Field"
						placeholder="Need to change to a dropdown"
						error={errors.scientificField?.message}
						{...register("scientificField")}
					/>
					<Textarea
						label="Post"
						placeholder="Share an update with the community..."
						minRows={3}
						error={errors.content?.message}
						{...register("content")}
					/>
					<Controller
						control={control}
						name="mediaFile"
						render={({ field }) => (
							<FileInput
								label="Picture (optional)"
								placeholder="Upload an image"
								accept="image/*"
								value={field.value ? (field.value as File) : null}
								onChange={field.onChange}
								error={errors.mediaFile?.message as string | undefined}
							/>
						)}
					/>
					<Group className={classes.formActions}>
						<Button
							type="submit"
							disabled={!isValid || isSubmitting || isPending}
							loading={isPending}
						>
							Post
						</Button>
					</Group>
				</Stack>
			</form>
		</Paper>
	);
}
