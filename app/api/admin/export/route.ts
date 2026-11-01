import { NextRequest, NextResponse } from "next/server";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import writeXlsxFile, {
  type Sheet,
  type SheetData,
} from "write-excel-file/node";
import type { FunctionReturnType } from "convex/server";
import { api } from "../../../../convex/_generated/api";
import {
  safeSpreadsheetText,
  isCalendarDate,
} from "../../../lib/research-validation";

const privateHeaders = { "Cache-Control": "private, no-store" };

export const maxDuration = 60;
export async function GET(request: NextRequest) {
  const token = await convexAuthNextjsToken();
  if (!token)
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401, headers: privateHeaders },
    );
  try {
    const user = await fetchQuery(api.researchers.me, {}, { token });
    if (!user || user.mustChangePassword)
      return NextResponse.json(
        { error: "Researcher access required." },
        { status: 403, headers: privateHeaders },
      );
    const kind = request.nextUrl.searchParams.get("kind");
    if (kind !== "screenings" && kind !== "feedback")
      return NextResponse.json(
        { error: "Choose screenings or feedback." },
        { status: 400, headers: privateHeaders },
      );
    const fromText = request.nextUrl.searchParams.get("from");
    const toText = request.nextUrl.searchParams.get("to");
    if (
      [fromText, toText].some(
        (value) => value !== null && !isCalendarDate(value),
      )
    )
      return NextResponse.json({ error: "Invalid dates." }, { status: 400, headers: privateHeaders });
    const from = fromText
        ? Date.parse(`${fromText}T00:00:00+08:00`)
        : undefined,
      to = toText ? Date.parse(`${toText}T23:59:59.999+08:00`) : Date.now();
    if (
      (from !== undefined && !Number.isFinite(from)) ||
      (to !== undefined && !Number.isFinite(to)) ||
      (from !== undefined && to !== undefined && from > to)
    )
      return NextResponse.json(
        { error: "Invalid date range." },
        { status: 400, headers: privateHeaders },
      );
    type ExportSheet = {
      name: string;
      columns: { header: string; key: string; width: number }[];
      rows: Record<string, string | number>[];
    };
    const sheet: ExportSheet = {
      name: kind === "screenings" ? "Screening results" : "Website evaluations",
      columns: [],
      rows: [],
    };
    const worksheets: ExportSheet[] = [sheet];
    sheet.columns =
      kind === "screenings"
        ? [
            { header: "Participant code", key: "participantCode", width: 20 },
            { header: "Submitted at (UTC)", key: "submittedAt", width: 28 },
            { header: "Language", key: "locale", width: 12 },
            {
              header: "Questionnaire version",
              key: "instrumentVersion",
              width: 28,
            },
            { header: "Consent version", key: "consentVersion", width: 30 },
            ...["depression", "anxiety", "stress"].flatMap((key) => [
              { header: `${key} raw (0-21)`, key: `${key}Raw`, width: 22 },
              { header: `${key} final (0-42)`, key: `${key}Score`, width: 22 },
              { header: `${key} category`, key: `${key}Severity`, width: 22 },
            ]),
            ...Array.from({ length: 21 }, (_, i) => ({
              header: `Q${i + 1} (0-3)`,
              key: `q${i + 1}`,
              width: 13,
            })),
          ]
        : [
            { header: "Participant code", key: "participantCode", width: 20 },
            { header: "Submitted at (UTC)", key: "submittedAt", width: 28 },
            { header: "Language", key: "locale", width: 12 },
            { header: "Ease of use (1-5)", key: "ease", width: 22 },
            { header: "Clarity (1-5)", key: "clarity", width: 22 },
            { header: "Overall experience (1-5)", key: "overall", width: 27 },
            { header: "Comment", key: "comment", width: 65 },
            { header: "Consent version", key: "consentVersion", width: 30 },
          ];
    let cursor: string | null = null;
    let done = false;
    let count = 0;
    const versions = new Set<string>();
    while (!done) {
      if (kind === "screenings") {
        const page: FunctionReturnType<typeof api.research.listScreenings> =
          await fetchQuery(
            api.research.listScreenings,
            { from, to, paginationOpts: { numItems: 200, cursor } },
            { token },
          );
        for (const row of page.page) {
          count++;
          if (count > 20000) throw new Error("EXPORT_LIMIT");
          versions.add(row.instrumentVersion);
          sheet.rows.push({
            participantCode: row.participantCode,
            submittedAt: new Date(row.submittedAt).toISOString(),
            locale: row.locale,
            instrumentVersion: row.instrumentVersion,
            consentVersion: row.consentVersion,
            ...Object.fromEntries(
              (["depression", "anxiety", "stress"] as const).flatMap((key) => [
                [`${key}Raw`, row[key].raw],
                [`${key}Score`, row[key].score],
                [`${key}Severity`, row[key].severity],
              ]),
            ),
            ...Object.fromEntries(
              row.answers.map((value, index) => [`q${index + 1}`, value]),
            ),
          });
        }
        cursor = page.continueCursor;
        done = page.isDone;
      } else {
        const page: FunctionReturnType<typeof api.research.listEvaluations> =
          await fetchQuery(
            api.research.listEvaluations,
            { from, to, paginationOpts: { numItems: 200, cursor } },
            { token },
          );
        for (const row of page.page) {
          count++;
          if (count > 20000) throw new Error("EXPORT_LIMIT");
          sheet.rows.push({
            participantCode: row.participantCode,
            submittedAt: new Date(row.submittedAt).toISOString(),
            locale: row.locale,
            ease: row.ease,
            clarity: row.clarity,
            overall: row.overall,
            comment: safeSpreadsheetText(row.comment),
            consentVersion: row.consentVersion,
          });
        }
        cursor = page.continueCursor;
        done = page.isDone;
      }
    }
    if (versions.size) {
      if (versions.size > 100) throw new Error("EXPORT_LIMIT");
      const instruments = await fetchQuery(
        api.research.exportInstruments,
        { versions: [...versions] },
        { token },
      );
      const dictionary: ExportSheet = {
        name: "Questionnaire versions",
        columns: [],
        rows: [],
      };
      worksheets.push(dictionary);
      dictionary.columns = [
        { header: "Version", key: "version", width: 28 },
        { header: "Item", key: "item", width: 12 },
        { header: "English wording", key: "en", width: 70 },
        { header: "Filipino wording", key: "fil", width: 70 },
      ];
      for (const instrument of instruments) {
        if (!instrument) continue;
        instrument.questions.en.forEach((text, index) =>
          dictionary.rows.push({
            version: instrument.version,
            item: `Q${index + 1}`,
            en: safeSpreadsheetText(text),
            fil: safeSpreadsheetText(instrument.questions.fil[index]),
          }),
        );
        instrument.options.en.forEach((text, index) =>
          dictionary.rows.push({
            version: instrument.version,
            item: `Response ${index}`,
            en: safeSpreadsheetText(text),
            fil: safeSpreadsheetText(instrument.options.fil[index]),
          }),
        );
      }
    }
    const notes: SheetData = [
      ["Coding Comfort research export"],
      ["Generated at (UTC)", new Date().toISOString()],
      ["Rows", count],
      [
        "Participant codes identify consenting browser sessions, not verified unique people.",
      ],
      [
        "DASS-21 scores describe symptoms reported over the past week and are not diagnoses.",
      ],
      [
        "Each raw subscale sum is doubled. Scores remain separate; no combined total is calculated.",
      ],
      [
        "Date filters use Philippine time (UTC+8); submitted timestamps in this workbook are UTC.",
      ],
      [
        "Website feedback uses a 1–5 experience rating and is not a clinical assessment.",
      ],
    ];
    const sheets: Sheet<Buffer>[] = worksheets.map((worksheet) => ({
      sheet: worksheet.name,
      columns: worksheet.columns.map((column) => ({ width: column.width })),
      stickyRowsCount: 1,
      data: [
        worksheet.columns.map((column) => ({
          value: column.header,
          fontWeight: "bold",
          backgroundColor: "#713C99",
          color: "#FFFFFF",
        })),
        ...worksheet.rows.map((row) =>
          worksheet.columns.map((column) => {
            const value = row[column.key] ?? "";
            return typeof value === "number"
              ? { type: Number, value }
              : { type: String, value: safeSpreadsheetText(value) };
          }),
        ),
      ],
    }));
    sheets.push({
      sheet: "Read me",
      data: notes,
      columns: [{ width: 95 }, { width: 35 }],
    });
    const buffer = await writeXlsxFile(sheets).toBuffer();
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="coding-comfort-${kind}.xlsx"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error && error.message === "EXPORT_LIMIT"
            ? "Use a narrower date range (maximum 20,000 rows and 100 questionnaire versions per export)."
            : "Export could not be completed.",
      },
      { status: 400, headers: privateHeaders },
    );
  }
}
