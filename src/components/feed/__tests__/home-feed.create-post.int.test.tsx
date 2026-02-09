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
import { makeFeedPost } from "@/tests/fixtures/feed";
import {
	createPostMock,
	resetFeedStore,
} from "@/tests/mocks/feedActions.mock";

const homeFeedProps = {
	createPostAction: createPost,
	createCommentAction: createComment,
	createReportAction: createReport,
	likePostAction: likePost,
	likeCommentAction: likeComment,
};

describe("HomeFeed post creation flow", () => {
	it("opens composer on New Post click and closes it after successful submit", async () => {
		resetFeedStore([
			makeFeedPost({ id: "p1", content: "Existing post" }),
		]);

		const user = userEvent.setup();
		renderWithProviders(<HomeFeed {...homeFeedProps} />);

		await waitFor(() => {
			expect(screen.getByText("Existing post")).toBeInTheDocument();
		});

		expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: /new post/i }));

		expect(screen.getByLabelText("Name")).toBeInTheDocument();
		expect(screen.getByLabelText("Scientific Field")).toBeInTheDocument();
		expect(screen.getByLabelText("Post")).toBeInTheDocument();

		await user.type(screen.getByLabelText("Name"), "Dr. Test");
		await user.type(screen.getByLabelText("Scientific Field"), "Chemistry");
		await user.type(
			screen.getByLabelText("Post"),
			"New post from test",
		);

		await user.click(screen.getByRole("button", { name: "Post" }));

		await waitFor(() => {
			expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
		});
	});

	it("calls createPost with correct payload and shows new post in feed after success", async () => {
		resetFeedStore([
			makeFeedPost({ id: "p1", content: "First post" }),
		]);

		const user = userEvent.setup();
		renderWithProviders(<HomeFeed {...homeFeedProps} />);

		await waitFor(() => {
			expect(screen.getByText("First post")).toBeInTheDocument();
		});

		await user.click(screen.getByRole("button", { name: /new post/i }));
		await user.type(screen.getByLabelText("Name"), "Dr. Success");
		await user.type(screen.getByLabelText("Scientific Field"), "Physics");
		await user.type(
			screen.getByLabelText("Post"),
			"Created post content",
		);
		await user.click(screen.getByRole("button", { name: "Post" }));

		await waitFor(() => {
			expect(createPostMock).toHaveBeenCalledWith(
				expect.objectContaining({
					userName: "Dr. Success",
					scientificField: "Physics",
					content: "Created post content",
				}),
			);
		});

		await waitFor(() => {
			expect(screen.getByText("Created post content")).toBeInTheDocument();
		});
	});

	it("shows Could not create post notification when createPost fails", async () => {
		vi.mocked(createPost).mockImplementationOnce(() =>
			Promise.resolve({ success: false, error: "Server error" }),
		);

		resetFeedStore([
			makeFeedPost({ id: "p1", content: "Only post" }),
		]);

		const user = userEvent.setup();
		renderWithProviders(<HomeFeed {...homeFeedProps} />);

		await waitFor(() => {
			expect(screen.getByText("Only post")).toBeInTheDocument();
		});

		await user.click(screen.getByRole("button", { name: /new post/i }));
		await user.type(screen.getByLabelText("Name"), "Dr. Fail");
		await user.type(screen.getByLabelText("Scientific Field"), "Math");
		await user.type(screen.getByLabelText("Post"), "This will fail");
		await user.click(screen.getByRole("button", { name: "Post" }));

		await waitFor(() => {
			expect(screen.getByText("Could not create post")).toBeInTheDocument();
		});
	});
});
