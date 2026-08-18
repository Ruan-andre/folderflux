type DirInfo = {
  name: string;
  fullPath: string;
  parentDirectory: string;
  size: number;
  itemCount: number;
  isEmpty: boolean;
  ctime: Date;
  mtime: Date;
};

export default DirInfo;
