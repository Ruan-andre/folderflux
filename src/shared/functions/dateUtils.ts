import { PT_BR_MONTH_NAMES } from "./constants";

/**
 * Converte uma data no formato "YYYY-MM-DD" para um objeto Date no fuso horário local,
 * com horário customizável (útil para definir início/fim de dia em filtros).
 */
export function parseLocalDate(
  dateStr: string,
  hours: number,
  minutes: number,
  seconds: number,
  ms: number
): Date {
  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  return new Date(
    parseInt(yearStr, 10),
    parseInt(monthStr, 10) - 1,
    parseInt(dayStr, 10),
    hours,
    minutes,
    seconds,
    ms
  );
}

/**
 * Formata um timestamp de início de mês para exibição no gráfico (ex: "jan/26").
 */
export function formatMonthLabel(timestamp: number): string {
  const date = new Date(timestamp);
  return `${PT_BR_MONTH_NAMES[date.getMonth()]}/${date.getFullYear().toString().substring(2)}`;
}
