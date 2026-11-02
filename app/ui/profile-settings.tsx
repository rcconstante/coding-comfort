"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "./button";
import { validateFirstName } from "../lib/research-validation";

export function ProfileSettings({
  firstName,
  account,
}: {
  firstName: string;
  account: string;
}) {
  const save = useMutation(api.researchers.updateProfile);
  const [draft, setDraft] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  return (
    <section className="surface settings-section">
      <div className="settings-section-heading">
        <span className="admin-kicker">Your account</span>
        <h2>Profile</h2>
        <p>{account}</p>
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          let value: string;
          try {
            value = validateFirstName(draft ?? firstName);
          } catch (error) {
            setStatus(
              error instanceof Error ? error.message : "Check your name.",
            );
            return;
          }
          setBusy(true);
          setStatus("");
          try {
            await save({ firstName: value });
            setDraft(null);
            setStatus("Profile saved.");
          } catch {
            setStatus("Your profile could not be saved. Please try again.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          First name
          <input
            autoComplete="given-name"
            maxLength={60}
            value={draft ?? firstName}
            required
            onChange={(e) => {
              setDraft(e.target.value);
              setStatus("");
            }}
            disabled={busy}
          />
        </label>
        <Button type="submit" className="pill-button" loading={busy}>
          Save profile
        </Button>
        <p role="status">{status}</p>
      </form>
    </section>
  );
}
