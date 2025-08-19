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
