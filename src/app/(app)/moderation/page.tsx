import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  canAccessModerationAction,
  getModerationReportsAction,
} from "@/lib/actions/moderation";
import { LSModerationReportCard } from "@/components/moderation/ls-moderation-report-card";
import { Group, Stack, Title, Text } from "@mantine/core";

export const metadata: Metadata = {
  title: "Moderation | LabScity",
  description: "Moderator queue for handling user reports.",
};

/// Checks if we have mod privileges; redirects to home if we try to access this but don't
export default async function ModerationPage() {
  const accessResult = await canAccessModerationAction();

  if (!accessResult.success) {
    return (
      <main>
        <h1>Moderation Queue</h1>
        <p>{accessResult.error}</p>
      </main>
    );
  }

  if (!accessResult.data.isModerator) {
    redirect("/home");
  }

  const reportsResult = await getModerationReportsAction(25);

  if (!reportsResult.success) {
    return (
      <main>
        <h1>Moderation Queue</h1>
        <p>{reportsResult.error}</p>
      </main>
    );
  }

  const reports = reportsResult.data;

  return (
    <Stack gap={0} p={12}>
      <Title c="gray.8" my={12} fw={"normal"}>Reports</Title>

      {reports.length === 0 ? (
        <div>No open reports right now.</div>
      ) : (
        <Stack>
          {reports.map((report) => (
            <LSModerationReportCard
              key={report.reportId}
              report={report}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
