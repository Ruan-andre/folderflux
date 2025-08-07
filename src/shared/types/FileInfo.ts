type FileInfo = {
  name: string;
  nameWithExtension: string;
  size: number;
  ctime: Date;
  mtime: Date;
  fullPath: string;
  parentDirectory: string;
  extension: string;
};

export default FileInfo;
