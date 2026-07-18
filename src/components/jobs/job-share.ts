import { notifications } from "@mantine/notifications";

export async function copyJobLink(jobId: number) {
  try {
    await navigator.clipboard.writeText(
      `${window.location.origin}/jobs/${jobId}`,
    );
    notifications.show({
      color: "green",
      message: "Job link copied",
    });
  } catch {
    notifications.show({
      color: "red",
      title: "Could not copy link",
      message: "Copy the URL from your browser instead.",
    });
  }
}
