"use client";
import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import {
  useConvexAuth,
  useQuery,
  useAction,
  useMutation,
  usePaginatedQuery,
} from "convex/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ConvexError } from "convex/values";
import { api } from "../../convex/_generated/api";
import type { Id, Doc } from "../../convex/_generated/dataModel";
import { Button } from "./button";
import { LoadingState, EmptyState } from "./loading-state";
import { DatePicker } from "./date-picker";
import { ProfileMenu } from "./profile-menu";
import { ProfileSettings } from "./profile-settings";
import { subscales } from "../lib/dass";
import {
  validateAccount,
  validateNewPassword,
  validatePasswordChange,
} from "../lib/research-validation";
import { DataManagement, EditRecord } from "./data-management";
import { SurveySettings } from "./survey-settings";
import type { Instrument } from "../lib/instrument";
import logo from "../../public/header-logo.webp";

function errorText(error: unknown) {
  return error instanceof ConvexError && typeof error.data === "string"
    ? error.data
    : "The request could not be completed. Please try again.";
}
function Logo() {
  return (
    <Link href="/" aria-label="Coding Comfort home">
      <Image
        src={logo}
        alt="Coding Comfort"
        width={170}
        height={58}
        priority
        className="admin-logo"
      />
    </Link>
  );
}
function SignOut() {
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <Button
      variant="ghost"
      className="pill-button pill-secondary"
      disabled={busy}
      loading={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await signOut();
          router.replace("/admin/login");
        } finally {
          setBusy(false);
        }
      }}
    >
      Sign out
    </Button>
  );
}
export function AdminLogin() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function login(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const data = new FormData(event.currentTarget);
    try {
      await signIn("password", {
        email: String(data.get("email")).trim().toLowerCase(),
        password: String(data.get("password")),
        flow: "signIn",
      });
      router.replace("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Sign-in failed. Check your credentials or try again later.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="site admin-login">
      <Logo />
      <main className="surface admin-login-card">
        <span className="admin-kicker">Researcher access</span>
        <h1>Welcome back</h1>
        <p>
          Sign in to review consented research submissions and manage Coding
          Comfort.
        </p>
        <form onSubmit={login}>
          <label>
            Email or username
            <input
              name="email"
              autoComplete="username"
              type="text"
              maxLength={254}
              required
            />
          </label>
          <label>
            Password
            <input
              name="password"
              autoComplete="current-password"
              type="password"
              maxLength={128}
              required
            />
          </label>
          {error && (
            <p className="field-error" role="alert">
              {error}
            </p>
          )}
          <Button
            loading={busy}
            type="submit"
            className="pill-button"
            disabled={busy}
          >
            Sign in
          </Button>
        </form>
        <p className="admin-help">
          Accounts are created by an administrator. Contact your administrator
          if you need access or a password reset.
        </p>
        <Link href="/">Back to Coding Comfort</Link>
      </main>
    </div>
  );
}
function PasswordChange({
  account,
  requiredChange = false,
}: {
  account: string;
  requiredChange?: boolean;
}) {
  const change = useAction(api.researchers.changePassword);
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setSuccess("");
    const data = new FormData(form);
    const newPassword = String(data.get("newPassword"));
    const currentPassword = String(data.get("currentPassword"));
    try {
      validatePasswordChange(newPassword, currentPassword, account);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Check your new password.",
      );
      return;
    }
    if (newPassword !== String(data.get("confirmation"))) {
      setError("The new passwords do not match.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await change({
        currentPassword,
        newPassword,
      });
      form.reset();
      setSuccess("Password updated.");
    } catch (error) {
      setError(errorText(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="surface admin-password">
      <h2>{requiredChange ? "Set a private password" : "Change password"}</h2>
      <p>
        {requiredChange
          ? "Replace your temporary password before accessing participant data. "
          : "Choose a new password for your account. "}
        Use 12–128 characters and a password different from your email.
      </p>
      <form onSubmit={submit}>
        <label>
          Current password
          <input
            type="password"
            name="currentPassword"
            autoComplete="current-password"
            required
            maxLength={128}
          />
        </label>
        <label>
          New password
          <input
            type="password"
            name="newPassword"
            autoComplete="new-password"
            minLength={12}
            maxLength={128}
            required
          />
        </label>
        <label>
          Confirm new password
          <input
            type="password"
            name="confirmation"
            autoComplete="new-password"
            minLength={12}
            maxLength={128}
            required
          />
        </label>
        {error && (
          <p role="alert" className="field-error">
            {error}
          </p>
        )}
        <Button
          loading={busy}
          type="submit"
          className="pill-button"
          disabled={busy}
        >
          Update password
        </Button>
        {success && <p role="status">{success}</p>}
      </form>
    </section>
  );
}
export function AdminDashboard() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const me = useQuery(api.researchers.me, isAuthenticated ? {} : "skip");
  const [tab, setTab] = useState("overview");
  if (isLoading || (isAuthenticated && me === undefined))
    return (
      <main className="page-loading">
        <LoadingState label="Researcher access" />
      </main>
    );
  if (!isAuthenticated)
    return (
      <main className="page-loading">
        <Link href="/admin/login">Sign in to continue</Link>
      </main>
    );
  if (!me)
    return (
      <main className="page-loading">
        <div>
          <EmptyState
            title="Access is not available"
            description="Your account does not have active researcher access."
          />
          <SignOut />
        </div>
      </main>
    );
  const tabs = [
    "overview",
    "screenings",
    "feedback",
    ...(me.role === "admin" ? ["questions", "users", "survey"] : []),
  ];
  const activeTab = tabs.includes(tab) || tab === "settings" ? tab : "overview";
  const titles: Record<string, string> = {
    overview: "Dashboard",
    screenings: "Screenings",
    feedback: "Experience",
    questions: "Questionnaire",
    users: "Users",
    survey: "Survey",
  };
  return (
    <div className="site admin-site">
      <header className="admin-header page-width">
        <Logo />
        {!me.mustChangePassword && (
          <nav className="admin-header-nav" aria-label="Research dashboard">
            <ul>
              {tabs.map((key) => (
                <li key={key}>
                  <button
                    type="button"
                    aria-current={activeTab === key ? "page" : undefined}
                    onClick={() => setTab(key)}
                  >
                    {titles[key]}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <ProfileMenu
          name={me.firstName || (me.role === "admin" ? "Admin" : "Researcher")}
          role={me.role === "admin" ? "Administrator" : "Researcher"}
          onSettings={() => setTab("settings")}
        />
      </header>
      <main className="admin-main page-width">
        {me.mustChangePassword ? (
          <>
            <div className="admin-title">
              <h1>Secure your account</h1>
            </div>
            <PasswordChange account={me.account} requiredChange />
          </>
        ) : (
          <ResearchPanel me={me} tab={activeTab} />
        )}
      </main>
    </div>
  );
}

type Researcher = {
  account: string;
  firstName: string;
  role: "admin" | "researcher";
  mustChangePassword: boolean;
};
function ResearchPanel({ me, tab }: { me: Researcher; tab: string }) {
  const titles: Record<string, string> = {
    overview: "Research Dashboard",
    screenings: "Screening Responses",
    feedback: "Experience Responses",
    questions: "Questionnaire",
    users: "Researcher Accounts",
    survey: "External Survey",
    settings: "Settings",
  };
  return (
    <>
      <div className="admin-title">
        <div>
          <span className="admin-kicker">
            Coding Comfort · Research workspace
          </span>
          <h1>{titles[tab]}</h1>
          <p>
            {tab === "settings"
              ? "Manage your profile, password, and pilot data."
              : "Review consented submissions and manage your study."}
          </p>
        </div>
      </div>
      {tab === "overview" ? (
        <Overview />
      ) : tab === "screenings" ? (
        <Records kind="screenings" canEdit={me.role === "admin"} />
      ) : tab === "feedback" ? (
        <Records kind="feedback" canEdit={me.role === "admin"} />
      ) : tab === "settings" ? (
        <div className="admin-settings">
          <ProfileSettings firstName={me.firstName} account={me.account} />
          <PasswordChange account={me.account} />
          {me.role === "admin" && <DataManagement />}
        </div>
      ) : tab === "survey" ? (
        <SurveySettings />
      ) : tab === "questions" ? (
        <QuestionsEditor />
      ) : (
        <Users current={me.account} />
      )}
    </>
  );
}
const levels = ["normal", "mild", "moderate", "severe", "extremelySevere"];
const labels = ["Normal", "Mild", "Moderate", "Severe", "Extremely severe"];
function Overview() {
  const summary = useQuery(api.research.summary);
  if (!summary) return <LoadingState label="Research summary" />;
  return (
    <>
      <div className="admin-metrics">
        {[
          ["Consenting participant sessions", summary.participants],
          ["Completed screenings", summary.screenings],
          ["Evaluations received", summary.evaluations],
          [
            "Average overall experience",
            summary.averages
              ? `${summary.averages.overall.toFixed(1)} / 5`
              : "—",
          ],
        ].map(([label, value]) => (
          <section className="surface admin-metric" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </section>
        ))}
      </div>
      <p className="admin-explanation">
        Participant counts represent pseudonymous, consenting browser sessions,
        not verified unique people. Only submitted research responses are
        included. Screening categories are not clinical diagnoses.
      </p>
      <div className="admin-distributions">
        {subscales.map((key) => (
          <section key={key} className="surface">
            <h2>{key[0].toUpperCase() + key.slice(1)}</h2>
            {levels.map((level, index) => (
              <div key={level} className="distribution-row">
                <span>{labels[index]}</span>
                <strong>{summary.severities[key][index]}</strong>
                <progress
                  value={summary.severities[key][index]}
                  max={Math.max(summary.screenings, 1)}
                  aria-label={`${key} ${labels[index]}`}
                />
              </div>
            ))}
          </section>
        ))}
      </div>
      <section className="surface admin-feedback-summary">
        <h2>Website evaluation</h2>
        {summary.averages ? (
          <div>
            {[
              ["Ease of use", summary.averages.ease],
              ["Clarity", summary.averages.clarity],
              ["Overall", summary.averages.overall],
            ].map(([label, value]) => (
              <p key={label}>
                <span>{label}</span>
                <strong>{Number(value).toFixed(1)} / 5</strong>
              </p>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No experiences yet"
            description="Submitted experience responses will appear here."
          />
        )}
      </section>
    </>
  );
}
function dateFilter(from: string, to: string) {
  return {
    from: from ? Date.parse(`${from}T00:00:00+08:00`) : undefined,
    to: to ? Date.parse(`${to}T23:59:59.999+08:00`) : undefined,
  };
}
function Records({
  kind,
  canEdit,
}: {
  kind: "screenings" | "feedback";
  canEdit: boolean;
}) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const invalid = !!(from && to && from > to);
  async function download() {
    setExporting(true);
    setError("");
    try {
      const params = new URLSearchParams({ kind });
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const response = await fetch(`/api/admin/export?${params}`, {
        cache: "no-store",
      });
      if (!response.ok)
        throw new Error(
          "Export could not be completed. Please narrow the date range or sign in again.",
        );
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = `coding-comfort-${kind}-${new Date().toISOString().slice(0, 10)}.xlsx`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Export failed.");
    } finally {
      setExporting(false);
    }
  }
  return (
    <>
      <div className="surface records-controls">
        <div>
          <DatePicker
            label="From"
            value={from}
            onChange={setFrom}
            max={to || undefined}
          />
          <DatePicker
            label="Through"
            value={to}
            onChange={setTo}
            min={from || undefined}
          />
          <span>Philippine time (UTC+8)</span>
        </div>
        <Button
          loading={exporting}
          className="pill-button"
          disabled={exporting || invalid}
          onClick={download}
        >
          Export Excel
        </Button>
      </div>
      {invalid ? (
        <p className="field-error">
          Choose an end date on or after the start date.
        </p>
      ) : kind === "screenings" ? (
        <ScreeningRecords {...dateFilter(from, to)} canEdit={canEdit} />
      ) : (
        <FeedbackRecords {...dateFilter(from, to)} canEdit={canEdit} />
      )}{" "}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
const formatDate = (timestamp: number) =>
  new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Manila",
  }).format(timestamp);
function ScreeningRecords({
  canEdit,
  ...filters
}: {
  from?: number;
  to?: number;
  canEdit: boolean;
}) {
  const { results, status, loadMore } = usePaginatedQuery(
    api.research.listScreenings,
    filters,
    { initialNumItems: 25 },
  );
  const [expanded, setExpanded] = useState<Id<"screenings"> | null>(null);
  return (
    <section className="surface admin-records">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Participant</th>
              <th>Submitted</th>
              <th>Language</th>
              <th>Depression</th>
              <th>Anxiety</th>
              <th>Stress</th>
              <th>Responses</th>
            </tr>
          </thead>
          <tbody>
            {results.map((row) => (
              <tr key={row._id}>
                <td>
                  {row.participantCode}
                  <small>{row.instrumentVersion}</small>
                </td>
                <td>
                  {formatDate(row.submittedAt)}
                  {row.updatedAt && (
                    <small>Corrected {formatDate(row.updatedAt)}</small>
                  )}
                </td>
                <td>{row.locale.toUpperCase()}</td>
                {subscales.map((key) => (
                  <td key={key}>
                    <strong>{row[key].score} / 42</strong>
                    <span className={`severity severity-${row[key].severity}`}>
                      {labels[levels.indexOf(row[key].severity)]}
                    </span>
                  </td>
                ))}
                <td>
                  <button
                    type="button"
                    className="text-button"
                    onClick={() =>
                      setExpanded(expanded === row._id ? null : row._id)
                    }
                    aria-expanded={expanded === row._id}
                  >
                    {" "}
                    {expanded === row._id ? "Hide" : "View"}
                  </button>
                  {canEdit && <EditRecord kind="screenings" row={row} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {status === "LoadingFirstPage" ? (
        <LoadingState label="Screening responses" />
      ) : !results.length ? (
        <EmptyState
          title="No screening responses yet"
          description="Responses will appear here after participants choose to submit them. You can also try a different date range."
        />
      ) : null}
      {expanded && <ScreeningResponseDetail id={expanded} />}
      {status === "CanLoadMore" || status === "LoadingMore" ? (
        <Button
          loading={status === "LoadingMore"}
          className="pill-button pill-secondary"
          variant="ghost"
          disabled={status === "LoadingMore"}
          onClick={() => loadMore(25)}
        >
          Load more
        </Button>
      ) : null}
    </section>
  );
}
function FeedbackRecords({
  canEdit,
  ...filters
}: {
  from?: number;
  to?: number;
  canEdit: boolean;
}) {
  const { results, status, loadMore } = usePaginatedQuery(
    api.research.listEvaluations,
    filters,
    { initialNumItems: 25 },
  );
  return (
    <section className="surface admin-records">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Participant</th>
              <th>Submitted</th>
              <th>Language</th>
              <th>Ease</th>
              <th>Clarity</th>
              <th>Overall</th>
              <th>Comment</th>
              {canEdit && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {results.map((row) => (
              <tr key={row._id}>
                <td>{row.participantCode}</td>
                <td>
                  {formatDate(row.submittedAt)}
                  {row.updatedAt && (
                    <small>Corrected {formatDate(row.updatedAt)}</small>
                  )}
                </td>
                <td>{row.locale.toUpperCase()}</td>
                <td>{row.ease} / 5</td>
                <td>{row.clarity} / 5</td>
                <td>{row.overall} / 5</td>
                <td className="feedback-comment">{row.comment || "—"}</td>
                {canEdit && (
                  <td>
                    <EditRecord kind="evaluations" row={row} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {status === "LoadingFirstPage" ? (
        <LoadingState label="Experience responses" />
      ) : !results.length ? (
        <EmptyState
          title="No experience responses yet"
          description="Responses will appear here after participants complete the experience questionnaire. You can also try a different date range."
        />
      ) : null}
      {status === "CanLoadMore" || status === "LoadingMore" ? (
        <Button
          loading={status === "LoadingMore"}
          className="pill-button pill-secondary"
          variant="ghost"
          disabled={status === "LoadingMore"}
          onClick={() => loadMore(25)}
        >
          Load more
        </Button>
      ) : null}
    </section>
  );
}
function QuestionsEditor() {
  const instrument = useQuery(api.instruments.current);
  const history = useQuery(api.instruments.history);
  return (
    <>
      {instrument ? (
        <InstrumentEditor key={instrument.version} initial={instrument} />
      ) : instrument === undefined ? (
        <LoadingState label="Questionnaire" />
      ) : (
        <EmptyState
          title="No questionnaire available"
          description="The study questionnaire has not been published yet."
        />
      )}
      {history && (
        <p className="admin-explanation">
          Recent published versions: {history.length}. Previous screening
          submissions keep their original questionnaire version.
        </p>
      )}
    </>
  );
}
function InstrumentEditor({ initial }: { initial: Instrument }) {
  const publish = useMutation(api.instruments.publish);
  const [draft, setDraft] = useState(() => structuredClone(initial));
  const [approved, setApproved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function save(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const version = await publish({
        questions: draft.questions,
        options: draft.options,
        approved,
      });
      setMessage(`Published ${version}.`);
    } catch (error) {
      setMessage(errorText(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="surface instrument-editor" onSubmit={save}>
      <h2>Questionnaire wording</h2>
      <p>
        Current version: <strong>{initial.version}</strong>. Publishing creates
        a new version. Existing responses are never rewritten. The 21-item
        order, 0–3 response values, and subscale scoring cannot be changed here.
      </p>
      <div className="admin-warning">
        Changing a standardized questionnaire may affect validity. Publish only
        wording that has been reviewed and approved by the research team.
      </div>
      {Array.from({ length: 21 }, (_, index) => (
        <fieldset key={index}>
          <legend>Question {index + 1}</legend>
          <div className="question-editor-pair">
            {(["en", "fil"] as const).map((locale) => (
              <label key={locale}>
                {locale === "en" ? "English" : "Filipino"}
                <textarea
                  required
                  maxLength={1000}
                  rows={3}
                  value={draft.questions[locale][index]}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      questions: {
                        ...draft.questions,
                        [locale]: draft.questions[locale].map((value, i) =>
                          i === index ? event.target.value : value,
                        ),
                      },
                    })
                  }
                />
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <h3>Response wording · values stay 0–3</h3>
      {[0, 1, 2, 3].map((index) => (
        <fieldset key={index}>
          <legend>Response {index}</legend>
          <div className="question-editor-pair">
            {(["en", "fil"] as const).map((locale) => (
              <label key={locale}>
                {locale === "en" ? "English" : "Filipino"}
                <input
                  required
                  maxLength={1000}
                  value={draft.options[locale][index]}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      options: {
                        ...draft.options,
                        [locale]: draft.options[locale].map((value, i) =>
                          i === index ? event.target.value : value,
                        ),
                      },
                    })
                  }
                />
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <label className="consent-agree">
        <input
          type="checkbox"
          required
          checked={approved}
          onChange={(event) => setApproved(event.target.checked)}
        />
        I have verified that this wording is approved for use by the research
        team.
      </label>
      <div className="form-actions">
        <Button
          loading={busy}
          className="pill-button"
          disabled={busy || !approved}
          type="submit"
        >
          Publish new version
        </Button>
      </div>
      {message && <p role="status">{message}</p>}
    </form>
  );
}
function Users({ current }: { current: string }) {
  const {
    results: list,
    status,
    loadMore,
  } = usePaginatedQuery(api.researchers.list, {}, { initialNumItems: 25 });
  const create = useAction(api.researchers.create);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function add(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    setMessage("");
    try {
      const account = validateAccount(String(data.get("account")));
      const password = String(data.get("password"));
      validateNewPassword(password, account);
      await create({
        account,
        password,
        role: data.get("role") === "admin" ? "admin" : "researcher",
      });
      form.reset();
      setMessage(
        "Account created. Share its temporary password securely. A password change is required before data access.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : errorText(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <form className="surface user-create" onSubmit={add}>
        <h2>Add a researcher</h2>
        <p>
          Researchers can review and export submissions. Administrators can also
          manage users and publish question wording.
        </p>
        <div className="user-create-fields">
          <label>
            Email or username
            <input
              type="text"
              name="account"
              maxLength={254}
              autoComplete="off"
              required
            />
          </label>
          <label>
            Temporary password
            <input
              type="password"
              name="password"
              minLength={12}
              maxLength={128}
              autoComplete="new-password"
              required
            />
          </label>
          <label>
            Role
            <select name="role" defaultValue="researcher">
              <option value="researcher">Researcher</option>
              <option value="admin">Administrator</option>
            </select>
          </label>
          <Button
            loading={busy}
            type="submit"
            className="pill-button"
            disabled={busy}
          >
            Create account
          </Button>
        </div>
        {message && <p role="status">{message}</p>}
      </form>
      <section className="surface admin-users">
        <h2>Researcher accounts</h2>
        {status !== "LoadingFirstPage" ? (
          list.map((user) => (
            <UserRow
              key={user._id}
              user={user}
              self={user.account === current}
            />
          ))
        ) : (
          <LoadingState label="Researcher accounts" />
        )}
        {(status === "CanLoadMore" || status === "LoadingMore") && (
          <Button
            loading={status === "LoadingMore"}
            variant="ghost"
            className="pill-button pill-secondary"
            disabled={status === "LoadingMore"}
            onClick={() => loadMore(25)}
          >
            Load more accounts
          </Button>
        )}
      </section>
    </>
  );
}
function UserRow({ user, self }: { user: Doc<"researchers">; self: boolean }) {
  const update = useMutation(api.researchers.updateAccess);
  const [role, setRole] = useState(user.role);
  const [active, setActive] = useState(user.active);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className="user-row">
      <div>
        <strong>{user.account}</strong>
        <span>
          {user.mustChangePassword
            ? "Password change required"
            : user.active
              ? "Active"
              : "Disabled"}
          {self ? " · You" : ""}
        </span>
      </div>
      <label>
        <span className="sr-only">Role for {user.account}</span>
        <select
          disabled={self || busy}
          value={role}
          onChange={(event) =>
            setRole(event.target.value as "admin" | "researcher")
          }
        >
          <option value="researcher">Researcher</option>
          <option value="admin">Administrator</option>
        </select>
      </label>
      <label className="user-active">
        <input
          type="checkbox"
          checked={active}
          disabled={self || busy}
          onChange={(event) => setActive(event.target.checked)}
        />
        Active
      </label>
      <Button
        loading={busy}
        variant="ghost"
        className="pill-button pill-secondary"
        disabled={
          self || busy || (role === user.role && active === user.active)
        }
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            await update({ id: user._id, role, active });
          } catch (error) {
            setError(errorText(error));
          } finally {
            setBusy(false);
          }
        }}
      >
        Save access
      </Button>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function ScreeningResponseDetail({ id }: { id: Id<"screenings"> }) {
  const data = useQuery(api.research.screeningDetail, { id });
  return (
    <div className="response-detail">
      <h2>Submitted answers</h2>
      {data ? (
        <>
          <p>
            Questionnaire version: {data.version}. Responses are scored 0–3.
          </p>
          <ol>
            {data.answers.map((answer, index) => (
              <li key={index}>
                <span>
                  Q{index + 1} ·{" "}
                  {data.questions?.[data.locale][index] ??
                    "Wording unavailable"}
                </span>
                <strong>{answer}</strong>
              </li>
            ))}
          </ol>
        </>
      ) : data === undefined ? (
        <LoadingState label="Submitted answers" />
      ) : (
        <EmptyState title="Record no longer available" />
      )}
    </div>
  );
}
