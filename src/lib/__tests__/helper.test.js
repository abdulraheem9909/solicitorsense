import { getInitials, getTimeOfDay } from "@/lib/helper";

describe("getInitials", () => {
  it.each([
    ["Jane Smith", "JS"],
    ["jane", "J"],
    ["Mary Jane Watson", "MJ"],
    ["", ""],
    [undefined, ""],
  ])("%s -> %s", (name, expected) => {
    expect(getInitials(name)).toBe(expected);
  });
});

describe("getTimeOfDay", () => {
  afterEach(() => jest.useRealTimers());

  it.each([
    [5, "morning"],
    [11, "morning"],
    [12, "afternoon"],
    [16, "afternoon"],
    [17, "evening"],
    [20, "evening"],
    [21, "night"],
    [2, "night"],
  ])("hour %i is %s", (hour, expected) => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 0, 1, hour, 30));
    expect(getTimeOfDay()).toBe(expected);
  });
});
