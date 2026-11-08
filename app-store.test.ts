import { describe, expect, it } from "vitest";
import { applyQuizAnswer } from "../lib/game-logic";
import { snakes } from "../lib/snakes";
import { isAppData } from "../lib/validation";

const validData = {
  schemaVersion: 1 as const,
  hasOnboarded: false,
  welcomeVisible: true,
  tasks: [
    {
      id: "task-1",
      title: "อ่านประวัติเขางู",
      category: "เรียนรู้",
      status: "open",
      createdAt: "2026-11-07T00:00:00.000Z",
      reminder: "none",
      reminderStatus: "none",
    },
  ],
  xp: 0,
  hatchProgress: 0,
  unlockedSnakeIds: ["python-burmese"],
  learnedLessonIds: [],
  settings: {
    displayName: "นักสำรวจ",
    largeText: false,
    reduceMotion: false,
    offlineDemo: false,
    notificationsEnabled: false,
  },
};

describe("learning progress", () => {
  it("adds XP and hatches the next companion after five correct answers", () => {
    let state = {
      xp: 0,
      hatchProgress: 0,
      unlockedSnakeIds: ["python-burmese"],
    };
    let hatchedId: string | null = null;
    for (let i = 0; i < 5; i += 1) {
      const result = applyQuizAnswer(
        state,
        true,
        ["python-burmese", "python-reticulated", "vine-snake"],
        [],
        () => 0,
      );
      state = result.state;
      hatchedId = result.hatchedId;
    }
    expect(state.xp).toBe(50);
    expect(state.hatchProgress).toBe(0);
    expect(state.unlockedSnakeIds).toEqual([
      "python-burmese",
      "python-reticulated",
    ]);
    expect(hatchedId).toBe("python-reticulated");
  });

  it("does not change progress or XP after a wrong answer", () => {
    const before = { ...validData, hatchProgress: 3, xp: 20 };
    const result = applyQuizAnswer(before, false, [
      "python-burmese",
      "vine-snake",
    ]);
    expect(result.state).toEqual(before);
    expect(result.hatchedId).toBeNull();
  });

  it("provides 24 unique color variants, including six secret colors", () => {
    expect(snakes).toHaveLength(24);
    expect(new Set(snakes.map((snake) => snake.id)).size).toBe(24);
    expect(snakes.filter((snake) => snake.isSecret)).toHaveLength(6);
    expect(snakes.some((snake) => snake.id === "python-burmese")).toBe(true);
  });

  it("randomly chooses an unowned regular variant without duplicates", () => {
    const values = [0.99, 0.99];
    const result = applyQuizAnswer(
      {
        xp: 40,
        hatchProgress: 4,
        unlockedSnakeIds: ["python-burmese"],
      },
      true,
      ["python-burmese", "python-reticulated", "vine-snake", "secret-a"],
      ["secret-a"],
      () => values.shift() ?? 0,
    );
    expect(result.hatchedId).toBe("vine-snake");
    expect(result.state.unlockedSnakeIds).toEqual([
      "python-burmese",
      "vine-snake",
    ]);
  });

  it("can reveal a secret color on a 10% hatch roll", () => {
    const values = [0.05, 0];
    const result = applyQuizAnswer(
      { xp: 40, hatchProgress: 4, unlockedSnakeIds: ["python-burmese"] },
      true,
      ["python-burmese", "python-reticulated", "secret-a"],
      ["secret-a"],
      () => values.shift() ?? 0,
    );
    expect(result.hatchedId).toBe("secret-a");
    expect(result.state.unlockedSnakeIds).toContain("secret-a");
  });

  it("keeps secret colors reachable after all regular variants are collected", () => {
    const result = applyQuizAnswer(
      { xp: 40, hatchProgress: 4, unlockedSnakeIds: ["regular-a"] },
      true,
      ["regular-a", "secret-a"],
      ["secret-a"],
      () => 0.99,
    );
    expect(result.hatchedId).toBe("secret-a");
  });
});

describe("persisted app data validation", () => {
  it("accepts well-shaped data and legacy data that can be normalized", () => {
    expect(isAppData(validData)).toBe(true);
    const legacy = {
      schemaVersion: 1,
      hasOnboarded: false,
      tasks: [
        {
          id: "task-1",
          title: "อ่านประวัติเขางู",
          category: "เรียนรู้",
          status: "open",
          createdAt: "2026-11-07T00:00:00.000Z",
          reminder: "none",
        },
      ],
      xp: 0,
      hatchProgress: 0,
      unlockedSnakeIds: ["python-burmese"],
      learnedLessonIds: [],
      settings: validData.settings,
    };
    expect(isAppData(legacy)).toBe(true);
  });

  it("rejects malformed nested tasks, settings, and progress", () => {
    expect(isAppData({ ...validData, tasks: [null] })).toBe(false);
    expect(
      isAppData({
        ...validData,
        tasks: [{ ...validData.tasks[0], status: "finished" }],
      }),
    ).toBe(false);
    expect(
      isAppData({
        ...validData,
        settings: { ...validData.settings, largeText: "yes" },
      }),
    ).toBe(false);
    expect(isAppData({ ...validData, hatchProgress: 99 })).toBe(false);
  });

  it("keeps mission records JSON-serializable for local storage", () => {
    const task = { ...validData.tasks[0], reminderStatus: "none" };
    expect(JSON.parse(JSON.stringify(task))).toEqual(task);
  });
});
