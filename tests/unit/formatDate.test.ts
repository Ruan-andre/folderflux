import { describe, it, expect, vi, afterEach } from "vitest";
import { maskDate, isValidDate, convertToApiFormat, formatSmartTime } from "@renderer/functions/formatDate";

afterEach(() => vi.useRealTimers());

describe("maskDate", () => {
  it("aplica a máscara dd/MM/yyyy conforme o usuário digita", () => {
    expect(maskDate("1")).toBe("1");
    expect(maskDate("15")).toBe("15");
    expect(maskDate("153")).toBe("15/3");
    expect(maskDate("1503")).toBe("15/03");
    expect(maskDate("15032026")).toBe("15/03/2026");
  });

  it("descarta caracteres não numéricos e o excedente de 8 dígitos", () => {
    expect(maskDate("15/03/2026")).toBe("15/03/2026");
    expect(maskDate("abc15março032026999")).toBe("15/03/2026");
  });
});

describe("isValidDate", () => {
  it("aceita datas reais no formato completo", () => {
    expect(isValidDate("29/02/2024")).toBe(true); // ano bissexto
    expect(isValidDate("31/12/1999")).toBe(true);
  });

  it("rejeita datas inexistentes e formatos incompletos", () => {
    expect(isValidDate("29/02/2025")).toBe(false); // 2025 não é bissexto
    expect(isValidDate("31/04/2026")).toBe(false); // abril tem 30 dias
    expect(isValidDate("15/13/2026")).toBe(false); // mês inválido
    expect(isValidDate("15/03/26")).toBe(false); // incompleto
    expect(isValidDate("")).toBe(false);
  });

  it("rejeita anos fora da faixa aceita", () => {
    expect(isValidDate("01/01/1899")).toBe(false);
  });
});

describe("convertToApiFormat", () => {
  it("converte dd/MM/yyyy para yyyy-MM-dd", () => {
    expect(convertToApiFormat("15/03/2026")).toBe("2026-03-15");
  });

  it("retorna undefined para data inválida", () => {
    expect(convertToApiFormat("31/02/2026")).toBeUndefined();
    expect(convertToApiFormat("15/03/26")).toBeUndefined();
  });
});

describe("formatSmartTime", () => {
  const agora = new Date(2026, 2, 15, 12, 0, 0);
  const minutosAtras = (n: number) => new Date(agora.getTime() - n * 60 * 1000);

  it("descreve intervalos recentes em linguagem relativa", () => {
    vi.useFakeTimers();
    vi.setSystemTime(agora);

    expect(formatSmartTime(minutosAtras(0))).toBe("agora mesmo");
    expect(formatSmartTime(minutosAtras(1))).toBe("1 minuto atrás");
    expect(formatSmartTime(minutosAtras(30))).toBe("30 minutos atrás");
    expect(formatSmartTime(minutosAtras(90))).toBe("1 hora atrás");
  });

  it("usa 'Hoje' e 'Ontem' com o horário", () => {
    vi.useFakeTimers();
    vi.setSystemTime(agora);

    expect(formatSmartTime(new Date(2026, 2, 15, 3, 30))).toBe("Hoje, 03:30");
    expect(formatSmartTime(new Date(2026, 2, 14, 9, 0))).toBe("Ontem, 09:00");
  });

  it("cai para dd/MM/yyyy em datas mais antigas", () => {
    vi.useFakeTimers();
    vi.setSystemTime(agora);

    expect(formatSmartTime(new Date(2025, 11, 25, 10, 0))).toBe("25/12/2025");
  });
});
