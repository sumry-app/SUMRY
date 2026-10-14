import { describe, it, expect } from "vitest";

import { MEASUREMENT_TYPES as MAPPED_TYPES } from "../../supabaseMappers";
import {
  MEASUREMENT_TYPES,
  MEASUREMENT_META,
  coerceDirectionFallback,
  defaultConfigFor,
  describeMeasurement,
  formatGoalPoint,
  formatMeasurement,
  formatRecorded,
  goalDirection,
  goalValue,
  inferMeasurementType,
  measurementMeta,
  measurementTypeOf,
  normalizeGoalConfig,
  parseMeasurement,
  progressRatio,
} from "../measurement";

describe("measurement types", () => {
  it("recognises every declared type and nothing else", () => {
    MEASUREMENT_TYPES.forEach(type => {
      expect(measurementTypeOf(type)).toBe(type);
      expect(MEASUREMENT_META[type]).toBeTruthy();
    });
    expect(measurementTypeOf("nonsense")).toBe("percent");
    expect(measurementTypeOf(null)).toBe("percent");
    expect(measurementTypeOf("  TRIALS ")).toBe("trials");
  });

  it("gives every type the metadata the goal form needs", () => {
    MEASUREMENT_TYPES.forEach(type => {
      const meta = measurementMeta(type);
      expect(meta.label).toBeTruthy();
      expect(meta.hint).toBeTruthy();
      expect(meta.placeholder).toBeTruthy();
      expect(Number.isFinite(meta.decimals)).toBe(true);
    });
  });
});

describe("parseMeasurement", () => {
  it("reads trials as a fraction and stores percent correct", () => {
    const parsed = parseMeasurement("4 of 5", "trials");
    expect(parsed.ok).toBe(true);
    expect(parsed.value).toBe(4);
    expect(parsed.score).toBe(80);
    expect(parsed.display).toBe("4 of 5 (80%)");
  });

  it("accepts the other ways a teacher writes trials", () => {
    expect(parseMeasurement("4/5", "trials").score).toBe(80);
    expect(parseMeasurement("7 of 10", "trials").score).toBe(70);
    expect(parseMeasurement("3 out of 4", "trials").score).toBe(75);
  });

  it("treats a bare number on a trials goal as percent correct", () => {
    const parsed = parseMeasurement("80", "trials");
    expect(parsed.ok).toBe(true);
    expect(parsed.score).toBe(80);
  });

  it("refuses trials that cannot be true", () => {
    expect(parseMeasurement("5 of 4", "trials").ok).toBe(false);
    expect(parseMeasurement("0 of 0", "trials").ok).toBe(false);
    expect(parseMeasurement("", "trials").ok).toBe(false);
  });

  it("holds a percent inside 0..100", () => {
    expect(parseMeasurement("85%", "percent").score).toBe(85);
    expect(parseMeasurement("85", "percent").score).toBe(85);
    expect(parseMeasurement("120", "percent").ok).toBe(false);
    expect(parseMeasurement("-5", "percent").ok).toBe(false);
  });

  it("reads rates, durations and rubric scores", () => {
    expect(parseMeasurement("72 words per minute", "rate").score).toBe(72);
    expect(parseMeasurement("12 minutes", "duration").score).toBe(12);
    expect(parseMeasurement("3", "rubric", { rubricScale: 4 }).score).toBe(3);
    expect(parseMeasurement("5", "rubric", { rubricScale: 4 }).ok).toBe(false);
  });

  it("never throws on junk and always explains itself", () => {
    const parsed = parseMeasurement("afraid", "percent");
    expect(parsed.ok).toBe(false);
    expect(parsed.error).toBeTruthy();
    expect(parsed.score).toBeNull();
  });

  it("takes the first number out of a noisy reading", () => {
    expect(parseMeasurement("about 64 wpm on Tuesday", "rate").score).toBe(64);
  });
});

describe("formatMeasurement", () => {
  it("prints each type in its own unit", () => {
    expect(formatMeasurement(85, "percent")).toBe("85%");
    expect(formatMeasurement(80, "trials")).toBe("80% correct");
    expect(formatMeasurement(72.5, "rate", { rateUnit: "wpm" })).toBe("72.5 wpm");
    expect(formatMeasurement(12, "duration")).toBe("12 min");
    expect(formatMeasurement(3, "rubric", { rubricScale: 4 })).toBe("3/4 pts");
    expect(formatMeasurement(6, "frequency")).toBe("6 times");
    expect(formatMeasurement(2, "level")).toBe("Level 2");
  });

  it("returns an empty string rather than NaN for missing values", () => {
    expect(formatMeasurement(null, "percent")).toBe("");
    expect(formatMeasurement(undefined, "rate")).toBe("");
    expect(formatMeasurement("abc", "percent")).toBe("");
  });
});

describe("formatRecorded", () => {
  it("prefers what the teacher actually typed", () => {
    const goal = { measurementType: "trials" };
    expect(formatRecorded({ rawValue: "4 of 5", score: "80", measurementType: "trials" }, goal)).toBe("4 of 5 (80%)");
  });

  it("falls back to the stored score for rows recorded before rawValue existed", () => {
    const goal = { measurementType: "percent" };
    expect(formatRecorded({ score: "85" }, goal)).toBe("85%");
  });
});

describe("normalizeGoalConfig", () => {
  it("keeps only known keys and drops empties", () => {
    const config = normalizeGoalConfig({
      trialTotal: 5,
      rateUnit: "wpm",
      nonsense: "dropped",
      direction: "increase",
      rubricScale: "",
      frequencyUnit: null,
    });
    expect(config).toEqual({ trialTotal: 5, rateUnit: "wpm", direction: "increase" });
  });

  it("returns an empty object, never null", () => {
    expect(normalizeGoalConfig(null)).toEqual({});
    expect(normalizeGoalConfig(undefined)).toEqual({});
    expect(normalizeGoalConfig("nope")).toEqual({});
  });

  it("rejects a direction the analysis cannot use", () => {
    expect(normalizeGoalConfig({ direction: "sideways" })).toEqual({});
  });
});

describe("goalDirection", () => {
  it("assumes improvement means a bigger number, except for prompt level", () => {
    expect(goalDirection({ measurementType: "percent" })).toBe("increase");
    expect(goalDirection({ measurementType: "level" })).toBe("decrease");
  });

  it("lets the goal override the default", () => {
    expect(goalDirection({ measurementType: "frequency", measurementConfig: { direction: "decrease" } })).toBe(
      "decrease"
    );
  });
});

describe("goalValue and formatGoalPoint", () => {
  it("puts a trials target on the percent-correct scale", () => {
    const goal = { measurementType: "trials", baseline: "2 of 5", target: "4 of 5" };
    expect(goalValue(goal, "baseline")).toBe(40);
    expect(goalValue(goal, "target")).toBe(80);
    expect(formatGoalPoint(goal, "target")).toBe("4 of 5 (80%)");
  });

  it("returns null when there is nothing readable", () => {
    expect(goalValue({ target: "" }, "target")).toBeNull();
    expect(goalValue(null, "target")).toBeNull();
  });
});

describe("progressRatio", () => {
  it("maps baseline to 0 and target to 1", () => {
    expect(progressRatio(40, 40, 80)).toBe(0);
    expect(progressRatio(80, 40, 80)).toBe(1);
    expect(progressRatio(60, 40, 80)).toBe(0.5);
  });

  it("goes negative below baseline and past 1 beyond target", () => {
    expect(progressRatio(20, 40, 80)).toBe(-0.5);
    expect(progressRatio(100, 40, 80)).toBe(1.5);
  });

  it("understands goals where the number should come down", () => {
    expect(progressRatio(6, 10, 2, "decrease")).toBe(0.5);
    expect(progressRatio(2, 10, 2, "decrease")).toBe(1);
    expect(progressRatio(12, 10, 2, "decrease")).toBe(-0.25);
  });

  it("refuses to divide by a baseline that equals the target", () => {
    expect(progressRatio(5, 5, 5)).toBeNull();
    expect(progressRatio(null, 5, 10)).toBeNull();
  });
});

describe("inferMeasurementType", () => {
  it("reads the type out of the free text older goals were written in", () => {
    expect(inferMeasurementType({ targetDescription: "4 of 5 trials" })).toBe("trials");
    expect(inferMeasurementType({ targetDescription: "85% accuracy" })).toBe("percent");
    expect(inferMeasurementType({ targetDescription: "90", metricUnit: "words correct per minute" })).toBe("rate");
    expect(inferMeasurementType({ targetDescription: "20", metricUnit: "minutes" })).toBe("duration");
    expect(inferMeasurementType({ targetDescription: "3", metricUnit: "rubric points" })).toBe("rubric");
    expect(inferMeasurementType({})).toBe("percent");
  });
});

describe("describeMeasurement", () => {
  it("names the unit a report should print", () => {
    expect(describeMeasurement({ measurementType: "rate", measurementConfig: { rateUnit: "wpm" } })).toBe("wpm");
    expect(describeMeasurement({ measurementType: "rubric", measurementConfig: { rubricScale: 4 } })).toBe(
      "Rubric score (0-4)"
    );
    expect(describeMeasurement({ measurementType: "percent" })).toBe("Percent");
  });
});

describe("defaultConfigFor", () => {
  it("starts a prompt-level goal going down and everything else going up", () => {
    expect(defaultConfigFor("level").direction).toBe("decrease");
    expect(defaultConfigFor("percent").direction).toBe("increase");
    expect(defaultConfigFor("trials").trialTotal).toBe(5);
  });
});

describe("coerceDirectionFallback", () => {
  it("is exported for the goal form's default", () => {
    expect(coerceDirectionFallback("decrease")).toBe("decrease");
    expect(coerceDirectionFallback("nonsense")).toBe("increase");
  });
});

/**
 * This module deliberately keeps its own copy of the type list so it has no
 * database dependency. That is only safe while the two copies agree, so the
 * agreement is asserted rather than assumed.
 */
describe("measurement types agree with the database layer", () => {
  it("lists exactly what supabaseMappers will accept and store", () => {
    expect([...MEASUREMENT_TYPES].sort()).toEqual([...MAPPED_TYPES].sort());
  });
});
