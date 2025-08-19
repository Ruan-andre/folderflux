export function friendlyFsError(error: unknown): string {
  const fsErr = error as NodeJS.ErrnoException;

  if (!fsErr || !fsErr.code) {
    return "Erro desconhecido no sistema de arquivos.";
  }

  switch (fsErr.code) {
    case "EBUSY":
      return "O arquivo ou diretório está em uso por outro processo.";
    case "ENOENT":
      return "Arquivo ou diretório não encontrado.";
    case "EACCES":
    case "EPERM":
      return "Permissão negada para acessar ou modificar o arquivo.";
    case "EEXIST":
      return "Já existe um arquivo ou diretório no destino.";
    case "EISDIR":
      return "O destino é um diretório, não um arquivo.";
    case "ENOTDIR":
      return "Parte do caminho esperado como diretório não é um diretório.";
    case "ENOTEMPTY":
      return "Não é possível substituir um diretório que não está vazio.";
    case "ENOSPC":
      return "Sem espaço disponível no dispositivo de destino.";
    case "EROFS":
      return "O sistema de arquivos é somente leitura.";
    case "EINVAL":
      return "Nome de arquivo ou diretório inválido.";
    default:
      return `Erro inesperado do sistema de arquivos: ${fsErr.message}`;
  }
}
