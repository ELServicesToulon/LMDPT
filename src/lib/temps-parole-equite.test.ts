import { describe, expect, it } from "vitest";
import {
  countByFlag,
  flagLabel,
  indiceBarPercent,
  sortRowsByIndiceDesc,
  type EquityRow,
} from "./temps-parole-equite";
import data from "../data/temps-parole-equite.json";

describe("temps-parole-equite", () => {
  it("flagLabel maps known flags", () => {
    expect(flagLabel("over")).toMatch(/Sur/i);
    expect(flagLabel("under")).toMatch(/Sous/i);
    expect(flagLabel("in_band")).toMatch(/bande/i);
  });

  it("indiceBarPercent caps at 100", () => {
    expect(indiceBarPercent(1)).toBeCloseTo(33, 0);
    expect(indiceBarPercent(3)).toBe(100);
    expect(indiceBarPercent(10)).toBe(100);
    expect(indiceBarPercent(null)).toBe(0);
  });

  it("sortRowsByIndiceDesc orders by indice", () => {
    const rows: EquityRow[] = [
      { id: "a", label: "A", part_expo_pct: 1, part_poll_pct: 1, indice: 0.5, flag: "under" },
      { id: "b", label: "B", part_expo_pct: 1, part_poll_pct: 1, indice: 2, flag: "over" },
    ];
    expect(sortRowsByIndiceDesc(rows)[0]?.id).toBe("b");
  });

  it("snapshot data has rows and disclaimer", () => {
    expect(data.rows.length).toBeGreaterThanOrEqual(5);
    expect(data.disclaimer).toMatch(/Arcom|prédiction|DOE|démocratie|LMDPT/i);
    expect(data.formula).toMatch(/indice/i);
    const counts = countByFlag(data.rows as EquityRow[]);
    expect(Object.keys(counts).length).toBeGreaterThan(0);
  });
});
