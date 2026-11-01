import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import {
  SessionProvider,
  updateSession,
  useSession,
} from "../app/lib/use-session.ts";

test("shared session hydration never includes private browser state in server markup", () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: { setItem() {} },
  });
  try {
    updateSession({
      consent: true,
      phase: "intro",
      journal: "PRIVATE_JOURNAL_SENTINEL",
    });
    function Probe() {
      const { session, ready } = useSession();
      return createElement(
        "span",
        null,
        ready ? session.journal : "unhydrated",
      );
    }
    const html = renderToString(
      createElement(SessionProvider, null, createElement(Probe)),
    );
    assert.equal(html, "<span>unhydrated</span>");
    assert.ok(!html.includes("PRIVATE_JOURNAL_SENTINEL"));
  } finally {
    if (previous) Object.defineProperty(globalThis, "localStorage", previous);
    else delete globalThis.localStorage;
  }
});
