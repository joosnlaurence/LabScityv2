import {
  Modal,
  Stack,
  Group,
  TextInput,
  Textarea,
  Autocomplete,
  TagsInput,
  Select,
  Button,
  Loader,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { useAuthContext } from "@/components/auth/auth-provider";
import { useUserProfile } from "@/components/profile/use-profile";
import { updateProfileAction } from "@/lib/actions/profile";
import { profileKeys } from "@/lib/query-keys";
import { useEffect, useMemo, useState } from "react";
import { SCIENCE_CATEGORIES, SKILL_OPTIONS } from "@/lib/constants/options";
import {
  updateProfileSchema,
  type UpdateProfileValues,
} from "@/lib/validations/profile";
import { useDebouncedValue } from "@mantine/hooks";
import { useLocationSearch } from "./use-location-search";

interface EditProfileFormValues {
  firstName: string;
  lastName: string;
  about: string;
  workplace: string;
  occupation: string;
  labDepartment: string;
  location: string;
  timezone: string;
  researchAreas: string[];
  skill: string[];
}

function profileToEditValues(profile: any): UpdateProfileValues {
  return {
    firstName: profile?.first_name ?? "",
    lastName: profile?.last_name ?? "",
    about: profile?.about ?? "",
    workplace: profile?.workplace ?? "",
    occupation: profile?.occupation ?? "",
    labDepartment: profile?.lab_department ?? "",
    location: profile?.location ?? "",
    timezone: profile?.timezone ?? "",
    researchAreas: profile?.research_interests ?? [],
    skill: profile?.skills ?? [],
  };
}

function toFormDefaults(v: UpdateProfileValues): EditProfileFormValues {
  return {
    firstName: v.firstName ?? "",
    lastName: v.lastName ?? "",
    about: v.about ?? "",
    workplace: v.workplace ?? "",
    occupation: v.occupation ?? "",
    labDepartment: v.labDepartment ?? "",
    location: v.location ?? "",
    timezone: v.timezone ?? "",
    researchAreas: v.researchAreas ?? [],
    skill: v.skill ?? [],
  };
}

export interface LSEditProfileModalProps {
  opened: boolean;
  onClose: () => void;
}

export function LSEditProfileModal({ opened, onClose }: LSEditProfileModalProps) {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const { data: profile } = useUserProfile(user?.id ?? "", {
    enabled: !!user?.id,
  });

  const initialValues = useMemo(() => profileToEditValues(profile), [profile]);

  const updateMutation = useMutation({
    mutationFn: async (values: UpdateProfileValues) => {
      const res = await updateProfileAction(values);
      if (!res.success) throw new Error(res.error ?? "Failed to update profile");
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: profileKeys.user(user?.id ?? ""),
      });
      onClose();
    },
    onError: (err) =>
      notifications.show({
        title: "Could not update profile",
        message: err instanceof Error ? err.message : "Something went wrong",
        color: "red",
      }),
  });

  const form = useForm<EditProfileFormValues>({
    mode: "uncontrolled",
    initialValues: toFormDefaults(initialValues),
  });

  useEffect(() => {
    if (opened) {
      const next = toFormDefaults(initialValues);
      form.setInitialValues(next);
      form.setValues(next);
      form.clearErrors();
    }
  }, [opened, initialValues]);

  const handleSubmit = form.onSubmit((values) => {
    const result = updateProfileSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join(".");
        if (!(path in fieldErrors)) fieldErrors[path] = issue.message;
      }
      form.setErrors(fieldErrors);
      return;
    }
    form.clearErrors();
    updateMutation.mutate(result.data);
  });

  const timezones = useMemo(() => {
    try {
      const now = new Date();
      return Intl.supportedValuesOf("timeZone")
        .map((tz) => {
          const offsetStr =
            new Intl.DateTimeFormat("en-US", {
              timeZone: tz,
              timeZoneName: "shortOffset",
            })
              .formatToParts(now)
              .find((p) => p.type === "timeZoneName")?.value ?? "GMT+0";

          const match = offsetStr.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
          const offsetMinutes = match
            ? (match[1] === "-" ? -1 : 1) *
              (parseInt(match[2]) * 60 + parseInt(match[3] ?? "0"))
            : 0;

          return {
            value: tz,
            label: `${tz.replace(/_/g, " ")} (${offsetStr})`,
            offsetMinutes,
          };
        })
        .sort((a, b) => a.offsetMinutes - b.offsetMinutes);
    } catch {
      return [];
    }
  }, []);

  const [locationSearch, setLocationSearch] = useState("");
  const [debouncedLocation] = useDebouncedValue(locationSearch, 500);
  const { data: locationResults, isFetching: isLocationFetching } = useLocationSearch(debouncedLocation);

  const locationOptions = useMemo(
    () => (locationResults ?? []).map((r) => r.display_name),
    [locationResults],
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Edit Profile"
      centered
      size="lg"
      yOffset="5vh"
      styles={{ body: { maxHeight: "calc(100vh - 200px)", overflowY: "auto" } }}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap={12}>
          <Group grow>
            <TextInput
              withAsterisk
              label="First Name"
              key={form.key("firstName")}
              {...form.getInputProps("firstName")}
            />
            <TextInput
              withAsterisk
              label="Last Name"
              key={form.key("lastName")}
              {...form.getInputProps("lastName")}
            />
          </Group>

          <Textarea
            label="About"
            placeholder="Tell others about yourself..."
            description="Max 256 characters"
            key={form.key("about")}
            {...form.getInputProps("about")}
          />

          <Autocomplete
            label="Institution / Workplace"
            placeholder="Select or type..."
            data={[
              "University of Central Florida",
              "University of Florida",
              "Harvard",
              "School of Rock",
            ]}
            key={form.key("workplace")}
            {...form.getInputProps("workplace")}
          />

          <Autocomplete
            label="Occupation"
            placeholder="Select or type..."
            data={["Researcher", "Professor", "PhD Student", "Engineer"]}
            key={form.key("occupation")}
            {...form.getInputProps("occupation")}
          />

          <TextInput
            label="Lab / Department"
            placeholder="e.g. Computer Science and AI Laboratory"
            key={form.key("labDepartment")}
            {...form.getInputProps("labDepartment")}
          />

          <Autocomplete
            label="Location"
            placeholder="Search for a city or place..."
            data={locationOptions}
            rightSection={isLocationFetching ? <Loader size="xs" /> : null}
            onChangeCapture={(e) => setLocationSearch(e.currentTarget.value)}
            key={form.key("location")}
            {...form.getInputProps("location")}
          />

          <Select
            label="Time Zone"
            placeholder="Select your time zone"
            data={timezones}
            searchable
            clearable
            nothingFoundMessage="No matching time zone"
            key={form.key("timezone")}
            {...form.getInputProps("timezone")}
          />

          <TagsInput
            label="Research Areas"
            placeholder="Select or type your research areas..."
            data={[...SCIENCE_CATEGORIES]}
            key={form.key("researchAreas")}
            {...form.getInputProps("researchAreas")}
          />

          <TagsInput
            label="Your Skills"
            placeholder="Select or type your own..."
            data={[...SKILL_OPTIONS]}
            key={form.key("skill")}
            {...form.getInputProps("skill")}
          />

          <Button type="submit" loading={updateMutation.isPending}>
            Save
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}