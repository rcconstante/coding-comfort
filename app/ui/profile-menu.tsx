"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserCircleIcon,
  Settings01Icon,
  Logout01Icon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons";
import { Spinner } from "./spinner";

export function ProfileMenu({
  name,
  role,
  onSettings,
}: {
  name: string;
  role: string;
  onSettings: () => void;
}) {
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className="profile-control">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          className="profile-trigger"
          disabled={busy}
          aria-label={`${name} profile menu`}
          aria-busy={busy || undefined}
        >
          <span className="profile-avatar">
            {busy ? (
              <Spinner />
            ) : (
              <HugeiconsIcon icon={UserCircleIcon} size={30} />
            )}
          </span>
          <span className="profile-name">
            {name}
            <small>{role}</small>
          </span>
          <HugeiconsIcon icon={ArrowDown01Icon} size={16} />
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="profile-dropdown"
            align="end"
            sideOffset={10}
            collisionPadding={16}
          >
            <DropdownMenu.Label>{name}</DropdownMenu.Label>
            <DropdownMenu.Item onSelect={onSettings}>
              <HugeiconsIcon icon={Settings01Icon} size={19} />
              Settings
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item
              disabled={busy}
              onSelect={async () => {
                setBusy(true);
                setError("");
                try {
                  await signOut();
                  router.replace("/admin/login");
                } catch {
                  setError("Unable to log out. Please try again.");
                } finally {
                  setBusy(false);
                }
              }}
            >
              <HugeiconsIcon icon={Logout01Icon} size={19} />
              Log out
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      {error && (
        <p className="profile-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
