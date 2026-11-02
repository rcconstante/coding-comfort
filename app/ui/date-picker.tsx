"use client";

import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { DayPicker } from "react-day-picker";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar03Icon, ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { parsePickerDate } from "../lib/calendar";

export function DatePicker({
  value,
  onChange,
  label,
  min,
  max,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  min?: string;
  max?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = parsePickerDate(value);
  const minimum = min ? parsePickerDate(min) : undefined;
  const maximum = max ? parsePickerDate(max) : undefined;
  return (
    <div className="date-field">
      <span>{label}</span>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger
          className="date-trigger"
          aria-label={`${label}: ${selected ? selected.toLocaleDateString("en-PH", { dateStyle: "medium" }) : "Choose date"}`}
        >
          <HugeiconsIcon icon={Calendar03Icon} size={20} />
          <span>
            {selected
              ? selected.toLocaleDateString("en-PH", { dateStyle: "medium" })
              : "Choose date"}
          </span>
          <HugeiconsIcon icon={ArrowDown01Icon} size={16} />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            className="date-popover"
            sideOffset={8}
            align="start"
            collisionPadding={16}
            aria-label={`${label} calendar`}
          >
            <DayPicker
              mode="single"
              selected={selected}
              defaultMonth={selected ?? minimum}
              showOutsideDays
              disabled={[
                ...(minimum ? [{ before: minimum }] : []),
                ...(maximum ? [{ after: maximum }] : []),
              ]}
              onSelect={(date) => {
                if (date) {
                  onChange(
                    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
                  );
                  setOpen(false);
                }
              }}
            />
            <button
              type="button"
              className="date-clear"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              Clear date
            </button>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
