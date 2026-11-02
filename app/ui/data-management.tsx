"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import { RESET_PHRASE, validateCorrectionReason } from "../lib/data-management";
import { calculateResults } from "../lib/dass";
import { validateEvaluation } from "../lib/research-validation";
import { Button } from "./button";

function message(error: unknown) {
  return error instanceof ConvexError && typeof error.data === "string"
    ? error.data
    : "The change could not be saved. Please try again.";
}
function Modal({
  title,
  description,
  children,
  busy = false,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  busy?: boolean;
}) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="modal-overlay" />
      <Dialog.Content
        className="admin-modal"
        onEscapeKeyDown={(event) => {
          if (busy) event.preventDefault();
        }}
        onInteractOutside={(event) => {
          if (busy) event.preventDefault();
        }}
      >
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Description>{description}</Dialog.Description>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
}
export function DataManagement() {
  const status = useQuery(api.dataManagement.status);
  const totals = useQuery(api.research.summary);
  const reset = useMutation(api.dataManagement.reset);
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const resetting = status?.status === "resetting";
  return (
    <section className="surface instrument-editor">
      <h2>Reset pilot research data</h2>
      <p>
        Export any records you need before resetting. This permanently clears
        all participant records, screening submissions, experience responses,
        correction history, and research totals in this deployment.
      </p>
      <p>
        Staff accounts, questionnaire versions, survey settings, security
        limits, and the reset audit log are kept. This does not clear
        participants’ browsers, downloaded Excel files, Google Forms responses,
        or encrypted AI recovery records.
      </p>
      <p>
        After resetting, testers should use End session in their browser before
        starting a fresh test.
      </p>
      {totals && (
        <p>
          {totals.participants} participant records · {totals.screenings}{" "}
          screenings · {totals.evaluations} experience responses
        </p>
      )}
      <p role="status">
        {resetting
          ? `Reset in progress. ${status.deleted} records cleared. Research submissions are temporarily paused.`
          : status?.status === "complete"
            ? "The last reset is complete. Research submissions are available."
            : "No reset is running."}
      </p>
      <Dialog.Root
        open={open}
        onOpenChange={(value) => {
          if (!busy) {
            setOpen(value);
            setConfirmation("");
            setError("");
          }
        }}
      >
        <Dialog.Trigger asChild>
          <Button
            className="pill-button"
            disabled={status === undefined || !totals}
          >
            {resetting ? "Resume reset" : "Reset pilot data"}
          </Button>
        </Dialog.Trigger>
        <Modal
          busy={busy}
          title={
            resetting ? "Resume pilot reset?" : "Permanently reset pilot data?"
          }
          description="This affects all research submissions in this deployment, not just the visible date range. It cannot be undone. Export first if you need a copy."
        >
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              if (confirmation !== RESET_PHRASE || busy) return;
              setBusy(true);
              setError("");
              try {
                await reset({ confirmation });
                setOpen(false);
                setConfirmation("");
              } catch (e) {
                setError(message(e));
              } finally {
                setBusy(false);
              }
            }}
          >
            <label>
              Type {RESET_PHRASE}
              <input
                autoComplete="off"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                disabled={busy}
              />
            </label>
            {error && (
              <p className="field-error" role="alert">
                {error}
              </p>
            )}
            <div className="form-actions">
              <Dialog.Close asChild>
                <Button
                  type="button"
                  className="pill-button pill-secondary"
                  disabled={busy}
                >
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                className="pill-button"
                type="submit"
                disabled={confirmation !== RESET_PHRASE || busy}
              >
                {busy ? "Starting…" : "Confirm reset"}
              </Button>
            </div>
          </form>
        </Modal>
      </Dialog.Root>
    </section>
  );
}
type Editable =
  | { kind: "screenings"; row: Omit<Doc<"screenings">, "submissionKey"> }
  | { kind: "evaluations"; row: Omit<Doc<"evaluations">, "submissionKey"> };
export function EditRecord(props: Editable) {
  const [editing, setEditing] = useState<Editable | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <Dialog.Root
      open={editing !== null}
      onOpenChange={(open) => {
        if (!open && !busy) setEditing(null);
      }}
    >
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="text-button"
          onClick={() => setEditing(props)}
        >
          Edit
        </button>
      </Dialog.Trigger>
      {editing && (
        <Modal
          busy={busy}
          title="Correct submitted record"
          description="Use only for documented data corrections. Scores are recalculated from answers. The previous record and your reason are retained. Browser results and existing exports are not changed."
        >
          <RecordForm
            initial={editing}
            onBusy={setBusy}
            onDone={() => setEditing(null)}
          />
        </Modal>
      )}
    </Dialog.Root>
  );
}
function RecordForm({
  initial,
  onDone,
  onBusy,
}: {
  initial: Editable;
  onDone: () => void;
  onBusy: (value: boolean) => void;
}) {
  const screening = initial.kind === "screenings";
  const row = initial.row;
  const [locale, setLocale] = useState(row.locale);
  const [answers, setAnswers] = useState(
    initial.kind === "screenings" ? [...initial.row.answers] : [],
  );
  const [ratings, setRatings] = useState(
    initial.kind === "evaluations"
      ? [initial.row.ease, initial.row.clarity, initial.row.overall]
      : [],
  );
  const [comment, setComment] = useState(
    initial.kind === "evaluations" ? initial.row.comment : "",
  );
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const editScreening = useMutation(api.dataManagement.editScreening);
  const editEvaluation = useMutation(api.dataManagement.editEvaluation);
  const revisions = useQuery(api.dataManagement.revisions, {
    recordId: row._id,
  });
  const detail = useQuery(
    api.research.screeningDetail,
    initial.kind === "screenings" ? { id: initial.row._id } : "skip",
  );
  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        if (busy) return;
        try {
          validateCorrectionReason(reason);
          if (screening) calculateResults(answers);
          else validateEvaluation(ratings[0], ratings[1], ratings[2], comment);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Check the fields.");
          return;
        }
        setBusy(true);
        onBusy(true);
        setError("");
        try {
          const common = {
            expectedUpdatedAt: row.updatedAt ?? row._creationTime,
            locale,
            reason,
          };
          if (initial.kind === "screenings")
            await editScreening({ ...common, id: initial.row._id, answers });
          else
            await editEvaluation({
              ...common,
              id: initial.row._id,
              ease: ratings[0],
              clarity: ratings[1],
              overall: ratings[2],
              comment,
            });
          onDone();
        } catch (e) {
          setError(message(e));
        } finally {
          setBusy(false);
          onBusy(false);
        }
      }}
    >
      <fieldset disabled={busy}>
        <label>
          Language
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as "en" | "fil")}
          >
            <option value="en">English</option>
            <option value="fil">Filipino</option>
          </select>
        </label>
        {screening ? (
          <div className="record-answer-grid">
            {answers.map((answer, i) => (
              <label key={i}>
                Q{i + 1}
                {detail?.questions && (
                  <span>{detail.questions[locale][i]}</span>
                )}
                <select
                  aria-label={`Answer ${i + 1}`}
                  value={answer}
                  onChange={(e) =>
                    setAnswers(
                      answers.map((a, j) =>
                        j === i ? Number(e.target.value) : a,
                      ),
                    )
                  }
                >
                  {[0, 1, 2, 3].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        ) : (
          <>
            <div className="record-answer-grid">
              {["Ease of use", "Clarity", "Overall experience"].map(
                (label, i) => (
                  <label key={label}>
                    {label}
                    <select
                      value={ratings[i]}
                      onChange={(e) =>
                        setRatings(
                          ratings.map((a, j) =>
                            j === i ? Number(e.target.value) : a,
                          ),
                        )
                      }
                    >
                      {[1, 2, 3, 4, 5].map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </label>
                ),
              )}
            </div>
            <label>
              Comment
              <textarea
                maxLength={2000}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </label>
          </>
        )}
        <label>
          Reason for correction
          <input
            required
            minLength={5}
            maxLength={500}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
      </fieldset>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
      <div className="form-actions">
        <Dialog.Close asChild>
          <Button
            type="button"
            className="pill-button pill-secondary"
            disabled={busy}
          >
            Cancel
          </Button>
        </Dialog.Close>
        <Button type="submit" className="pill-button" disabled={busy}>
          {busy ? "Saving…" : "Save correction"}
        </Button>
      </div>
      <details className="privacy-details correction-history">
        <summary>Correction history</summary>
        {revisions === undefined ? (
          <p>Loading…</p>
        ) : !revisions.length ? (
          <p>No previous corrections.</p>
        ) : (
          revisions.map((revision) => (
            <details key={revision._id}>
              <summary>
                {new Date(revision.createdAt).toISOString()} · {revision.reason}
              </summary>
              <pre>{JSON.stringify(JSON.parse(revision.before), null, 2)}</pre>
            </details>
          ))
        )}
      </details>
    </form>
  );
}
