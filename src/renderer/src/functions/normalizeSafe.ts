/**
 * Clona um valor removendo chaves com `undefined` de objetos comuns, preservando
 * `Date`, `Map`, `Set` e `BigInt`.
 *
 * Necessário antes de enviar payloads pelo IPC do Electron: o algoritmo de
 * clonagem estruturada não aceita `undefined` como valor de propriedade em
 * alguns caminhos e alguns objetos perdem o tipo na travessia.
 */
function normalizeUnknown(value: unknown): unknown {
  if (value === undefined) return undefined;

  // mantém Date
  if (value instanceof Date) return new Date(value);

  // mantém BigInt
  if (typeof value === "bigint") return value;

  // mantém Map
  if (value instanceof Map) {
    return new Map(
      Array.from(value.entries()).map(([key, item]) => [normalizeUnknown(key), normalizeUnknown(item)])
    );
  }

  // mantém Set
  if (value instanceof Set) {
    return new Set(Array.from(value).map((item) => normalizeUnknown(item)));
  }

  // arrays → normaliza cada item
  if (Array.isArray(value)) {
    return value.map((item) => normalizeUnknown(item));
  }

  // objetos comuns → remove undefined
  if (value !== null && typeof value === "object") {
    const normalized: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      if (item !== undefined) {
        normalized[key] = normalizeUnknown(item);
      }
    }
    return normalized;
  }

  return value; // valores primitivos e null
}

function normalizeSafe<T>(value: T): T {
  return normalizeUnknown(value) as T;
}

export default normalizeSafe;
