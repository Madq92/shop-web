export type PageReq = {
  pageSize: number;
  pageNum: number;
};

// 定义返回数据的类型
export type ResponseDataType<T> = {
  errorCode: string | null;
  data: T;
  errorMessage: string | null;
  success: boolean;
};

export type PageDataType<T> = {
  records: T[];
  total: number;
  size: number;
  current: number;
};
