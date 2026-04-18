import type { Record } from "@classified/shared";

const TWO_PART_TLDS = new Set([
  "co.uk", "com.au", "co.jp", "co.nz", "com.br",
  "co.za", "com.mx", "com.sg", "com.tr", "com.ar",
  "co.in", "co.il", "com.hk", "ac.uk", "gov.uk",
]);

export function normalizeHostname(host: string): string {
  return host.trim().toLowerCase().replace(/^www\./, "");
}

function parseSite(site: string): string {
  const trimmed = site.trim().toLowerCase();
  if (!trimmed) return "";
  if (trimmed.includes("://")) {
    try {
      return normalizeHostname(new URL(trimmed).hostname);
    } catch {
      return trimmed;
    }
  }
  return trimmed.replace(/^www\./, "");
}

function registrableDomain(host: string): string {
  const parts = host.split(".");
  if (parts.length < 2) return host;
  const lastTwo = parts.slice(-2).join(".");
  const lastThree = parts.slice(-3).join(".");
  if (parts.length >= 3 && TWO_PART_TLDS.has(lastTwo)) return lastThree;
  return lastTwo;
}

type Rank = 0 | 1 | 2;

function rankFor(hostNorm: string, siteNorm: string): Rank | null {
  if (!siteNorm) return null;
  if (hostNorm === siteNorm) return 0;
  const regDomain = registrableDomain(hostNorm);
  if (regDomain === siteNorm) return 1;
  if (hostNorm.includes(siteNorm)) return 2;
  return null;
}

export function findMatches(currentHostname: string, records: Record[]): Record[] {
  const hostNorm = normalizeHostname(currentHostname);
  const scored: Array<{ record: Record; rank: Rank }> = [];
  for (const r of records) {
    if (!r.site) continue;
    const siteNorm = parseSite(r.site);
    const rank = rankFor(hostNorm, siteNorm);
    if (rank !== null) scored.push({ record: r, rank });
  }
  scored.sort((a, b) => a.rank - b.rank);
  return scored.slice(0, 3).map((s) => s.record);
}
