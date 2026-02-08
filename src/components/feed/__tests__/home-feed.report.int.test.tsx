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
import { makeFeedComment, makeFeedPost } from "@/tests/fixtures/feed";
import { resetFeedStore } from "@/tests/mocks/feedActions.mock";

const homeFeedProps = {
	createPostAction: createPost,
	createCommentAction: createComment,
	createReportAction: createReport,
	likePostAction: likePost,
	likeCommentAction: likeComment,
};

describe("HomeFeed report flow", () => {
	it("opens ReportOverlay with Report post and post preview when reporting a post", async () => {
		resetFeedStore([
			makeFeedPost({
				id: "report-post-1",
				content: "Post content to report",
				userName: "Dr. Author",
				comments: [],
			}),
		]);

		const user = userEvent.setup();
		renderWithProviders(<HomeFeed {...homeFeedProps} />);

		await waitFor(() => {
			expect(screen.getByText("Post content to report")).toBeInTheDocument();
		});

		await user.click(screen.getByRole("button", { name: "Post options" }));
		const reportMenuItem = await screen.findByRole("menuitem", { name: "Report" });
		await user.click(reportMenuItem);

		await waitFor(() => {
			expect(screen.getByText("Report post")).toBeInTheDocument();
		});
		const overlayPanel = screen.getByText("Report post").closest('[class*="panel"]');
		expect(overlayPanel).toBeInTheDocument();
		expect(within(overlayPanel as HTMLElement).getByText("Post content to report")).toBeInTheDocument();
		expect(within(overlayPanel as HTMLElement).getByLabelText("Report type")).toBeInTheDocument();
	});

	it("opens ReportOverlay with Report comment and comment preview when reporting a comment", async () => {
		const comment = makeFeedComment({
			id: "report-comment-1",
			content: "Comment content to report",
			userName: "Dr. Commenter",
		});
		resetFeedStore([
			makeFeedPost({
				id: "parent-post",
				content: "Parent post",
				comments: [comment],
			}),
		]);

		const user = userEvent.setup();
		renderWithProviders(<HomeFeed {...homeFeedProps} />);

		await waitFor(() => {
			expect(screen.getByText("Comment content to report")).toBeInTheDocument();
		});

		await user.click(screen.getByRole("button", { name: "Comment options" }));
		const reportMenuItem = await screen.findByRole("menuitem", { name: "Report" });
		await user.click(reportMenuItem);

		await waitFor(() => {
			expect(screen.getByText("Report comment")).toBeInTheDocument();
		});
		const overlayPanel = screen.getByText("Report comment").closest('[class*="panel"]');
		expect(overlayPanel).toBeInTheDocument();
		expect(within(overlayPanel as HTMLElement).getByText("Comment content to report")).toBeInTheDocument();
	});

	it("closes overlay and shows Report submitted notification on successful submit", async () => {
		resetFeedStore([
			makeFeedPost({
				id: "success-post",
				content: "Post for success report",
				comments: [],
			}),
		]);

		const user = userEvent.setup();
		renderWithProviders(<HomeFeed {...homeFeedProps} />);

		await waitFor(() => {
			expect(screen.getByText("Post for success report")).toBeInTheDocument();
		});

		await user.click(screen.getByRole("button", { name: "Post options" }));
		const reportMenuItem = await screen.findByRole("menuitem", { name: "Report" });
		await user.click(reportMenuItem);

		await waitFor(() => {
			expect(screen.getByText("Report post")).toBeInTheDocument();
		});

		const overlayPanel = screen.getByText("Report post").closest('[class*="panel"]') as HTMLElement;
		await user.click(within(overlayPanel).getByLabelText("Report type"));
		const spamOption = await screen.findByRole("option", { name: "Spam/Scam", hidden: true });
		await user.click(spamOption);
		await user.type(
			within(overlayPanel).getByLabelText("Describe your report"),
			"Details of the report",
		);
		await user.click(within(overlayPanel).getByRole("button", { name: "Submit" }));

		await waitFor(() => {
			expect(screen.getByText("Report submitted")).toBeInTheDocument();
		});
		await waitFor(() => {
			expect(screen.queryByText("Report post")).not.toBeInTheDocument();
		});
	});

	it("shows Could not submit report notification and keeps overlay open on submit error", async () => {
		vi.mocked(createReport).mockImplementationOnce(() =>
			Promise.resolve({ success: false, error: "Server error" }),
		);

		resetFeedStore([
			makeFeedPost({
				id: "fail-post",
				content: "Post for fail report",
				comments: [],
			}),
		]);

		const user = userEvent.setup();
		renderWithProviders(<HomeFeed {...homeFeedProps} />);

		await waitFor(() => {
			expect(screen.getByText("Post for fail report")).toBeInTheDocument();
		});

		await user.click(screen.getByRole("button", { name: "Post options" }));
		const reportMenuItem = await screen.findByRole("menuitem", { name: "Report" });
		await user.click(reportMenuItem);

		await waitFor(() => {
			expect(screen.getByText("Report post")).toBeInTheDocument();
		});

		const overlayPanel = screen.getByText("Report post").closest('[class*="panel"]') as HTMLElement;
		await user.click(within(overlayPanel).getByLabelText("Report type"));
		const otherOption = await screen.findByRole("option", { name: "Other", hidden: true });
		await user.click(otherOption);
		await user.type(
			within(overlayPanel).getByLabelText("Describe your report"),
			"Report details",
		);
		await user.click(within(overlayPanel).getByRole("button", { name: "Submit" }));

		await waitFor(() => {
			expect(screen.getByText("Could not submit report")).toBeInTheDocument();
		});
		// Overlay stays open so user can retry.
		expect(screen.getByText("Report post")).toBeInTheDocument();
	});
});
