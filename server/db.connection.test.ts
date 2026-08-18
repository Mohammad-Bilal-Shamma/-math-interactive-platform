import { describe, expect, it } from "vitest";
import { buildDatabaseConnection } from "./db";

describe("Aiven MySQL connection configuration", () => {
  it("converts an Aiven URI into an encrypted mysql2 connection configuration", () => {
    const connection = buildDatabaseConnection("mysql://student:password@mysql-project.aivencloud.com:22515/defaultdb?ssl-mode=REQUIRED");

    expect(connection).toMatchObject({
      host: "mysql-project.aivencloud.com",
      port: 22515,
      user: "student",
      password: "password",
      database: "defaultdb",
      ssl: { rejectUnauthorized: false },
    });
  });

  it("preserves an ordinary MySQL URL for existing local and managed deployments", () => {
    const connection = "mysql://root:password@127.0.0.1:3306/nuqta";
    expect(buildDatabaseConnection(connection)).toBe(connection);
  });
});
