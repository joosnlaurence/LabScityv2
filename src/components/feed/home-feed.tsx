"use client";

import { useState } from "react";
import { Button, FileInput, Group, Paper, Stack, TextInput, Textarea } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PostCard } from "@/components/feed/post-card";
import type { FeedPostItem } from "@/lib/types/feed";
import { createPostSchema, type CreatePostValues } from "@/lib/validations/post";
import classes from "./home-feed.module.css";

interface HomeFeedProps {
	initialPosts: FeedPostItem[];
}

export function HomeFeed({ initialPosts }: HomeFeedProps) {
	const [isComposerOpen, setIsComposerOpen] = useState(false);
	const [posts, setPosts] = useState<FeedPostItem[]>(initialPosts);

	const {
		control,
		handleSubmit,
		register,
		reset,
		formState: { errors, isSubmitting, isValid },
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
		const mediaFile = values.mediaFile as File | undefined;
		const mediaUrl = mediaFile ? URL.createObjectURL(mediaFile) : null;

		const newPost: FeedPostItem = {
			id: crypto.randomUUID(),
			userName: values.userName.trim(),
			scientificField: values.scientificField.trim(),
			content: values.content.trim(),
			timeAgo: "Just now",
			mediaUrl,
		};

		setPosts((current) => [newPost, ...current]);
		reset({
			userName: "",
			scientificField: "",
			content: "",
			category: "general",
			mediaFile: undefined,
			mediaUrl: "",
			link: "",
		});
		setIsComposerOpen(false);
	});

	return (
		<Stack gap="lg">
			<Button
				className={classes.newPostButton}
				leftSection={<IconPlus size={14} />}
				radius="xl"
				variant="default"
				size="sm"
				color="navy"
				onClick={() => setIsComposerOpen((open) => !open)}
			>
				New Post
			</Button>

			{isComposerOpen ? (
				<Paper className={classes.newPostCard}>
					<form onSubmit={onSubmit}>
						<Stack gap="sm">
							<TextInput
								label="Name"
								placeholder="Dr. Ada Lovelace"
								error={errors.userName?.message}
								{...register("userName")}
							/>
							<TextInput
								label="Scientific Field"
								placeholder="Neuroscience, Astrophysics..."
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
								<Button type="submit" disabled={!isValid || isSubmitting} loading={isSubmitting}>
									Post
								</Button>
							</Group>
						</Stack>
					</form>
				</Paper>
			) : null}

			<Stack gap="lg">
				{posts.map((post) => (
					<PostCard
						key={post.id}
						userName={post.userName}
						field={post.scientificField}
						timeAgo={post.timeAgo}
						content={post.content}
						mediaUrl={post.mediaUrl ?? null}
						mediaLabel={post.mediaLabel ?? null}
					/>
				))}
			</Stack>
		</Stack>
	);
}
