"use client";

import * as Select from "@radix-ui/react-select";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, Tick02Icon } from "@hugeicons/core-free-icons";

export function DurationSelect({ value, disabled, label, minute, minutes, onChange }: {
  value: number;
  disabled: boolean;
  label: string;
  minute: string;
  minutes: string;
  onChange: (seconds: number) => void;
}) {
  return (
    <Select.Root value={String(value)} disabled={disabled} onValueChange={(value) => onChange(Number(value))}>
      <Select.Trigger className="duration-trigger" aria-label={label}>
        <Select.Value />
        <Select.Icon><HugeiconsIcon icon={ArrowDown01Icon} size={18} /></Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="duration-menu" position="popper" sideOffset={8} collisionPadding={16}>
          <Select.Viewport>
            {[60, 120, 180, 300].map((seconds) => (
              <Select.Item key={seconds} className="duration-option" value={String(seconds)}>
                <Select.ItemText>{seconds / 60} {seconds === 60 ? minute : minutes}</Select.ItemText>
                <Select.ItemIndicator><HugeiconsIcon icon={Tick02Icon} size={18} /></Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
