"use client";

import { useMemo, useState } from "react";
import { Button, FileInput, Group, Paper, Stack, TextInput, Textarea } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { PostCard } from "@/components/feed/post-card";
import classes from "./page.module.css";

interface FeedPost {
	id: string;
	userName: string;
	field: string;
	timeAgo: string;
	content: string;
	attachmentUrl?: string | null;
	attachmentLabel?: string | null;
}

export default function DashboardPage() {
	const [isComposerOpen, setIsComposerOpen] = useState(false);
	const [posts, setPosts] = useState<FeedPost[]>([
		{
			id: "p1",
			userName: "Name",
			field: "Research Interests / Subject of Post",
			timeAgo: "5 HR AGO",
			content: "Lorem ipsum...",
			attachmentLabel: "Picture/\nAttachment\nPreview",
		},
	]);
	const [name, setName] = useState("");
	const [field, setField] = useState("");
	const [content, setContent] = useState("");
	const [attachment, setAttachment] = useState<File | null>(null);

	const canPost = useMemo(() => {
		return name.trim() && field.trim() && content.trim();
	}, [name, field, content]);

	const handlePost = () => {
		if (!canPost) return;

		const newPost: FeedPost = {
			id: crypto.randomUUID(),
			userName: name.trim(),
			field: field.trim(),
			timeAgo: "Just now",
			content: content.trim(),
			attachmentUrl: attachment ? URL.createObjectURL(attachment) : null,
		};

		setPosts((current) => [newPost, ...current]);
		setName("");
		setField("");
		setContent("");
		setAttachment(null);
		setIsComposerOpen(false);
	};

	return (
		<Stack gap="lg">
			<Button
				className={classes.newPostButton}
				leftSection={<IconPlus size={16} />}
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
					<Stack gap="sm">
						<TextInput
							label="Name"
							placeholder="Dr. Ada Lovelace"
							value={name}
							onChange={(event) => setName(event.currentTarget.value)}
						/>
						<TextInput
							label="Scientific Field"
							placeholder="Neuroscience, Astrophysics..."
							value={field}
							onChange={(event) => setField(event.currentTarget.value)}
						/>
						<Textarea
							label="Post"
							placeholder="Share an update with the community..."
							minRows={3}
							value={content}
							onChange={(event) => setContent(event.currentTarget.value)}
						/>
						<FileInput
							label="Picture or Attachment (optional)"
							placeholder="Upload an image"
							accept="image/*"
							value={attachment}
							onChange={setAttachment}
						/>
						<Group className={classes.formActions}>
							<Button onClick={handlePost} disabled={!canPost}>
								Post
							</Button>
						</Group>
					</Stack>
				</Paper>
			) : null}

			<Stack gap="lg">
				{posts.map((post) => (
					<PostCard
						key={post.id}
						userName={post.userName}
						field={post.field}
						timeAgo={post.timeAgo}
						content={post.content}
						mediaLabel={post.attachmentLabel ?? null}
						mediaUrl={post.attachmentUrl ?? null}
					/>
				))}
			</Stack>
		</Stack>
	);
}
