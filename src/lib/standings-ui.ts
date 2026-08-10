import type { StandingTable } from "./types";

const TYPE_LABELS: Record<string, string> = {
  TOTAL: "Generale",
  HOME: "Casa",
  AWAY: "Trasferta",
};

/** GROUP_A → Gruppo A, GROUP_1 → Gruppo 1 */
export function formatGroupLabel(group: string | null | undefined): string | null {
  if (!group) return null;
  const cleaned = group.replace(/^GROUP[_-]?/i, "").replace(/_/g, " ").trim();
  if (!cleaned) return group;
  return `Gruppo ${cleaned.toUpperCase()}`;
}

export function formatStandingType(type: string): string {
  return TYPE_LABELS[type] ?? type;
}

export function standingSectionTitle(table: StandingTable): string {
  const group = formatGroupLabel(table.group);
  const type = formatStandingType(table.type);
  const stage =
    table.stage && table.stage !== "REGULAR_SEASON"
      ? table.stage.replace(/_/g, " ").toLowerCase()
      : null;

  if (group && table.type === "TOTAL") {
    return stage ? `${group} · ${stage}` : group;
  }
  if (group) return `${group} — ${type}`;
  if (stage) return `${type} · ${stage}`;
  return type;
}

export function standingSectionId(table: StandingTable, index: number): string {
  const parts = [
    table.group?.toLowerCase().replace(/_/g, "-"),
    table.type.toLowerCase(),
    table.stage?.toLowerCase().replace(/_/g, "-"),
    String(index),
  ].filter(Boolean);
  return parts.join("-");
}

/**
 * Ordine UI: prima i TOTAL per gruppo (A,B,C...),
 * poi HOME/AWAY senza gruppo, infine il resto.
 */
export function orderStandingTables(tables: StandingTable[]): StandingTable[] {
  const score = (t: StandingTable) => {
    const groupRank = t.group
      ? t.group.charCodeAt(t.group.length - 1)
      : 0;
    const typeRank =
      t.type === "TOTAL" ? 0 : t.type === "HOME" ? 1 : t.type === "AWAY" ? 2 : 3;
    const hasGroup = t.group ? 0 : 1;
    return hasGroup * 1000 + typeRank * 100 + groupRank;
  };
  return [...tables].sort((a, b) => score(a) - score(b));
}

export function groupJumpLinks(tables: StandingTable[]) {
  return orderStandingTables(tables)
    .filter((t) => t.table.length > 0)
    .map((t, index) => ({
      id: standingSectionId(t, index),
      label: standingSectionTitle(t),
    }));
}
