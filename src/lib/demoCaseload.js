import { defaultConfigFor, normalizeGoalConfig, measurementTypeOf } from "@/lib/progress/measurement";

/**
 * A sample caseload for the demo build.
 *
 * Why this exists: reaching any screen in this app requires a Supabase project
 * and a signed-in account, so a reviewer opening a preview URL, or a teacher
 * being shown the product for the first time, sees a configuration screen
 * instead of the product. Demo mode renders the real interface against these
 * records instead, with no network access at all.
 *
 * Two rules make it trustworthy as a demonstration:
 *
 * 1. The dates are relative to today, not fixed. A caseload pinned to specific
 *    calendar dates goes stale: the "no recent check" student eventually has no
 *    recent check by years, and every goal reads as off track. These records
 *    keep the same shape whenever they are generated.
 * 2. It deliberately spans every verdict the analysis engine can reach - on
 *    track, off track, no recent data, and not enough data - because telling
 *    those four cases apart is the whole point of the product. A demo in which
 *    every student is on track demonstrates nothing.
 *
 * None of this is real student data. It is generated, and the UI says so.
 */

/**
 * An ISO date `offsetDays` before now (negative for the future), as
 * YYYY-MM-DD in local time - the same shape an <input type="date"> produces and
 * the same shape rowToLog slices out of the database.
 */
function dayISO(now, offsetDays) {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offsetDays);
  const pad = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const STUDENTS = [
  { id: "demo-student-maya", name: "Maya Thompson", grade: "4", disability: "Specific Learning Disability" },
  { id: "demo-student-aisha", name: "Aisha Bello", grade: "3", disability: "Other Health Impairment" },
  { id: "demo-student-diego", name: "Diego Ramos", grade: "5", disability: "Speech or Language Impairment" },
  { id: "demo-student-ethan", name: "Ethan Cole", grade: "K", disability: "Autism" },
];

/**
 * Every goal below is written the way an IEP writes one: a condition, the
 * student's name, the observable behaviour, and the criterion. `startDaysAgo` is
 * days ago and `endInDays` is days from now, so the aim line has a real
 * service window to run across. `d` on each log is days ago too.
 */
const GOALS = [
  {
    id: "demo-goal-maya-reading",
    studentId: "demo-student-maya",
    area: "Reading",
    description:
      "Given a 1-minute timed reading of grade-level text, Maya will read 90 words correct per minute with 95% accuracy across three consecutive probes.",
    baseline: "42 words per minute",
    target: "90 words per minute",
    metric: "words per minute",
    measurementType: "rate",
    measurementConfig: { rateUnit: "words per minute" },
    startDaysAgo: 149,
    endInDays: 121,
    // Rising, but well behind what the aim line needs. This is the case the
    // product exists to catch: a goal that looks like progress and is not
    // enough progress.
    logs: [
      { d: 149, v: 45, context: "1:1, quiet room", evidenceNote: "running record, probe 1-1" },
      { d: 135, v: 47, context: "small group, classroom" },
      { d: 121, v: 46, context: "1:1, quiet room" },
      { d: 107, v: 50, context: "small group, classroom", evidenceNote: "running record, probe 1-4" },
      { d: 93, v: 49, context: "1:1, quiet room", accommodationsUsed: ["extended time"] },
      { d: 79, v: 52, context: "small group, classroom" },
      { d: 65, v: 51, context: "1:1, quiet room", evidenceNote: "running record, probe 1-7" },
      { d: 51, v: 53, context: "small group, classroom" },
      { d: 37, v: 52, context: "1:1, quiet room", accommodationsUsed: ["extended time"] },
      { d: 23, v: 55, context: "small group, classroom", evidenceNote: "running record, probe 1-10" },
      { d: 9, v: 56, context: "1:1, quiet room" },
    ],
  },
  {
    id: "demo-goal-maya-comprehension",
    studentId: "demo-student-maya",
    area: "Reading",
    description: "Maya will answer literal and inferential comprehension questions with 80% accuracy.",
    baseline: "50%",
    target: "80%",
    metric: "%",
    measurementType: "percent",
    startDaysAgo: 149,
    endInDays: 121,
    logs: [
      { d: 149, v: 50, context: "small group", evidenceNote: "comprehension probe, 5 questions" },
      { d: 135, v: 52, context: "small group" },
      { d: 121, v: 55, context: "small group" },
      { d: 107, v: 58, context: "small group", evidenceNote: "comprehension probe, 5 questions" },
      { d: 93, v: 60, context: "small group" },
      { d: 79, v: 63, context: "small group" },
      { d: 65, v: 67, context: "small group", evidenceNote: "comprehension probe, 5 questions" },
      { d: 51, v: 70, context: "small group" },
      { d: 37, v: 76, context: "small group" },
      { d: 23, v: 76, context: "small group", evidenceNote: "comprehension probe, 5 questions" },
      { d: 9, v: 78, context: "small group" },
    ],
  },
  {
    id: "demo-goal-aisha-social",
    studentId: "demo-student-aisha",
    area: "Social Skills",
    description:
      "Aisha will initiate a peer interaction during unstructured time with 80% success across five observed opportunities.",
    baseline: "45%",
    target: "80%",
    metric: "%",
    measurementType: "percent",
    startDaysAgo: 130,
    endInDays: 95,
    // Flat, then nothing for forty days. Documented monitoring is itself part
    // of the IEP, so silence is a finding, not a gap in the record.
    logs: [
      { d: 110, v: 45, context: "recess, unstructured" },
      { d: 96, v: 46, context: "recess, unstructured" },
      { d: 82, v: 47, context: "lunch, unstructured" },
      { d: 68, v: 46, context: "recess, unstructured" },
      { d: 54, v: 48, context: "recess, unstructured" },
      { d: 40, v: 48, context: "lunch, unstructured", evidenceNote: "tally of initiations, 5 opportunities" },
    ],
  },
  {
    id: "demo-goal-aisha-writing",
    studentId: "demo-student-aisha",
    area: "Writing",
    description:
      "Aisha will write a four-sentence paragraph with correct capitalisation and punctuation in 4 of 5 trials.",
    baseline: "55%",
    target: "85%",
    metric: "%",
    measurementType: "percent",
    startDaysAgo: 130,
    endInDays: 95,
    logs: [
      { d: 110, v: 58, context: "small group, writing block" },
      { d: 82, v: 64, context: "small group, writing block" },
      { d: 54, v: 71, context: "independent, classroom" },
      { d: 26, v: 79, context: "independent, classroom" },
      { d: 6, v: 84, context: "independent, classroom", evidenceNote: "writing sample, filed" },
    ],
  },
  {
    id: "demo-goal-diego-math",
    studentId: "demo-student-diego",
    area: "Math",
    description:
      "Given a mixed set of two-digit addition problems, Diego will solve 4 of 5 correctly without a number line across three consecutive sessions.",
    baseline: "2 of 5",
    target: "4 of 5",
    metric: "% correct",
    measurementType: "trials",
    measurementConfig: { trialTotal: 5 },
    startDaysAgo: 42,
    endInDays: 80,
    // Two points is not a trend, and the report says so rather than drawing a
    // line through them. Both sit below the target, so the verdict is "not
    // enough data" rather than "met" - which is the case a caseload board has
    // to be able to show, because it is the one a teacher must act on by
    // collecting more data.
    logs: [
      { d: 42, v: 40, rawValue: "2 of 5", context: "resource room, 1:1" },
      { d: 20, v: 60, rawValue: "3 of 5", context: "resource room, 1:1" },
    ],
  },
  {
    id: "demo-goal-ethan-behavior",
    studentId: "demo-student-ethan",
    area: "Behavior",
    description:
      "Ethan will transition between activities with 2 or fewer adult prompts per transition, across a 5-transition observation.",
    baseline: "6 prompts",
    target: "2 prompts",
    metric: "prompts per transition",
    // A goal where less is better. The analysis engine reads direction from the
    // goal, so a falling line is progress here and would be failure elsewhere.
    measurementType: "frequency",
    measurementConfig: { direction: "decrease", frequencyUnit: "prompts" },
    startDaysAgo: 100,
    endInDays: 60,
    logs: [
      { d: 96, v: 6, context: "classroom routine, 5 transitions" },
      { d: 82, v: 5, context: "classroom routine, 5 transitions" },
      { d: 68, v: 6, context: "classroom routine, 5 transitions" },
      { d: 54, v: 4, context: "classroom routine, 5 transitions" },
      { d: 40, v: 4, context: "classroom routine, 5 transitions" },
      { d: 26, v: 3, context: "classroom routine, 5 transitions" },
      { d: 12, v: 2, context: "classroom routine, 5 transitions", accommodationsUsed: ["visual schedule"] },
    ],
  },
];

/**
 * Builds the demo store in the same shape the Supabase mappers produce, so
 * every screen, chart and report treats it exactly like stored data.
 * `now` is injectable so the sample caseload can be generated at a fixed point
 * in time.
 */
export function buildDemoStore(now = new Date()) {
  const students = STUDENTS.map(s => ({ ...s, createdAt: dayISO(now, 200) }));

  const goals = [];
  const logs = [];

  for (const goal of GOALS) {
    const type = measurementTypeOf(goal.measurementType);

    goals.push({
      id: goal.id,
      studentId: goal.studentId,
      area: goal.area,
      description: goal.description,
      baseline: goal.baseline,
      target: goal.target,
      metric: goal.metric,
      measurementType: type,
      // Normalised through the app's own helper, so the demo cannot drift from
      // what the goal form actually stores.
      measurementConfig: normalizeGoalConfig({
        ...defaultConfigFor(type),
        ...(goal.measurementConfig ?? {}),
      }),
      startDate: dayISO(now, goal.startDaysAgo),
      // Negative offset because dayISO counts backwards from today.
      targetDate: dayISO(now, -goal.endInDays),
      status: "active",
      aiGenerated: false,
      createdAt: dayISO(now, goal.startDaysAgo),
    });

    goal.logs.forEach((entry, index) => {
      logs.push({
        id: `${goal.id}-log-${index + 1}`,
        goalId: goal.id,
        dateISO: dayISO(now, entry.d),
        // Stored as a string, exactly as rowToLog returns it.
        score: String(entry.v),
        // The teacher's own words are kept beside the parsed score, so "4 of 5"
        // survives even though the trendline reads 80.
        rawValue: entry.rawValue ?? null,
        measurementType: type,
        context: entry.context ?? "",
        evidenceNote: entry.evidenceNote ?? "",
        accommodationsUsed: entry.accommodationsUsed ?? [],
        notes: entry.notes ?? "",
      });
    });
  }

  return {
    version: 1,
    lastUpdated: now.toISOString(),
    students,
    goals,
    logs,
  };
}

/** The signed-in identity used in demo mode; there is no account behind it. */
export const DEMO_AUTH = {
  status: "signedIn",
  session: { user: { id: "demo-user", email: "demo@sumry.app" } },
  user: { id: "demo-user", email: "demo@sumry.app" },
  profile: { name: "Demo Caseload", organization: "Sample District" },
  displayName: "Demo Caseload",
  organization: "Sample District",
};
