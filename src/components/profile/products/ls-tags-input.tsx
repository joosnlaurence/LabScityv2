"use client";

import { TagValue } from "@/lib/types/data";
import {
  Combobox,
  Divider,
  Loader,
  Pill,
  PillsInput,
  ScrollArea,
  Text,
  useCombobox,
} from "@mantine/core";
import { useMemo } from "react";

export interface LSTagsInputProps {
  value: TagValue[];
  onChange: (next: TagValue[]) => void;
  results: { id: number; name: string }[];
  searchValue: string;
  debouncedSearchValue: string;
  onSearchChange: (q: string) => void;
  isFetching?: boolean;
  max?: number;
  label?: string;
  error?: React.ReactNode;
  allowCustom?: boolean;
}

export function LSTagsInput({
  value,
  onChange,
  results,
  searchValue,
  debouncedSearchValue,
  onSearchChange,
  isFetching,
  max = 3,
  label = "Topics",
  error,
  allowCustom = false,
}: LSTagsInputProps) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const trimmed = searchValue.trim();
  const atMax = value.length >= max;

  const isSettled = searchValue === debouncedSearchValue && !isFetching;

  const takenIds = useMemo(
    () => new Set(value.filter((t) => t.id !== null).map((t) => t.id)),
    [value],
  );
  const takenNames = useMemo(
    () => new Set(value.map((t) => t.name.toLowerCase())),
    [value],
  );

  const options = results
    .filter((r) => !takenIds.has(r.id))
    .map((r) => (
      <Combobox.Option value={String(r.id)} key={r.id}>
        {r.name}
      </Combobox.Option>
    ));

  const hasExactMatch =
    takenNames.has(trimmed.toLowerCase()) ||
    results.some((r) => r.name.toLowerCase() === trimmed.toLowerCase());
  const canCreate =
    allowCustom && trimmed.length >= 2 && isSettled && !hasExactMatch && !atMax;

  const handleSubmit = (optionValue: string) => {
    if (atMax) {
      combobox.closeDropdown();
      return;
    }

    if (optionValue === "$create") {
      onChange([...value, { id: null, name: trimmed }]);
      onSearchChange("");
      combobox.closeDropdown();
      return;
    }

    const found = results.find((r) => String(r.id) === optionValue);
    if (found) {
      onChange([...value, { id: found.id, name: found.name }]);
    }
    onSearchChange("");
    combobox.closeDropdown();
  };

  const remove = (target: TagValue) =>
    onChange(value.filter((t) => !(t.id === target.id && t.name === target.name)));

  return (
    <Combobox store={combobox} onOptionSubmit={handleSubmit} shadow="md">
      <Combobox.DropdownTarget>
        <PillsInput
          label={label}
          error={error}
          rightSection={
            isFetching ? <Loader size="xs" /> : (
              <Text fz="xs" c="dimmed" pr={4}>{value.length}/{max}</Text>
            )
          }
          onClick={() => combobox.openDropdown()}
        >
          <Pill.Group>
            {value.map((tag) => (
              <Pill
                key={tag.id ?? `custom:${tag.name}`}
                withRemoveButton
                onRemove={() => remove(tag)}
                styles={{
                  root: {
                    background:
                      tag.id === null
                        ? "var(--mantine-color-gray-1)"
                        : "var(--mantine-color-gray-2)",
                    color: "var(--mantine-color-primary)",
                  },
                }}
              >
                {tag.name}
              </Pill>
            ))}

            <Combobox.EventsTarget>
              <PillsInput.Field
                value={searchValue}
                disabled={atMax}
                placeholder={atMax ? "Topic limit reached" : "Research Topics"}
                onFocus={() => combobox.openDropdown()}
                onBlur={() => combobox.closeDropdown()}
                onChange={(e) => {
                  combobox.openDropdown();
                  combobox.updateSelectedOptionIndex();
                  onSearchChange(e.currentTarget.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !searchValue && value.length) {
                    e.preventDefault();
                    remove(value[value.length - 1]);
                  }
                }}
              />
            </Combobox.EventsTarget>
          </Pill.Group>
        </PillsInput>
      </Combobox.DropdownTarget>

      <Combobox.Dropdown>
        <Combobox.Options>
          <ScrollArea.Autosize mah={220} type="scroll">
            {options.length > 0 ? (
              options
            ) : (
              <Combobox.Empty>
                {trimmed.length < 2
                  ? "Type to search topics"
                  : !isSettled
                    ? "Searching…"
                    : "No matching topics found..."}
              </Combobox.Empty>
            )}
          </ScrollArea.Autosize>

          {canCreate && (
            <>
              <Divider />
              <Combobox.Option value="$create">
                <Text fz="sm">
                  + Add <b>“{trimmed}”</b> as a custom topic
                </Text>
              </Combobox.Option>
            </>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}