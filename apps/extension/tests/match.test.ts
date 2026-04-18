import { describe, it, expect } from "vitest";
import { findMatches, normalizeHostname } from "@/lib/match";
import type { Record } from "@classified/shared";

function rec(site: string): Record {
  return {
    id: `id-${site}`,
    site,
    username: null,
    email: null,
    password: "x",
    icon: null,
    userId: "u",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as unknown as Record;
}

describe("normalizeHostname", () => {
  it("lowercases and strips www", () => {
    expect(normalizeHostname("WWW.GitHub.com")).toBe("github.com");
  });
  it("passes through bare domains", () => {
    expect(normalizeHostname("example.org")).toBe("example.org");
  });
});

describe("findMatches", () => {
  it("exact hostname match ranks highest", () => {
    const records = [rec("github.com"), rec("notgithub.com")];
    const m = findMatches("github.com", records);
    expect(m[0]?.site).toBe("github.com");
  });

  it("subdomain of current matches parent record site", () => {
    const records = [rec("github.com")];
    const m = findMatches("app.github.com", records);
    expect(m[0]?.site).toBe("github.com");
  });

  it("URL-shaped record.site extracts hostname", () => {
    const records = [rec("https://github.com/settings")];
    const m = findMatches("github.com", records);
    expect(m.length).toBe(1);
  });

  it("free-text site matches via substring", () => {
    const records = [rec("github")];
    const m = findMatches("github.com", records);
    expect(m.length).toBe(1);
  });

  it("returns at most 3 matches", () => {
    const records = [rec("github.com"), rec("github"), rec("https://github.com"), rec("gh"), rec("hub")];
    const m = findMatches("github.com", records);
    expect(m.length).toBeLessThanOrEqual(3);
  });

  it("handles co.uk two-part TLD as registrable domain", () => {
    const records = [rec("bbc.co.uk")];
    const m = findMatches("news.bbc.co.uk", records);
    expect(m.length).toBe(1);
  });

  it("ignores records with empty site", () => {
    const records = [{ ...rec("github.com"), site: "" } as Record];
    expect(findMatches("github.com", records)).toEqual([]);
  });

  it("is case-insensitive", () => {
    const records = [rec("GitHub.com")];
    expect(findMatches("github.com", records).length).toBe(1);
  });
});
