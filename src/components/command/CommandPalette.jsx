import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { formatRelativeDate } from "@/lib/dates";
import { Search, CornerDownLeft, ArrowUp, ArrowDown, Command as CommandIcon } from "lucide-react";

/**
 * Command palette.
 *
 * Deliberately combines actions and records in one surface. A search box that
 * only finds things makes you search, then navigate, then click; a palette that
 * also runs commands turns "log progress for Maya" into two keystrokes. That is
 * the difference between a search field and a tool someone reaches for daily.
 */

/**
 * Subsequence match with light ranking: earlier matches and matches at word
 * boundaries score higher, so typing "mt" finds "Maya Thompson" ahead of
 * "Assessment".
 */
function fuzzyScore(text, query) {
  if (!query) return 0;
  const haystack = String(text ?? "").toLowerCase();
  const needle = query.toLowerCase();

  const direct = haystack.indexOf(needle);
  if (direct !== -1) {
    // Whole-substring hits always outrank scattered ones.
    return 1000 - direct - (direct > 0 && haystack[direct - 1] !== " " ? 20 : 0);
  }

  let score = 0;
  let cursor = 0;
  for (const char of needle) {
    const found = haystack.indexOf(char, cursor);
    if (found === -1) return -1;
    score += found === 0 || haystack[found - 1] === " " ? 8 : 2;
    score -= (found - cursor) * 0.4;
    cursor = found + 1;
  }
  return score;
}

const GROUP_ORDER = ["Actions", "Students", "Goals", "Recent entries"];

export function CommandPalette({ open, onClose, store, commands = [] }) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const restoreFocusRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement;
    setQuery("");
    setActiveIndex(0);

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const raf = requestAnimationFrame(() => inputRef.current?.focus());

    return () => {
      document.body.style.overflow = overflow;
      cancelAnimationFrame(raf);
      restoreFocusRef.current?.focus?.();
    };
  }, [open]);

  /** Everything selectable, as one flat list plus a group label. */
  const items = useMemo(() => {
    if (!open) return [];

    const out = [];

    commands.forEach(cmd => {
      if (cmd.hidden) return;
      const score = query ? fuzzyScore(`${cmd.label} ${cmd.keywords ?? ""}`, query) : 0;
      if (query && score < 0) return;
      out.push({ ...cmd, group: "Actions", score: score + (cmd.priority ?? 0) });
    });

    if (query) {
      const goalsById = new Map((store?.goals ?? []).map(g => [g.id, g]));
      const studentsById = new Map((store?.students ?? []).map(s => [s.id, s]));

      (store?.students ?? []).forEach(s => {
        const score = fuzzyScore(`${s.name} ${s.grade} ${s.disability}`, query);
        if (score < 0) return;
        out.push({
          id: `student-${s.id}`,
          group: "Students",
          label: s.name,
          hint: [s.grade, s.disability].filter(Boolean).join(" · "),
          score,
          run: () => commands.find(c => c.id === "goto-students")?.run?.(),
        });
      });

      (store?.goals ?? []).forEach(g => {
        const student = studentsById.get(g.studentId);
        const score = fuzzyScore(`${g.area} ${g.description} ${student?.name ?? ""}`, query);
        if (score < 0) return;
        out.push({
          id: `goal-${g.id}`,
          group: "Goals",
          label: g.description || g.area,
          hint: [student?.name, g.area].filter(Boolean).join(" · "),
          score,
          run: () => commands.find(c => c.id === "goto-goals")?.run?.(),
        });
      });

      (store?.logs ?? []).slice(0, 60).forEach(l => {
        const goal = goalsById.get(l.goalId);
        const student = goal ? studentsById.get(goal.studentId) : null;
        const score = fuzzyScore(`${l.notes} ${l.score} ${goal?.area ?? ""} ${student?.name ?? ""}`, query);
        if (score < 0) return;
        out.push({
          id: `log-${l.id}`,
          group: "Recent entries",
          label: `${student?.name ?? "Entry"} — scored ${l.score}`,
          hint: [goal?.area, formatRelativeDate(l.dateISO)].filter(Boolean).join(" · "),
          score,
          run: () => commands.find(c => c.id === "goto-progress")?.run?.(),
        });
      });
    }

    out.sort((a, b) => {
      const g = GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group);
      if (g !== 0) return g;
      return b.score - a.score;
    });

    return out.slice(0, 40);
  }, [open, query, commands, store]);

  useEffect(() => { setActiveIndex(0); }, [query]);

  const runItem = useCallback((item) => {
    if (!item) return;
    onClose?.();
    // Let the dialog unmount before the action moves focus elsewhere.
    requestAnimationFrame(() => item.run?.());
  }, [onClose]);

  const onKeyDown = (e) => {
    if (e.key === "Escape") { e.preventDefault(); onClose?.(); return; }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(i => (items.length ? (i + 1) % items.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(i => (items.length ? (i - 1 + items.length) % items.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      runItem(items[activeIndex]);
    }
  };

  // Keep the highlighted row in view during keyboard navigation. Guarded
  // because scrollIntoView is absent in some environments (jsdom, older
  // embedded webviews) and this is presentation only.
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    if (typeof el?.scrollIntoView === "function") {
      el.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  if (!open) return null;

  let lastGroup = null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[10vh]">
      <div
        className="fixed inset-0 animate-fade-in bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="relative z-10 w-full max-w-xl animate-scale-in overflow-hidden rounded-3xl border bg-popover shadow-float"
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 border-b px-4">
          <Search className="size-4 shrink-0 text-muted-foreground" strokeWidth={2.2} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search students, goals, or type a command…"
            aria-label="Search or run a command"
            aria-controls="command-results"
            className="h-14 flex-1 bg-transparent text-[0.95rem] outline-none placeholder:text-muted-foreground/70"
          />
          <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 font-mono text-2xs font-semibold tracking-normal text-muted-foreground sm:inline-block">
            ESC
          </kbd>
        </div>

        <div
          id="command-results"
          ref={listRef}
          role="listbox"
          className="max-h-[min(26rem,55vh)] overflow-y-auto p-2"
        >
          {items.length === 0 ? (
            <div className="px-3 py-10 text-center">
              <p className="text-sm font-medium">No matches for &ldquo;{query}&rdquo;</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try a student&rsquo;s name, a goal area, or an action like &ldquo;add&rdquo;.
              </p>
            </div>
          ) : (
            items.map((item, i) => {
              const showGroup = item.group !== lastGroup;
              lastGroup = item.group;
              const Icon = item.icon;
              const isActive = i === activeIndex;

              return (
                <React.Fragment key={item.id}>
                  {showGroup && (
                    <div className="px-3 pb-1 pt-3 first:pt-1">
                      <span className="eyebrow">{item.group}</span>
                    </div>
                  )}
                  <div
                    role="option"
                    aria-selected={isActive}
                    data-index={i}
                    onMouseMove={() => setActiveIndex(i)}
                    onClick={() => runItem(item)}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
                      isActive ? "bg-primary-soft text-primary-strong" : "hover:bg-muted"
                    )}
                  >
                    {Icon && (
                      <span
                        className={cn(
                          "grid size-7 shrink-0 place-items-center rounded-lg",
                          isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        )}
                      >
                        <Icon className="size-3.5" strokeWidth={2.2} />
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.label}</p>
                      {item.hint && (
                        <p className="truncate text-xs text-muted-foreground">{item.hint}</p>
                      )}
                    </div>
                    {item.shortcut && (
                      <kbd className="hidden shrink-0 rounded border bg-card px-1.5 py-0.5 font-mono text-2xs font-semibold tracking-normal text-muted-foreground sm:inline-block">
                        {item.shortcut}
                      </kbd>
                    )}
                  </div>
                </React.Fragment>
              );
            })
          )}
        </div>

        <div className="flex items-center gap-4 border-t px-4 py-2.5 text-2xs tracking-normal text-muted-foreground">
          <span className="flex items-center gap-1">
            <ArrowUp className="size-3" /><ArrowDown className="size-3" /> navigate
          </span>
          <span className="flex items-center gap-1">
            <CornerDownLeft className="size-3" /> select
          </span>
          <span className="ml-auto flex items-center gap-1">
            <CommandIcon className="size-3" /> K to reopen
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default CommandPalette;
