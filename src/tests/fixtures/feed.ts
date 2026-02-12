import type {
	FeedCommentItem,
	FeedPostItem,
	GetFeedResult,
} from "@/lib/types/feed";

/** Options for creating a single feed comment fixture. */
interface MakeFeedCommentOptions extends Partial<FeedCommentItem> {}

/** Options for creating a single feed post fixture. */
interface MakeFeedPostOptions extends Partial<FeedPostItem> {
	comments?: FeedCommentItem[];
}

let postIdCounter = 1;
let commentIdCounter = 1;

/**
 * Creates a deterministic feed comment fixture.
 *
 * Intended for use in integration tests where only a subset of properties
 * are important; callers can override any field via the options argument.
 */
export function makeFeedComment(
	options: MakeFeedCommentOptions = {},
): FeedCommentItem {
	const id = options.id ?? `comment-${commentIdCounter++}`;

	return {
		id,
		userName: options.userName ?? "Dr. Grace Hopper",
		content: options.content ?? "This is a thoughtful comment on your research.",
		timeAgo: options.timeAgo ?? "5m ago",
		isLiked: options.isLiked ?? false,
	};
}

/**
 * Creates a deterministic feed post fixture with optional nested comments.
 *
 * Useful for building realistic feeds for HomeFeed/useHomeFeed tests while
 * keeping test data definitions centralized.
 */
export function makeFeedPost(
	options: MakeFeedPostOptions = {},
): FeedPostItem {
	const id = options.id ?? `post-${postIdCounter++}`;

	return {
		id,
		userName: options.userName ?? "Dr. Ada Lovelace",
		scientificField: options.scientificField ?? "Computational Mathematics",
		content:
			options.content ??
			"Exploring a new approach to modeling collaborative scientific discovery.",
		timeAgo: options.timeAgo ?? "10m ago",
		mediaUrl:
			options.mediaUrl === undefined
				? null
				: options.mediaUrl,
		mediaLabel:
			options.mediaLabel === undefined
				? null
				: options.mediaLabel,
		comments:
			options.comments ??
			[
				makeFeedComment({
					content: "Fascinating idea—have you considered applying this to lab networks?",
				}),
			],
		isLiked: options.isLiked ?? false,
		audienceLabel:
			options.audienceLabel === undefined
				? "Shared with your field"
				: options.audienceLabel,
	};
}

/**
 * Creates an array of feed posts for list-oriented tests.
 *
 * @param postCount - Number of posts to generate.
 * @param commentsPerPost - Number of comments to generate for each post.
 */
export function makeFeed(
	postCount = 2,
	commentsPerPost = 1,
): FeedPostItem[] {
	const posts: FeedPostItem[] = [];

	for (let index = 0; index < postCount; index += 1) {
		const comments: FeedCommentItem[] = [];

		for (let commentIndex = 0; commentIndex < commentsPerPost; commentIndex += 1) {
			comments.push(
				makeFeedComment({
					content: `Comment ${commentIndex + 1} on post ${index + 1}`,
				}),
			);
		}

		posts.push(
			makeFeedPost({
				content: `Post ${index + 1} on collaborative lab science.`,
				comments,
			}),
		);
	}

	return posts;
}

/**
 * Convenience helper for building a successful GetFeedResult payload.
 */
export function makeGetFeedResult(
	posts: FeedPostItem[],
	nextCursor: string | null = null,
): GetFeedResult {
	return {
		posts,
		nextCursor,
	};
}

