import { format, isToday, isYesterday, differenceInMinutes, differenceInHours } from "date-fns";

/**
 * Formata uma data de forma inteligente e relativa ao tempo atual.
 * Ex: "10 minutos atrás", "Hoje, 15:30", "Ontem, 09:00", "25/12/2024".
 * @param date A data a ser formatada (pode ser um objeto Date, string ou timestamp).
 * @returns A string da data formatada.
 */
export function formatSmartTime(date: Date | string | number): string {
  const dateToFormat = new Date(date);
  const now = new Date();

  const diffMinutes = differenceInMinutes(now, dateToFormat);
  const diffHours = differenceInHours(now, dateToFormat);

  if (diffMinutes < 1) {
    return "agora mesmo";
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} minuto${diffMinutes > 1 ? "s" : ""} atrás`;
  }
  if (diffHours < 2) {
    return `1 hora atrás`;
  }

  if (isToday(dateToFormat)) {
    return `Hoje, ${format(dateToFormat, "HH:mm")}`;
  }
  if (isYesterday(dateToFormat)) {
    return `Ontem, ${format(dateToFormat, "HH:mm")}`;
  }

  return format(dateToFormat, "dd/MM/yyyy");
}

export function maskDate(value: string): string {
  let v = value.replace(/\D/g, "");
  if (v.length > 8) v = v.slice(0, 8);
  if (v.length >= 5) v = `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
  else if (v.length >= 3) v = `${v.slice(0, 2)}/${v.slice(2)}`;
  return v;
}

export function isValidDate(dateStr: string): boolean {
  if (dateStr.length !== 10) return false;
  const [d, m, y] = dateStr.split("/");
  const numY = Number(y);
  if (numY < 1900 || numY > 9999) return false;
  const date = new Date(numY, Number(m) - 1, Number(d));
  return date.getFullYear() === numY && date.getMonth() === Number(m) - 1 && date.getDate() === Number(d);
}

export function convertToApiFormat(dateStr: string): string | undefined {
  if (!isValidDate(dateStr)) return undefined;
  const [d, m, y] = dateStr.split("/");
  return `${y}-${m}-${d}`;
}
