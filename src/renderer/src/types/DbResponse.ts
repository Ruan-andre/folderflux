export type DbResponse<T = object> = {
  message: string;
  status: boolean;
  items?: T[];
};
