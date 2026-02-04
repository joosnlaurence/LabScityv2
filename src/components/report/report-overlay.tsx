"use client";

import { useEffect } from "react";
import { Button, Group, Select, Stack, Text, Textarea } from "@mantine/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createReportSchema, type CreateReportValues } from "@/lib/validations/post";
import classes from "./report-overlay.module.css";

interface ReportOverlayProps {
  open: boolean;
  title: string;
  preview: React.ReactNode;
  onClose: () => void;
  onSubmit: (values: CreateReportValues) => void | Promise<void>;
}

const REPORT_OPTIONS = [
  "Harassment/Hate",
  "Spam/Scam",
  "Violence/Harm",
  "Sexual Content",
  "Misinformation",
  "Impersonation/Stolen Intellectual Property",
  "Other",
] as const;

export function ReportOverlay({ open, title, preview, onClose, onSubmit }: ReportOverlayProps) {
  const {
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<CreateReportValues>({
    resolver: zodResolver(createReportSchema),
    mode: "onChange",
    defaultValues: {
      type: "",
      reason: "",
    },
  });

  const reportType = watch("type");

  useEffect(() => {
    if (!open) {
      reset({ type: "", reason: "" });
    }
  }, [open, reset]);

  if (!open) return null;

  return (
    <div className={classes.overlay}>
      <div className={classes.panel}>
        <Text className={classes.title}>{title}</Text>
        {preview}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap="sm">
            <Select
              label="Report type"
              data={[...REPORT_OPTIONS]}
              placeholder="Select a report type"
              value={reportType || ""}
              onChange={(value) =>
                setValue("type", (value ?? "") as CreateReportValues["type"], {
                  shouldValidate: true,
                })
              }
              error={errors.type?.message}
              allowDeselect
            />
            <Textarea
              label="Describe your report"
              placeholder="Provide details about the issue..."
              minRows={3}
              error={errors.reason?.message}
              {...register("reason")}
            />
            <Group justify="flex-end">
              <Button variant="default" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={!isValid || isSubmitting} loading={isSubmitting}>
                Submit
              </Button>
            </Group>
          </Stack>
        </form>
      </div>
    </div>
  );
}
