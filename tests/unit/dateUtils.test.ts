import { describe, it, expect } from "vitest";
import { parseLocalDate, formatMonthLabel } from "~/src/shared/functions/dateUtils";

describe("parseLocalDate", () => {
  it("interpreta a string como data local, não UTC", () => {
    const d = parseLocalDate("2026-03-15", 0, 0, 0, 0);
    // Se fosse `new Date("2026-03-15")` (UTC), em UTC-3 o dia local seria 14.
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(2);
    expect(d.getDate()).toBe(15);
  });

  it("aplica o horário informado (útil para início/fim de dia em filtros)", () => {
    const fim = parseLocalDate("2026-03-15", 23, 59, 59, 999);
    expect(fim.getHours()).toBe(23);
    expect(fim.getMinutes()).toBe(59);
    expect(fim.getSeconds()).toBe(59);
    expect(fim.getMilliseconds()).toBe(999);
  });
});

describe("formatMonthLabel", () => {
  it("formata como mes/AA em pt-BR", () => {
    const jan = new Date(2026, 0, 1).getTime();
    const dez = new Date(2025, 11, 1).getTime();
    expect(formatMonthLabel(jan)).toBe("jan/26");
    expect(formatMonthLabel(dez)).toBe("dez/25");
  });
});
