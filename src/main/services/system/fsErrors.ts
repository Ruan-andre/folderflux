/**
 * O app varre pastas do usuário enquanto elas mudam, então alguns erros fazem
 * parte da operação normal. Erro fora dessas categorias precisa propagar: se
 * for engolido, o RuleEngine registra a operação como sucesso.
 */

export function fsErrorCode(error: unknown): string | undefined {
  return (error as NodeJS.ErrnoException | null)?.code;
}

/** Pasta ou arquivo protegido pelo sistema operacional. */
export function isPermissionError(error: unknown): boolean {
  const code = fsErrorCode(error);
  return code === "EPERM" || code === "EACCES";
}

/** Item movido, renomeado ou excluído entre a listagem e o `stat`. */
export function isExpectedFsError(error: unknown): boolean {
  const code = fsErrorCode(error);
  return isPermissionError(error) || code === "ENOENT" || code === "ENOTDIR";
}
