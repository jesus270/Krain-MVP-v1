import { db } from "../db";

describe("Database", () => {
  it("should have a valid database instance", () => {
    expect(db).toBeDefined();
  });
});
