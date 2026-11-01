"use client";

import { useEffect, useId, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Menu01Icon } from "@hugeicons/core-free-icons";
import type { Locale } from "../lib/copy";

export function HeaderNavigation({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const id = useId();
  const title = locale === "fil" ? "Pangunahing nabigasyon" : "Main navigation";
  const openLabel = locale === "fil" ? "Buksan ang menu" : "Open menu";
  const closeLabel = locale === "fil" ? "Isara ang menu" : "Close menu";

  useEffect(() => {
    if (!open) return;
    function dismiss(event: Event) {
      if (
        event.target instanceof Node &&
        !container.current?.contains(event.target)
      )
        setOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    }
    const desktop = window.matchMedia("(min-width: 1200px)");
    const resize = () => {
      if (desktop.matches) setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("focusin", dismiss);
    document.addEventListener("keydown", escape);
    desktop.addEventListener("change", resize);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("focusin", dismiss);
      document.removeEventListener("keydown", escape);
      desktop.removeEventListener("change", resize);
    };
  }, [open]);

  return (
    <div ref={container} className="header-navigation" data-open={open}>
      <button
        ref={toggle}
        type="button"
        className="menu-toggle"
        aria-label={open ? closeLabel : openLabel}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        <HugeiconsIcon
          icon={open ? Cancel01Icon : Menu01Icon}
          size={22}
          aria-hidden="true"
        />
      </button>
      <nav
        id={id}
        className="header-nav"
        aria-label={title}
        onClick={(event) => {
          if (
            event.target instanceof Element &&
            event.target.closest("a[href]")
          )
            setOpen(false);
        }}
      >
        {children}
      </nav>
    </div>
  );
}
