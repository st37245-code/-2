import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  cancelTaskReminders,
  requestNotificationPermission,
  scheduleTaskReminder,
} from "../lib/reminders";

const mocks = vi.hoisted(() => ({
  platform: { OS: "android" },
  getPermissionsAsync: vi.fn(),
  requestPermissionsAsync: vi.fn(),
  scheduleNotificationAsync: vi.fn(),
  cancelAllScheduledNotificationsAsync: vi.fn(),
}));
vi.mock("react-native", () => ({ Platform: mocks.platform }));
vi.mock("expo-notifications", () => ({
  getPermissionsAsync: mocks.getPermissionsAsync,
  requestPermissionsAsync: mocks.requestPermissionsAsync,
  scheduleNotificationAsync: mocks.scheduleNotificationAsync,
  cancelAllScheduledNotificationsAsync:
    mocks.cancelAllScheduledNotificationsAsync,
  SchedulableTriggerInputTypes: { TIME_INTERVAL: "timeInterval" },
}));

beforeEach(() => {
  vi.resetAllMocks();
  mocks.platform.OS = "android";
  mocks.getPermissionsAsync.mockResolvedValue({ status: "granted" });
  mocks.scheduleNotificationAsync.mockResolvedValue("notification-1");
  mocks.cancelAllScheduledNotificationsAsync.mockResolvedValue(undefined);
});

describe("local reminder adapter", () => {
  it("does not call native notification APIs on Web Preview", async () => {
    mocks.platform.OS = "web";
    expect(await scheduleTaskReminder("เรียนรู้", "in-hour")).toBe(
      "unsupported",
    );
    expect(await requestNotificationPermission()).toBe("unsupported");
    expect(mocks.scheduleNotificationAsync).not.toHaveBeenCalled();
  });
  it("schedules a one-hour reminder when permission is granted", async () => {
    expect(await scheduleTaskReminder("อ่านประวัติ", "in-hour")).toBe(
      "scheduled",
    );
    expect(mocks.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        trigger: { type: "timeInterval", seconds: 3600, repeats: false },
      }),
    );
  });
  it("does not schedule when permission is denied", async () => {
    mocks.getPermissionsAsync.mockResolvedValue({ status: "denied" });
    mocks.requestPermissionsAsync.mockResolvedValue({ status: "denied" });
    expect(await scheduleTaskReminder("เรียนรู้", "tomorrow")).toBe("denied");
    expect(mocks.scheduleNotificationAsync).not.toHaveBeenCalled();
  });
  it("returns failed for a native scheduling exception", async () => {
    mocks.scheduleNotificationAsync.mockRejectedValue(
      new Error("device error"),
    );
    expect(await scheduleTaskReminder("เรียนรู้", "tomorrow")).toBe("failed");
  });
  it("cancels pending notifications when reminders are disabled", async () => {
    expect(await cancelTaskReminders()).toBe(true);
    expect(mocks.cancelAllScheduledNotificationsAsync).toHaveBeenCalledOnce();
  });
});
