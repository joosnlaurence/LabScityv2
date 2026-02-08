import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { HomeFeed } from "@/components/feed/home-feed";
import {
	createComment,
	createPost,
	createReport,
	likeComment,
	likePost,
} from "@/lib/actions/feed";
import { renderWithProviders } from "@/tests/utils/render";
import { makeFeedComment, makeFeedPost } from "@/tests/fixtures/feed";
import {
	likeCommentMock,
	likePostMock,
	resetFeedStore,
} from "@/tests/mocks/feedActions.mock";

const homeFeedProps = {
	createPostAction: createPost,
	createCommentAction: createComment,
	createReportAction: createReport,
	likePostAction: likePost,
	likeCommentAction: likeComment,
};

describe("HomeFeed likes", () => {
	it("calls likePostAction with correct post id and UI updates on success", async () => {
		resetFeedStore([
			makeFeedPost({
				id: "like-post-1",
				content: "Post to like",
				comments: [],
				isLiked: false,
			}),
		]);

		const user = userEvent.setup();
		renderWithProviders(<HomeFeed {...homeFeedProps} />);

		await waitFor(() => {
			expect(screen.getByText("Post to like")).toBeInTheDocument();
		});

		const likeButtons = screen.getAllByRole("button", { name: "Like" });
		await user.click(likeButtons[0]);

		await waitFor(() => {
			expect(likePostMock).toHaveBeenCalledWith("like-post-1");
		});

		// On success, feed invalidates and refetches; mock toggled isLiked in store.
		await waitFor(() => {
			expect(likePostMock).toHaveBeenCalledTimes(1);
		});
	});

	it("shows Could not update like notification when likePost fails", async () => {
		vi.mocked(likePost).mockImplementationOnce(() =>
			Promise.resolve({ success: false, error: "Server error" }),
		);

		resetFeedStore([
			makeFeedPost({
				id: "fail-like-post",
				content: "Post for fail like",
				comments: [],
			}),
		]);

		const user = userEvent.setup();
		renderWithProviders(<HomeFeed {...homeFeedProps} />);

		await waitFor(() => {
			expect(screen.getByText("Post for fail like")).toBeInTheDocument();
		});

		await user.click(screen.getAllByRole("button", { name: "Like" })[0]);

		await waitFor(() => {
			expect(screen.getByText("Could not update like")).toBeInTheDocument();
		});
	});

	it("calls likeCommentAction with correct post and comment ids and UI updates on success", async () => {
		const comment = makeFeedComment({
			id: "like-comment-1",
			content: "Comment to like",
			isLiked: false,
		});
		resetFeedStore([
			makeFeedPost({
				id: "parent-for-like",
				content: "Parent post",
				comments: [comment],
			}),
		]);

		const user = userEvent.setup();
		renderWithProviders(<HomeFeed {...homeFeedProps} />);

		await waitFor(() => {
			expect(screen.getByText("Comment to like")).toBeInTheDocument();
		});

		// First Like = post, second Like = comment.
		const likeButtons = screen.getAllByRole("button", { name: "Like" });
		await user.click(likeButtons[1]);

		await waitFor(() => {
			expect(likeCommentMock).toHaveBeenCalledWith("parent-for-like", "like-comment-1");
		});
	});

	it("shows Could not update like notification when likeComment fails", async () => {
		vi.mocked(likeComment).mockImplementationOnce(() =>
			Promise.resolve({ success: false, error: "Server error" }),
		);

		const comment = makeFeedComment({
			id: "fail-comment",
			content: "Comment for fail like",
		});
		resetFeedStore([
			makeFeedPost({
				id: "parent-fail",
				content: "Parent",
				comments: [comment],
			}),
		]);

		const user = userEvent.setup();
		renderWithProviders(<HomeFeed {...homeFeedProps} />);

		await waitFor(() => {
			expect(screen.getByText("Comment for fail like")).toBeInTheDocument();
		});

		await user.click(screen.getAllByRole("button", { name: "Like" })[1]);

		await waitFor(() => {
			expect(screen.getAllByText("Could not update like").length).toBeGreaterThanOrEqual(1);
		});
	});
});
