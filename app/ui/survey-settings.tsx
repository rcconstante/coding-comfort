"use client";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { validateSurveyUrl } from "../lib/survey";
import { Button } from "./button";

export function SurveySettings() {
  const current = useQuery(api.survey.current);
  const save = useMutation(api.survey.save);
  const [draft, setDraft] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="surface instrument-editor"
      onSubmit={async (event) => {
        event.preventDefault();
        let url: string;
        try {
          url = validateSurveyUrl(draft ?? current ?? "");
        } catch {
          setStatus(
            "Enter a public Google Forms response link without extra parameters.",
          );
          return;
        }
        setBusy(true);
        setStatus("");
        try {
          await save({ url });
          setStatus(url ? "Survey link saved." : "External survey hidden.");
        } catch {
          setStatus("The survey link could not be saved. Please try again.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <h2>External survey</h2>
      <p>
        Save the study team’s published Google Forms response link. Leave blank
        to hide it. External responses are stored in Google Forms, separate from
        this dashboard.
      </p>
      <label>
        Google Forms URL
        <input
          type="url"
          maxLength={2048}
          value={draft ?? current ?? ""}
          disabled={current === undefined || busy}
          onChange={(e) => {
            setDraft(e.target.value);
            setStatus("");
          }}
        />
      </label>
      <p>
        Check the form’s access, consent wording, and email collection settings
        before saving. Do not paste an editing link or a prefilled link
        containing participant information.
      </p>
      <Button
        className="pill-button"
        disabled={busy || current === undefined}
        type="submit"
      >
        {busy ? "Saving…" : "Save survey link"}
      </Button>
      <p role="status">{status}</p>
    </form>
  );
}
