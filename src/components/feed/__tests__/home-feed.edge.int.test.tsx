import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
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

describe("HomeFeed edge cases and accessibility", () => {
	describe("empty feed", () => {
		it("shows New Post button and no posts when feed returns empty list", async () => {
			resetFeedStore([]);

			renderWithProviders(<HomeFeed {...homeFeedProps} />);

			await waitFor(() => {
				expect(screen.queryByText("Loading feed...")).not.toBeInTheDocument();
			});

			expect(screen.getByRole("button", { name: /new post/i })).toBeInTheDocument();
			expect(
				document.querySelectorAll('[class*="postStack"]'),
			).toHaveLength(0);
		});
	});

	describe("long content", () => {
		it("renders post with very long content in the document", async () => {
			const longContent =
				"A".repeat(2000) + " end of long post";
			resetFeedStore([
				makeFeedPost({
					id: "long-post",
					content: longContent,
					comments: [],
				}),
			]);

			renderWithProviders(<HomeFeed {...homeFeedProps} />);

			await waitFor(() => {
				expect(screen.getByText(longContent)).toBeInTheDocument();
			});
		});

		it("renders comment with very long content in the document", async () => {
			const longComment =
				"B".repeat(1500) + " end of long comment";
			resetFeedStore([
				makeFeedPost({
					id: "post-with-long-comment",
					content: "Short post",
					comments: [
						makeFeedComment({
							id: "long-comment",
							content: longComment,
						}),
					],
				}),
			]);

			renderWithProviders(<HomeFeed {...homeFeedProps} />);

			await waitFor(() => {
				expect(screen.getByText(longComment)).toBeInTheDocument();
			});
		});
	});

	describe("rapid mutations", () => {
		it("handles rapid like clicks without duplicate error notifications", async () => {
			resetFeedStore([
				makeFeedPost({
					id: "rapid-like-post",
					content: "Post for rapid like",
					comments: [],
					isLiked: false,
				}),
			]);

			const user = userEvent.setup();
			renderWithProviders(<HomeFeed {...homeFeedProps} />);

			await waitFor(() => {
				expect(screen.getByText("Post for rapid like")).toBeInTheDocument();
			});

			const likeButton = screen.getByRole("button", { name: "Like" });
			await user.click(likeButton);
			await user.click(likeButton);
			await user.click(likeButton);

			await waitFor(() => {
				expect(likePostMock).toHaveBeenCalledWith("rapid-like-post");
			});

			// Should not show multiple "Could not update like" toasts from rapid clicks
			const errorNotifications = screen.queryAllByText("Could not update like");
			expect(errorNotifications.length).toBeLessThanOrEqual(1);
		});
	});

	describe("accessibility", () => {
		it("exposes New Post button via role and name", async () => {
			resetFeedStore([
				makeFeedPost({ id: "a11y-1", content: "Post" }),
			]);

			renderWithProviders(<HomeFeed {...homeFeedProps} />);

			await waitFor(() => {
				expect(screen.getByText("Post")).toBeInTheDocument();
			});

			expect(
				screen.getByRole("button", { name: /new post/i }),
			).toBeInTheDocument();
		});

		it("exposes composer form fields via labels when composer is open", async () => {
			resetFeedStore([
				makeFeedPost({ id: "a11y-2", content: "Post" }),
			]);

			const user = userEvent.setup();
			renderWithProviders(<HomeFeed {...homeFeedProps} />);

			await waitFor(() => {
				expect(screen.getByText("Post")).toBeInTheDocument();
			});

			await user.click(screen.getByRole("button", { name: /new post/i }));

			expect(screen.getByLabelText("Name")).toBeInTheDocument();
			expect(screen.getByLabelText("Scientific Field")).toBeInTheDocument();
			expect(screen.getByLabelText("Post")).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: "Post" }),
			).toBeInTheDocument();
		});

		it("exposes post card actions via roles (Like, Comment, Post options)", async () => {
			resetFeedStore([
				makeFeedPost({
					id: "a11y-3",
					content: "Post for actions",
					comments: [],
				}),
			]);

			renderWithProviders(<HomeFeed {...homeFeedProps} />);

			await waitFor(() => {
				expect(screen.getByText("Post for actions")).toBeInTheDocument();
			});

			expect(
				screen.getByRole("button", { name: "Like" }),
			).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: "Comment" }),
			).toBeInTheDocument();
			expect(
				screen.getByRole("button", { name: "Post options" }),
			).toBeInTheDocument();
		});

		it("exposes comment composer labels when comment section is open", async () => {
			resetFeedStore([
				makeFeedPost({
					id: "a11y-4",
					content: "Post with comment",
					comments: [
						makeFeedComment({
							id: "c1",
							content: "Existing comment",
						}),
					],
				}),
			]);

			const user = userEvent.setup();
			renderWithProviders(<HomeFeed {...homeFeedProps} />);

			await waitFor(() => {
				expect(screen.getByText("Existing comment")).toBeInTheDocument();
			});

			await user.click(screen.getByRole("button", { name: "Comment" }));

			await waitFor(() => {
				expect(screen.getByLabelText("Name")).toBeInTheDocument();
				expect(screen.getByLabelText("Comment")).toBeInTheDocument();
				// Post card and comment form both have a "Comment" button
				const commentButtons = screen.getAllByRole("button", { name: "Comment" });
				expect(commentButtons.length).toBeGreaterThanOrEqual(1);
			});
		});
	});
});
