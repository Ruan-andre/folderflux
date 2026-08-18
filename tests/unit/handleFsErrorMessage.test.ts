import { describe, it, expect } from "vitest";
import { friendlyFsError } from "~/src/shared/functions/handleFsErrorMessage";

describe("friendlyFsError", () => {
  it("retorna mensagem genérica quando o erro é nulo ou não tem code", () => {
    expect(friendlyFsError(null)).toBe("Erro desconhecido no sistema de arquivos.");
    expect(friendlyFsError(undefined)).toBe("Erro desconhecido no sistema de arquivos.");
    expect(friendlyFsError(new Error("boom"))).toBe("Erro desconhecido no sistema de arquivos.");
  });

  it.each([
    ["EBUSY", "O arquivo ou diretório está em uso por outro processo."],
    ["ENOENT", "Arquivo ou diretório não encontrado."],
    ["EACCES", "Permissão negada para acessar ou modificar o arquivo."],
    ["EPERM", "Permissão negada para acessar ou modificar o arquivo."],
    ["EEXIST", "Já existe um arquivo ou diretório no destino."],
    ["EISDIR", "O destino é um diretório, não um arquivo."],
    ["ENOTDIR", "Parte do caminho esperado como diretório não é um diretório."],
    ["ENOTEMPTY", "Não é possível substituir um diretório que não está vazio."],
    ["ENOSPC", "Sem espaço disponível no dispositivo de destino."],
    ["EROFS", "O sistema de arquivos é somente leitura."],
    ["EINVAL", "Nome de arquivo ou diretório inválido."],
  ])("traduz %s para pt-BR", (code, expected) => {
    const err = Object.assign(new Error("erro original"), { code });
    expect(friendlyFsError(err)).toBe(expected);
  });

  it("inclui a mensagem original em códigos não mapeados", () => {
    const err = Object.assign(new Error("algo estranho"), { code: "EWEIRD" });
    expect(friendlyFsError(err)).toContain("algo estranho");
  });
});
