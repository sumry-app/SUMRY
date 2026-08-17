import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommandPalette } from "../CommandPalette";

const store = {
  students: [
    { id: "s1", name: "Maya Thompson", grade: "3rd Grade", disability: "Specific Learning Disability" },
    { id: "s2", name: "Eli Carter", grade: "5th Grade", disability: "Autism Spectrum Disorder" },
  ],
  goals: [
    { id: "g1", studentId: "s1", area: "Reading", description: "Read 80 words per minute" },
    { id: "g2", studentId: "s2", area: "Communication", description: "Initiate peer interaction" },
  ],
  logs: [
    { id: "l1", goalId: "g1", dateISO: "2026-08-09", score: "65", notes: "Consistent gains" },
  ],
};

let addStudent, gotoGoals, gotoStudents, gotoProgress;

const makeCommands = () => [
  { id: "add-student", label: "Add a student", keywords: "new create", run: addStudent, priority: 6 },
  { id: "goto-goals", label: "Go to Goals", keywords: "objectives", run: gotoGoals, priority: 4 },
  { id: "goto-students", label: "Go to Students", keywords: "roster", run: gotoStudents, priority: 4 },
  { id: "goto-progress", label: "Go to Progress", keywords: "log data", run: gotoProgress, priority: 4 },
];

const setup = (props = {}) =>
  render(
    <CommandPalette
      open
      onClose={props.onClose ?? vi.fn()}
      store={store}
      commands={makeCommands()}
      {...props}
    />
  );

beforeEach(() => {
  addStudent = vi.fn();
  gotoGoals = vi.fn();
  gotoStudents = vi.fn();
  gotoProgress = vi.fn();
});

describe("CommandPalette", () => {
  it("renders nothing while closed", () => {
    render(<CommandPalette open={false} onClose={vi.fn()} store={store} commands={makeCommands()} />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("shows actions before anything is typed, and no records", () => {
    setup();
    expect(screen.getByText("Add a student")).toBeInTheDocument();
    // records should stay out of the way until there is a query
    expect(screen.queryByText("Maya Thompson")).toBeNull();
  });

  it("finds a student by name", async () => {
    const user = userEvent.setup();
    setup();
    await user.type(screen.getByRole("textbox"), "maya");
    expect(screen.getByText("Maya Thompson")).toBeInTheDocument();
    expect(screen.queryByText("Eli Carter")).toBeNull();
  });

  it("matches a goal by its area", async () => {
    const user = userEvent.setup();
    setup();
    await user.type(screen.getByRole("textbox"), "communication");
    expect(screen.getByText("Initiate peer interaction")).toBeInTheDocument();
  });

  it("still matches commands while filtering records", async () => {
    const user = userEvent.setup();
    setup();
    await user.type(screen.getByRole("textbox"), "add");
    expect(screen.getByText("Add a student")).toBeInTheDocument();
  });

  it("matches a command by keyword rather than label", async () => {
    const user = userEvent.setup();
    setup();
    await user.type(screen.getByRole("textbox"), "roster");
    expect(screen.getByText("Go to Students")).toBeInTheDocument();
  });

  it("runs the highlighted item on Enter and closes", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    setup({ onClose });

    await user.type(screen.getByRole("textbox"), "add a student");
    await user.keyboard("{Enter}");

    expect(onClose).toHaveBeenCalled();
    // the action is deferred a frame so focus can settle
    await new Promise(r => requestAnimationFrame(r));
    expect(addStudent).toHaveBeenCalled();
  });

  it("moves the selection with the arrow keys", async () => {
    const user = userEvent.setup();
    setup();
    // jsdom does not run the rAF that autofocuses the input, so place focus
    // where the palette puts it in a real browser.
    screen.getByRole("textbox").focus();

    const options = () => screen.getAllByRole("option");
    expect(options()[0]).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{ArrowDown}");
    expect(options()[0]).toHaveAttribute("aria-selected", "false");
    expect(options()[1]).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{ArrowUp}");
    expect(options()[0]).toHaveAttribute("aria-selected", "true");
  });

  it("wraps around at the ends of the list", async () => {
    const user = userEvent.setup();
    setup();
    screen.getByRole("textbox").focus();
    await user.keyboard("{ArrowUp}");
    const options = screen.getAllByRole("option");
    expect(options[options.length - 1]).toHaveAttribute("aria-selected", "true");
  });

  it("closes on Escape", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    setup({ onClose });
    screen.getByRole("textbox").focus();
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("runs an item when clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    setup({ onClose });

    await user.click(screen.getByText("Go to Goals"));
    expect(onClose).toHaveBeenCalled();
    await new Promise(r => requestAnimationFrame(r));
    expect(gotoGoals).toHaveBeenCalled();
  });

  it("explains an empty result rather than showing a blank panel", async () => {
    const user = userEvent.setup();
    setup();
    await user.type(screen.getByRole("textbox"), "zzzzzzqqq");
    expect(screen.getByText(/no matches for/i)).toBeInTheDocument();
  });

  it("groups results under headings", async () => {
    const user = userEvent.setup();
    setup();
    await user.type(screen.getByRole("textbox"), "reading");
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Goals")).toBeInTheDocument();
  });

  it("is announced as a modal dialog", () => {
    setup();
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-label", "Command palette");
  });

  it("locks background scrolling while open", () => {
    const { unmount } = setup();
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).not.toBe("hidden");
  });

  it("closes when the backdrop is clicked", () => {
    const onClose = vi.fn();
    setup({ onClose });
    const backdrop = document.querySelector('[aria-hidden="true"]');
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });
});
