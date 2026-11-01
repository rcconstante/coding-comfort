import { NextRequest, NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import { ConvexError } from "convex/values";
import { createHmac } from "node:crypto";
import { api } from "../../../convex/_generated/api";
export async function POST(request: NextRequest) {
  const headers = { "Cache-Control": "no-store" };
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return NextResponse.json(
      { error: "Request not allowed." },
      { status: 403, headers },
    );
  const secret = process.env.REFLECTION_GATE_SECRET;
  if (!secret)
    return NextResponse.json(
      { error: "Reflection is unavailable." },
      { status: 503, headers },
    );
  try {
    // Bound streamed bodies as well as requests carrying Content-Length.
    const reader = request.body?.getReader();
    if (!reader) throw new Error("Invalid");
    let bytes = 0;
    const chunks: Uint8Array[] = [];
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 4096) {
        await reader.cancel();
        return NextResponse.json(
          { error: "Request too large." },
          { status: 413, headers },
        );
      }
      chunks.push(value);
    }
    const body = JSON.parse(Buffer.concat(chunks).toString("utf8")) as Record<
      string,
      unknown
    >;
    if (
      typeof body.submissionKey !== "string" ||
      typeof body.publicKey !== "string" ||
      typeof body.scores !== "object" ||
      !body.scores ||
      body.consent !== true ||
      typeof body.consentVersion !== "string"
    )
      throw new Error("Invalid");
    const scores = body.scores as Record<string, unknown>;
    if (
      !["depression", "anxiety", "stress"].every(
        (k) =>
          typeof scores[k] === "number" &&
          Number.isInteger(scores[k]) &&
          Number(scores[k]) >= 0 &&
          Number(scores[k]) <= 42 &&
          Number(scores[k]) % 2 === 0,
      )
    )
      throw new Error("Invalid");
    const address = process.env.VERCEL
      ? (request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        "unknown")
      : "local-development";
    await fetchMutation(api.reflection.request, {
      submissionKey: body.submissionKey,
      publicKey: body.publicKey,
      scores: {
        depression: Number(scores.depression),
        anxiety: Number(scores.anxiety),
        stress: Number(scores.stress),
      },
      consent: true,
      consentVersion: body.consentVersion,
      gateSecret: secret,
      clientHash: createHmac("sha256", secret).update(address).digest("hex"),
    });
    return NextResponse.json({ accepted: true }, { status: 202, headers });
  } catch (error) {
    const limited =
      error instanceof ConvexError && error.data === "REFLECTION_LIMIT";
    return NextResponse.json(
      {
        error: limited
          ? "Please try again later."
          : "Reflection could not be started.",
      },
      { status: limited ? 429 : 400, headers },
    );
  }
}
