import {
  Anchor,
  Badge,
  Checkbox,
  Group,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconBook2,
  IconBooks,
  IconClipboardText,
  IconClock,
  IconFile,
  IconLink,
  IconNotebook,
  IconPresentation,
  IconSchool,
} from "@tabler/icons-react";
import type { ReactNode } from "react";
import { PUBLICATION_TYPE_LABELS } from "@/lib/constants/publications";
import { ParsedOpenAlexWork } from "@/lib/types/publication";

const PUB_DATE_FMT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
});

const TYPE_ICON_PROPS = { size: "0.8rem", color: "var(--mantine-color-indigo-8)" };

const TYPE_ICONS: Record<string, ReactNode> = {
  journal_article: <IconNotebook {...TYPE_ICON_PROPS} />,
  book_chapter: <IconBook2 {...TYPE_ICON_PROPS} />,
  conference_paper: <IconPresentation {...TYPE_ICON_PROPS} />,
  preprint: <IconClock {...TYPE_ICON_PROPS} />,
  dissertation: <IconSchool {...TYPE_ICON_PROPS} />,
  review_article: <IconBooks {...TYPE_ICON_PROPS} />,
  technical_report: <IconClipboardText {...TYPE_ICON_PROPS} />,
  other: <IconFile {...TYPE_ICON_PROPS} />,
};

// const MAX_VISIBLE_TOPICS = 4;

export default function LSPublicationReviewItem({
  pub,
  selected,
  onSelectChange,
}: {
  pub: ParsedOpenAlexWork;
  selected: boolean;
  onSelectChange: (checked: boolean) => void;
}) {
  const typeKey = pub.type ?? "other";
  const typeIcon = TYPE_ICONS[typeKey] ?? TYPE_ICONS.other;

  const authorLine = (pub.authors ?? []).join(" · ");

  const date = pub.publicationDate
    ? PUB_DATE_FMT.format(new Date(pub.publicationDate))
    : undefined;

  // const topics = pub.topics ?? [];
  // const visibleTopics = topics.slice(0, MAX_VISIBLE_TOPICS);
  // const topicOverflow = topics.length - visibleTopics.length;

  const doiUrl = pub.doi ? `https://doi.org/${pub.doi}` : null;

  return (
    <Checkbox.Card
      radius="md"
      withBorder
      checked={selected}
      onChange={onSelectChange}
      p="sm"
      style={{
        borderColor: selected
          ? "var(--mantine-color-navy-5)"
          : "var(--mantine-color-gray-3)",
        background: selected ? "var(--mantine-color-blue-0)" : undefined,
      }}
    >
      <Group wrap="nowrap" align="flex-start" gap="sm">
        <Checkbox.Indicator checked={selected} mt={2} color='navy.6' />

        <Stack gap={6} style={{ minWidth: 0, flex: 1 }}>
          {/* Type + title */}
          <Group gap="xs" wrap="nowrap" align="flex-start">
            <Badge
              tt="none"
              bg="indigo.0"
              c="indigo.9"
              fw="500"
              fz="0.7rem"
              lh="1rem"
              leftSection={typeIcon}
              style={{ flexShrink: 0 }}
            >
              {PUBLICATION_TYPE_LABELS[typeKey]}
            </Badge>
          </Group>

          <Text fz="sm" fw="600" c="navy.7" lh="1.4rem" lineClamp={2}>
            {pub.title}
          </Text>

          {/* Authors */}
          {authorLine && (
            <Text fz="xs" c="dimmed" lineClamp={1}>
              {authorLine}
            </Text>
          )}

          {/* Journal + date */}
          {(pub.journal || date) && (
            <Text fz="xs" c="dimmed">
              {pub.journal ?? undefined}
              {pub.journal && date ? " · " : undefined}
              {date}
            </Text>
          )}

          {/* DOI */}
          {doiUrl && (
            <Anchor
              href={doiUrl}
              target="_blank"
              rel="noopener noreferrer"
              c="indigo.8"
              fz="xs"
              onClick={(e) => e.stopPropagation()}
              style={{ display: "inline-flex", alignItems: "center", gap: 4, width: "fit-content" }}
            >
              <IconLink size="0.8rem" color="var(--mantine-color-indigo-8)" />
              doi.org/{pub.doi}
            </Anchor>
          )}

          {/* Topics */}
          {/* {visibleTopics.length > 0 && (
            <Group gap="6" mt={2}>
              {visibleTopics.map((topic) => (
                <Badge
                  key={topic}
                  bg="gray.2"
                  c="var(--mantine-color-text)"
                  fw="500"
                  tt="none"
                  fz="0.7rem"
                >
                  {topic}
                </Badge>
              ))}
              {topicOverflow > 0 && (
                <Text fz="xs" c="dimmed">
                  +{topicOverflow} more
                </Text>
              )}
            </Group>
          )} */}
        </Stack>
      </Group>
    </Checkbox.Card>
  );
}