/**
 * Basic test to verify the testing setup works
 */

describe("Basic Testing Setup", () => {
  it("should pass a simple test", () => {
    expect(true).toBe(true);
  });

  it("should handle basic math", () => {
    expect(1 + 1).toBe(2);
  });

  it("should work with strings", () => {
    expect("hello").toContain("ell");
  });
});
