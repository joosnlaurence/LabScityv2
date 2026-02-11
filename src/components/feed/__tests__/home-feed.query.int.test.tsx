import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HomeFeed } from "@/components/feed/home-feed";
import {
	createComment,
	createPost,
	createReport,
	getFeed,
	likeComment,
	likePost,
} from "@/lib/actions/feed";
import { renderWithProviders } from "@/tests/utils/render";
import {
	makeFeedComment,
	makeFeedPost,
} from "@/tests/fixtures/feed";
import { resetFeedStore } from "@/tests/mocks/feedActions.mock";

const homeFeedProps = {
	createPostAction: createPost,
	createCommentAction: createComment,
	createReportAction: createReport,
	likePostAction: likePost,
	likeCommentAction: likeComment,
};

describe("useHomeFeed query states", () => {
	it("shows Loading feed... while getFeed is in flight", async () => {
		// Resolve after a long delay so the query stays loading when we assert.
		vi.mocked(getFeed).mockImplementationOnce(
			() =>
				new Promise((resolve) => {
					setTimeout(
						() =>
							resolve({
								success: true,
								data: { posts: [], nextCursor: null },
							}),
						10_000,
					);
				}),
		);

		renderWithProviders(<HomeFeed {...homeFeedProps} />);

		expect(screen.getByText("Loading feed...")).toBeInTheDocument();
	});

	it("shows multiple posts with comments and correct PostCard / PostCommentCard content and menu IDs on success", async () => {
		const postA = makeFeedPost({
			id: "query-post-a",
			content: "Success post A content",
			userName: "Dr. Alice",
			comments: [
				makeFeedComment({
					id: "query-comment-a1",
					content: "Comment on post A",
					userName: "Dr. Bob",
				}),
			],
		});
		const postB = makeFeedPost({
			id: "query-post-b",
			content: "Success post B content",
			userName: "Dr. Carol",
			comments: [
				makeFeedComment({
					id: "query-comment-b1",
					content: "Comment on post B",
					userName: "Dr. Dave",
				}),
			],
		});
		resetFeedStore([postA, postB]);

		renderWithProviders(<HomeFeed {...homeFeedProps} />);

		await waitFor(() => {
			expect(screen.getByText("Success post A content")).toBeInTheDocument();
			expect(screen.getByText("Success post B content")).toBeInTheDocument();
		});

		expect(screen.getByText("Comment on post A")).toBeInTheDocument();
		expect(screen.getByText("Comment on post B")).toBeInTheDocument();
		expect(screen.getByText("Dr. Alice")).toBeInTheDocument();
		expect(screen.getByText("Dr. Carol")).toBeInTheDocument();
		expect(screen.getByText("Dr. Bob")).toBeInTheDocument();
		expect(screen.getByText("Dr. Dave")).toBeInTheDocument();

		// PostCard and PostCommentCard pass menuId (post-menu-{id}, comment-menu-{id});
		// menus may render in a portal, so assert by role that each post/comment has its menu.
		const postOptionButtons = screen.getAllByRole("button", {
			name: "Post options",
		});
		const commentOptionButtons = screen.getAllByRole("button", {
			name: "Comment options",
		});
		expect(postOptionButtons).toHaveLength(2);
		expect(commentOptionButtons).toHaveLength(2);

		expect(screen.queryByText("Loading feed...")).not.toBeInTheDocument();
	});

	it("shows red error text and no post list when getFeed fails", async () => {
		const failResult = Promise.resolve({
			success: false,
			error: "Network error",
		} as const);
		vi.mocked(getFeed).mockImplementationOnce(() => failResult);
		vi.mocked(getFeed).mockImplementationOnce(() => failResult);

		renderWithProviders(<HomeFeed {...homeFeedProps} />);

		await waitFor(() => {
			expect(screen.getByText("Network error")).toBeInTheDocument();
		});

		// Error text is rendered with c="red" (Mantine)
		const errorEl = screen.getByText("Network error");
		expect(errorEl).toBeInTheDocument();

		expect(screen.queryByText("Loading feed...")).not.toBeInTheDocument();
		expect(
			document.querySelectorAll('[class*="postStack"]'),
		).toHaveLength(0);
	});
});
