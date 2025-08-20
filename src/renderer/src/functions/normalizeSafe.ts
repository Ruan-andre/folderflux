/* eslint-disable @typescript-eslint/no-explicit-any */
function normalizeSafe(obj: any): any {
  if (obj === undefined) return undefined;

  // mantém Date
  if (obj instanceof Date) return new Date(obj);

  // mantém BigInt
  if (typeof obj === "bigint") return obj;

  // mantém Map
  if (obj instanceof Map) {
    return new Map(Array.from(obj.entries()).map(([k, v]) => [normalizeSafe(k), normalizeSafe(v)]));
  }

  // mantém Set
  if (obj instanceof Set) {
    return new Set(Array.from(obj).map((v) => normalizeSafe(v)));
  }

  // arrays → normaliza cada item
  if (Array.isArray(obj)) {
    return obj.map((v) => normalizeSafe(v));
  }

  // objetos comuns → remove undefined
  if (obj && typeof obj === "object") {
    const normalized: any = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined) {
        normalized[k] = normalizeSafe(v);
      }
    }
    return normalized;
  }

  return obj; // valores primitivos
}

export default normalizeSafe;
