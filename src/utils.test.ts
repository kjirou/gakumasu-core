import { validateNumberInRange } from "./utils";

describe("validateNumberInRange", () => {
  const testCases: Array<{
    args: Parameters<typeof validateNumberInRange>;
    expected: ReturnType<typeof validateNumberInRange>;
  }> = [
    {
      args: [1, { min: 1 }],
      expected: true,
    },
    {
      args: [0, { min: 1 }],
      expected: false,
    },
    {
      args: [1, { max: 1 }],
      expected: true,
    },
    {
      args: [2, { max: 1 }],
      expected: false,
    },
    {
      args: [1, { min: 1, max: 3 }],
      expected: true,
    },
    {
      args: [3, { min: 1, max: 3 }],
      expected: true,
    },
    {
      args: [0, { min: 1, max: 3 }],
      expected: false,
    },
    {
      args: [4, { min: 1, max: 3 }],
      expected: false,
    },
  ];
  test.each(testCases)(
    "$args.0, $args.1 => $expected",
    ({ args, expected }) => {
      expect(validateNumberInRange(...args)).toBe(expected);
    },
  );
});
