import { screen, waitFor, within } from "@testing-library/react";
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
import { makeFeedPost } from "@/tests/fixtures/feed";
import {
	createCommentMock,
	resetFeedStore,
} from "@/tests/mocks/feedActions.mock";

const homeFeedProps = {
	createPostAction: createPost,
	createCommentAction: createComment,
	createReportAction: createReport,
	likePostAction: likePost,
	likeCommentAction: likeComment,
};

describe("HomeFeed comment flow", () => {
	it("shows CommentComposer for the post whose comment action was clicked only", async () => {
		resetFeedStore([
			makeFeedPost({
				id: "post-a",
				content: "Post A content",
				comments: [],
			}),
			makeFeedPost({
				id: "post-b",
				content: "Post B content",
				comments: [],
			}),
		]);

		const user = userEvent.setup();
		renderWithProviders(<HomeFeed {...homeFeedProps} />);

		await waitFor(() => {
			expect(screen.getByText("Post A content")).toBeInTheDocument();
			expect(screen.getByText("Post B content")).toBeInTheDocument();
		});

		// No composer yet (comments sections not expanded).
		expect(screen.queryByLabelText("Comment")).not.toBeInTheDocument();

		// Click Comment on first post (first Comment action button in the list).
		const commentActionButtons = screen.getAllByRole("button", { name: "Comment" });
		await user.click(commentActionButtons[0]);

		// CommentComposer appears (form with Comment textarea label).
		expect(screen.getByLabelText("Comment")).toBeInTheDocument();
		// Only one composer (one Comment label for the textarea).
		expect(screen.getAllByLabelText("Comment")).toHaveLength(1);
		// Submit button is inside the composer form.
		const form = screen.getByLabelText("Comment").closest("form");
		expect(form).toBeInTheDocument();
		expect(within(form!).getByRole("button", { name: "Comment" })).toBeInTheDocument();
	});

	it("calls createCommentAction and shows new comment in feed after success", async () => {
		resetFeedStore([
			makeFeedPost({
				id: "target-post",
				content: "Target post",
				comments: [],
			}),
		]);

		const user = userEvent.setup();
		renderWithProviders(<HomeFeed {...homeFeedProps} />);

		await waitFor(() => {
			expect(screen.getByText("Target post")).toBeInTheDocument();
		});

		await user.click(screen.getAllByRole("button", { name: "Comment" })[0]);
		await user.type(screen.getByLabelText("Name"), "Dr. Commenter");
		await user.type(screen.getByLabelText("Comment"), "New comment text");
		const composerForm = screen.getByLabelText("Comment").closest("form")!;
		await user.click(within(composerForm).getByRole("button", { name: "Comment" }));

		await waitFor(() => {
			expect(createCommentMock).toHaveBeenCalledWith(
				"target-post",
				expect.objectContaining({
					userName: "Dr. Commenter",
					content: "New comment text",
				}),
			);
		});

		await waitFor(() => {
			expect(screen.getByText("New comment text")).toBeInTheDocument();
		});
	});

	it("shows Could not add comment notification when createComment fails", async () => {
		vi.mocked(createComment).mockImplementationOnce(() =>
			Promise.resolve({ success: false, error: "Server error" }),
		);

		resetFeedStore([
			makeFeedPost({
				id: "fail-post",
				content: "Post for fail",
				comments: [],
			}),
		]);

		const user = userEvent.setup();
		renderWithProviders(<HomeFeed {...homeFeedProps} />);

		await waitFor(() => {
			expect(screen.getByText("Post for fail")).toBeInTheDocument();
		});

		await user.click(screen.getAllByRole("button", { name: "Comment" })[0]);
		await user.type(screen.getByLabelText("Name"), "Dr. Fail");
		await user.type(screen.getByLabelText("Comment"), "This will fail");
		const composerForm = screen.getByLabelText("Comment").closest("form")!;
		await user.click(within(composerForm).getByRole("button", { name: "Comment" }));

		await waitFor(() => {
			expect(screen.getByText("Could not add comment")).toBeInTheDocument();
		});
	});
});
